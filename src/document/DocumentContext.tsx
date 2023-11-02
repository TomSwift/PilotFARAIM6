import * as React from "react";
import { useCallback, useEffect, useReducer } from "react";
import { QuickSQLiteConnection, open } from "react-native-quick-sqlite";
import loadLocalRawResource from "react-native-local-resource";
import { htmlForElement } from "./htmlForElement";
import { SdItem, SdItemContent, SdItemGroup, SdItemType, SdToc, XElement } from "./types";

type Document = {
    db?: QuickSQLiteConnection;
    asset: (name: string) => Asset | undefined;
    documentPageCount: (docid: string) => Promise<number>;
    itemForDocumentPage: (docid: string, page: number) => Promise<SdItem>;
    htmlForDocumentPage: (docid: string, page: number) => Promise<string>;
    tocForRoot: (root?: SdItem) => Promise<SdToc>;
};

export const DocumentContext = React.createContext<Document | undefined>(undefined);

interface Asset {
    content: string;
    type: string;
}

enum ActionType {
    DATABASE_LOADED,
    ASSETS_LOADED,
}

interface DispatchDatabaseLoaded {
    type: ActionType.DATABASE_LOADED;
    db: QuickSQLiteConnection;
}

interface DispatchAssetsLoaded {
    type: ActionType.ASSETS_LOADED;
    assets: Record<string, Asset>;
}

type DocumentProviderAction = DispatchDatabaseLoaded | DispatchAssetsLoaded;

type DocumentProviderState = {
    db?: QuickSQLiteConnection;
    assets: Record<string, Asset>;
};

const reducer = (state: DocumentProviderState, action: DocumentProviderAction): DocumentProviderState => {
    switch (action.type) {
        case ActionType.DATABASE_LOADED:
            return { ...state, db: action.db };
        case ActionType.ASSETS_LOADED:
            return { ...state, assets: { ...state.assets, ...action.assets } };
    }
};

export function DocumentProvider({ children }: { children: React.ReactElement }) {
    const [state, dispatch] = useReducer(reducer, { assets: {} });

    useEffect(() => {
        const ldb = open({ name: "cfr.sqlite" });
        dispatch({ type: ActionType.DATABASE_LOADED, db: ldb });

        return () => {
            ldb?.close();
        };
    }, []);

    useEffect(() => {
        (async () => {
            const [cfrTemplate, pfa, rangyCore, rangySerializer, rangyClassApplier] = await Promise.all([
                loadLocalRawResource(require("./assets/cfr-template.html")),
                loadLocalRawResource(require("./assets/pfa.js_asset")),
                loadLocalRawResource(require("./assets/rangy-core.js_asset")),
                loadLocalRawResource(require("./assets/rangy-serializer.js_asset")),
                loadLocalRawResource(require("./assets/rangy-cssclassapplier.js_asset")),
            ]);

            dispatch({
                type: ActionType.ASSETS_LOADED,
                assets: {
                    "cfr-template.html": { content: cfrTemplate, type: "text/html" },
                    "pfa.js": { content: pfa, type: "text/javascript" },
                    "rangy-core.js": { content: rangyCore, type: "text/javascript" },
                    "rangy-serializer.js": { content: rangySerializer, type: "text/javascript" },
                    "rangy-cssclassapplier.js": { content: rangyClassApplier, type: "text/javascript" },
                },
            });
        })();
    }, []);

    const asset = useCallback(
        (name: string): Asset | undefined => {
            return state.assets[name];
        },
        [state.assets],
    );

    const itemForDocumentPage = useCallback(
        async (docid: string, index: number): Promise<SdItem> => {
            const result = await state.db?.executeAsync("SELECT rowid, * FROM sd_structure WHERE i = ? LIMIT 1", [
                index,
            ]);
            return result?.rows?.item(0);
        },
        [state.db],
    );

    const htmlForDocumentPage = useCallback(
        async (docid: string, page: number): Promise<string> => {
            const { l, r } = await itemForDocumentPage(docid, page);

            const result = await state.db?.executeAsync(
                "SELECT s.type, s.tag, s.title, s.r, c.content, s.refid, c.rowid FROM sd_structure s LEFT OUTER JOIN sd_content c ON s.rowid = c.rowid WHERE s.l BETWEEN ? AND ? ORDER BY l ASC",
                [l, r],
            );
            if (!result) {
                return "";
            }

            let root: XElement = { name: "div", content: [], r: Number.MAX_SAFE_INTEGER };

            let indentStack: Array<XElement> = [root];

            for (let i = 0, len = result.rows?._array.length || 0; i < len; i++) {
                const row: SdItemContent = result.rows?.item(i);

                while (indentStack[indentStack.length - 1].r < row.r) {
                    indentStack.pop();
                }
                let parent = indentStack[indentStack.length - 1];
                let element: XElement = parent;

                switch (row.type) {
                    case SdItemType.Content:
                        if (row.content) {
                            if (parent.attributes?.class === "listitem") {
                                indentStack.pop();
                                parent = indentStack[indentStack.length - 1];
                            }
                            parent.content.push(row.content);
                        }
                        break;
                    case SdItemType.ListItem:
                        const rn = result.rows?.item(i + 1);
                        let content;
                        if (rn && rn.type === SdItemType.Content) {
                            i++;
                            if (rn.content.startsWith("<p>")) {
                                content = rn.content.slice(3, -4);
                            } else {
                                content = rn.content;
                            }
                        }
                        content = `<p><b>${row.tag}</b> ${content}</p>`;
                        const div: XElement = {
                            name: "div",
                            attributes: { class: "listitem", id: row.refid },
                            content: [content],
                            r: row.r,
                        };
                        parent.content.push(div);
                        element = div;
                        break;
                    case SdItemType.Figure:
                    case SdItemType.Table:
                    default:
                        break;
                }
                indentStack.push(element);
            }

            // console.log(JSON.stringify(root, null, 3));

            const template = asset("cfr-template.html")?.content;
            const html = template?.replace(/\{CONTENT\}/, htmlForElement(root)) || "";
            return html;
        },
        [state.db, asset, itemForDocumentPage],
    );

    const documentPageCount = useCallback(
        async (_: /*docid*/ string): Promise<number> => {
            const result = state.db?.execute("SELECT COUNT(*) FROM sd_structure WHERE type IN (7,8,9)");
            return result?.rows?.item(0)["COUNT(*)"] || 0;
        },
        [state.db],
    );

    const rootToc = useCallback(async () => {
        const tocItemTypes = [5, 6];
        const rootType = tocItemTypes[0];
        const parentTypes = Array.from(Array(rootType - 1).keys()).map((x) => x + 1);
        const toc: Array<any> = [];
        const sectionHeaders: Record<number, any> = {};

        const pidsResult = await state.db?.executeAsync(
            "SELECT pid, l, r FROM sd_structure WHERE type = ? GROUP BY pid ORDER BY l",
            [rootType],
        );
        pidsResult?.rows?._array.forEach(async (item: { pid: number; l: number; r: number }) => {
            const sectionHeader: SdItemGroup = {
                index: toc.length,
                parents: {},
                children: [],
            };

            toc.push(sectionHeader);

            sectionHeaders[item.pid] = sectionHeader;

            const parentsResult = await state.db?.executeAsync(
                `SELECT rowid, * FROM sd_structure WHERE type IN ( ${parentTypes.join(",")}) AND +l < ? AND +r > ?`,
                [item.l, item.r],
            );

            parentsResult?.rows?._array.forEach((parent: SdItem) => {
                sectionHeader.parents[parent.type] = parent;
            });
        });

        const partsResult = await state.db?.executeAsync(
            "SELECT s.rowid, s.* FROM sd_structure s WHERE type = ? ORDER BY l",
            [rootType],
        );
        partsResult?.rows?._array.forEach((part: SdItem) => {
            const sectionHeader = sectionHeaders[part.pid];
            sectionHeader.children.push(part);
        });
        return toc;
    }, [state.db]);

    const parentsForDocItem = useCallback(
        async (docItem: SdItem) => {
            const parents: Array<SdItem> = [];

            while (true) {
                const rs = await state.db?.executeAsync(`SELECT rowid, * FROM sd_structure WHERE rowid = ? LIMIT 1`, [
                    docItem.pid,
                ]);
                if (!rs?.rows?.length) {
                    return parents;
                } else {
                    docItem = rs.rows.item(0) as SdItem;
                    parents.splice(0, 0, docItem);
                }
            }
        },
        [state.db],
    );

    const tocForRoot = useCallback(
        async (docItem?: SdItem) => {
            if (!docItem) {
                return rootToc();
            }

            const sectionHeader: SdItemGroup = {
                index: 0,
                parents: (await parentsForDocItem(docItem)).reduce(
                    (accumulator, p) => {
                        accumulator[p.type] = p;
                        return accumulator;
                    },
                    {
                        [docItem.type]: docItem,
                    },
                ),
                children: [],
            };

            const childTypes = [7, 8, 9].filter((x) => x >= docItem.type + 1);

            const rsChildren = await state.db?.executeAsync(
                `SELECT s.rowid, s.* FROM sd_structure s WHERE pid = ? AND type IN ( ${childTypes.join(",")} )`,
                [docItem.rowid],
            );

            rsChildren?.rows?._array.forEach((childItem: SdItem) => {
                sectionHeader.children.push({ ...childItem, isPageItem: true });
            });

            return [sectionHeader];

            /*




- (NSArray*) tocForDocItem: (SdItem*) docItem includeHidden: (BOOL) includeHidden
{
    NSMutableArray* toc = [NSMutableArray arrayWithCapacity:12];

    [self.dbq inDatabase: ^(FMDatabase *db)
    {
		
        @autoreleasepool {
        
			SdItemGroup* sectionHeader = [self.docItemGroupClass new];
			sectionHeader.index = [toc count];
			[toc addObject: sectionHeader];
			
//		NSLog( @"toc start" );
			
//		NSLog( @" toc parents l: %@ r:%@", docItem.l, docItem.r );
			[sectionHeader.parents setObject: docItem forKey: docItem.type];
			NSArray* parents = [self parentsForDocItem: docItem database: db];
			for ( SdItem* e in parents )
			{
				[sectionHeader.parents setObject: e forKey: e.type];
			}
        
        // child types
        NSMutableArray* childTypesArray = [NSMutableArray arrayWithCapacity:8];
        for ( int t = [docItem.type intValue] + 1 ; t <= [[self.pageItemTypes lastObject] intValue] ; t++ )
        {
            [childTypesArray addObject: [NSNumber numberWithInt: t]];
        }
        NSString* childTypes = [childTypesArray componentsJoinedByString: @","];
            
			
			// get all items below this item
//		NSLog( @" toc children		" );
			FMResultSet* rsChildren = nil;
			if ( YES == includeHidden )
			{
				rsChildren = [db executeQuery: [NSString stringWithFormat: @"SELECT s.rowid, s.*, hidden FROM sd_structure s LEFT OUTER JOIN doc_user.sd_toc_visibility t ON t.element_refid = s.refid WHERE s.type IN ( %@ ) AND pid = ?", childTypes], docItem.rowid];
			}
			else 
			{
				rsChildren = [db executeQuery: [NSString stringWithFormat: @"SELECT s.rowid, s.* FROM sd_structure s WHERE pid = ? AND type IN ( %@ ) AND refid NOT IN ( SELECT element_refid FROM doc_user.sd_toc_visibility )", childTypes], docItem.rowid];
			}
			while ( [rsChildren next] )
			{
            SdItem* e = [SdItem docItemOfClass: self.docItemClass fromResultSet: rsChildren];
            			
				[sectionHeader.children addObject: e];
			}
			
			[rsChildren close];
			
//		NSLog( @"toc end" );
        
		}
	}];

    return toc;
}
        */
        },
        [parentsForDocItem, rootToc, state.db],
    );

    return (
        <DocumentContext.Provider
            value={{ db: state.db, asset, documentPageCount, itemForDocumentPage, htmlForDocumentPage, tocForRoot }}
        >
            {children}
        </DocumentContext.Provider>
    );
}

import * as React from "react";
import { useCallback, useEffect, useReducer } from "react";
import { QuickSQLiteConnection, open } from "react-native-quick-sqlite";
import loadLocalRawResource from "react-native-local-resource";
import { htmlForElement } from "./htmlForElement";
import { XElement } from "./types";

enum SdItemType {
    Content = 100,
    ListItem = 101,
    Figure = 102,
    Table = 103,
}

type SdItem = {
    rowid: number;
    pid: number;
    refid: string;
    type: SdItemType | number;
    tag: string | null;
    title: string | null;
    l: number;
    r: number;
    p: number;
    i: number;
    content: string | null;
};

type SdItemContent = Omit<SdItem, "l" | "p" | "i" | "pid"> & { content: string | null };

type Document = {
    db?: QuickSQLiteConnection;
    asset: (name: string) => Asset | undefined;
    documentPageCount: (docid: string) => Promise<number>;
    itemForDocumentPage: (docid: string, page: number) => Promise<SdItem>;
    htmlForDocumentPage: (docid: string, page: number) => Promise<string>;
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
            return template?.replace(/\{CONTENT\}/, htmlForElement(root)) || "";
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

    return (
        <DocumentContext.Provider
            value={{ db: state.db, asset, documentPageCount, itemForDocumentPage, htmlForDocumentPage }}
        >
            {children}
        </DocumentContext.Provider>
    );
}

import {
    QuickSQLite,
    QuickSQLiteConnection,
    open,
} from "react-native-quick-sqlite";
import loadLocalRawResource from "react-native-local-resource";
import { htmlForElement } from "./htmlForElement";
import { SdItemContent, SdItemGroup, XElement } from "./types";
import { SdItem, SdItemType } from "./Item";

export abstract class Document<Item extends SdItem<any>> {
    protected abstract readonly _tocItemTypes: Array<number>;
    protected abstract readonly _pageTypes: Array<number>;
    private _htmlTemplateName: string;
    protected _htmlTemplate?: string;

    public static readonly docid: string;

    public readonly db: QuickSQLiteConnection;

    constructor(dbName: string, htmlTemplateName: string) {
        this.db = open({ name: dbName });
        this._htmlTemplateName = htmlTemplateName;
    }

    protected abstract item(item: Partial<Item>): Item;

    public async itemForDocumentPage(page: number): Promise<Item> {
        const result = await this.db?.executeAsync(
            "SELECT rowid, * FROM sd_structure WHERE i = ? LIMIT 1",
            [page]
        );

        return this.item(result?.rows?.item(0));
    }

    public async itemForDocumentRefid(refid: string): Promise<Item> {
        const result = await this.db?.executeAsync(
            "SELECT rowid, * FROM sd_structure WHERE refid = ? LIMIT 1",
            [refid]
        );
        return this.item(result?.rows?.item(0));
    }

    public async html(l: number, r: number): Promise<string> {
        const result = await this.db?.executeAsync(
            "SELECT s.type, s.tag, s.title, s.r, c.content, s.refid, c.rowid FROM sd_structure s LEFT OUTER JOIN sd_content c ON s.rowid = c.rowid WHERE s.l BETWEEN ? AND ? ORDER BY l ASC",
            [l, r]
        );
        if (!result) {
            return "WTF";
        }

        let root: XElement = {
            name: "div",
            content: [],
            r: Number.MAX_SAFE_INTEGER,
        };

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

        if (!this._htmlTemplate) {
            this._htmlTemplate = await loadLocalRawResource(
                require("./assets/cfr-template.html")
            );
        }

        const html =
            this._htmlTemplate?.replace(/\{CONTENT\}/, htmlForElement(root)) ||
            "";

        // console.log(root);
        return html;
    }

    public async htmlForDocumentPage(page: number): Promise<string> {
        const { l, r } = await this.itemForDocumentPage(page);
        return this.html(l, r);
    }

    public async htmlForDocumentRefid(refid: string): Promise<string> {
        const { l, r } = await this.itemForDocumentRefid(refid);
        return this.html(l, r);
    }

    public async documentPageCount(_: /*docid*/ string): Promise<number> {
        const result = this.db?.execute(
            `SELECT COUNT(*) FROM sd_structure WHERE type IN (${this._pageTypes.join(
                ","
            )})`
        );
        return result?.rows?.item(0)["COUNT(*)"] || 0;
    }

    public async rootToc() {
        const rootType = this._tocItemTypes[0];
        const parentTypes = Array.from(Array(rootType - 1).keys()).map(
            (x) => x + 1
        );
        const toc: Array<SdItemGroup<Item>> = [];
        const sectionHeaders: Record<number, any> = {};

        const pidsResult = await this.db?.executeAsync(
            "SELECT pid, l, r FROM sd_structure WHERE type = ? GROUP BY pid ORDER BY l",
            [rootType]
        );
        pidsResult?.rows?._array.forEach(
            async (item: { pid: number; l: number; r: number }) => {
                const sectionHeader: SdItemGroup<Item> = {
                    index: toc.length,
                    parents: {},
                    children: [],
                };

                toc.push(sectionHeader);

                sectionHeaders[item.pid] = sectionHeader;

                const parentsResult = await this.db?.executeAsync(
                    `SELECT rowid, * FROM sd_structure WHERE type IN ( ${parentTypes.join(
                        ","
                    )}) AND +l < ? AND +r > ?`,
                    [item.l, item.r]
                );

                parentsResult?.rows?._array.forEach((parent: Item) => {
                    sectionHeader.parents[parent.type] = this.item(parent);
                });
            }
        );

        const partsResult = await this.db?.executeAsync(
            "SELECT s.rowid, s.* FROM sd_structure s WHERE type = ? ORDER BY l",
            [rootType]
        );
        partsResult?.rows?._array.forEach((part: Item) => {
            const sectionHeader = sectionHeaders[part.pid];
            sectionHeader.children.push(this.item(part));
        });
        return toc;
    }

    public async parentsForDocItem(docItem: Item) {
        const parents: Array<Item> = [];

        while (true) {
            const rs = await this.db?.executeAsync(
                `SELECT rowid, * FROM sd_structure WHERE rowid = ? LIMIT 1`,
                [docItem.pid]
            );
            if (!rs?.rows?.length) {
                return parents;
            } else {
                docItem = this.item(rs.rows.item(0));
                parents.splice(0, 0, docItem);
            }
        }
    }

    public async tocForRoot(docItem?: Item): Promise<Array<SdItemGroup<Item>>> {
        if (!docItem) {
            return this.rootToc();
        }

        const sectionHeader: SdItemGroup<Item> = {
            index: 0,
            parents: (await this.parentsForDocItem(docItem)).reduce(
                (accumulator, p) => {
                    accumulator[p.type] = p;
                    return accumulator;
                },
                {
                    [docItem.type]: docItem,
                }
            ),
            children: [],
        };

        // any item type greater than the docItem.type up to the max pageType
        const childTypes = Array(
            this._pageTypes[this._pageTypes.length - 1] - docItem.type
        )
            .fill(0)
            .map((_, i) => docItem.type + i + 1);

        const rsChildren = await this.db?.executeAsync(
            `SELECT s.rowid, s.* FROM sd_structure s WHERE pid = ? AND type IN ( ${childTypes.join(
                ","
            )} )`,
            [docItem.rowid]
        );

        rsChildren?.rows?._array.forEach((childItem: Item) => {
            sectionHeader.children.push(
                this.item({
                    ...childItem,
                    isPageItem: childItem.i !== null ? true : undefined,
                })
            );
        });

        return [sectionHeader];
    }

    public splitContentRefid(refid: string) {
        console.log(`splitting refid: ${refid}`);
        var match = /(S|SF|X)(_)([0-9A-Z]+)[\\.]/.exec(refid);
        if (match) {
            const split = match.index + match.length;
            return {
                refid: refid.slice(0, split - 1),
                location: refid.slice(split),
            };
        } else {
            return {
                refid,
            };
        }
    }
}

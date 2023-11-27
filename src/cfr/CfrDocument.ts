import { Document } from "../document/Document";
import { SdItem, SdItemGroup } from "../document/types";
import { CfrItem, CfrItemType } from "./CfrItem";

export class CfrDocument extends Document<CfrItem> {
    protected readonly _tocItemTypes = [5, 6];
    protected readonly _pageTypes = [7, 8, 9];
    public static readonly docid = "FDFD560B-425F-4562-ABCE-673FF2E1E51D";

    constructor() {
        super("cfr.sqlite", "cfr-template.html");
    }

    protected item(item: Partial<SdItem<CfrItemType>>) {
        return new CfrItem(item);
    }

    public async tocForRoot(docItem?: CfrItem | undefined): Promise<any[]> {
        const toc = await super.tocForRoot(docItem);

        for (const group of toc) {
            for (const item of group.children.filter(
                (item: CfrItem) => item.type == CfrItemType.Subpart
            )) {
                const result = await this.db?.executeAsync(
                    `SELECT MIN( CAST( tag AS INTEGER) ) AS l, MAX( CAST( tag AS INTEGER) ) AS h FROM sd_structure WHERE ( pid = ? ) AND ( type = 8 ) `,
                    [item.rowid]
                );
                const l = result?.rows?.item(0)["l"];
                const h = result?.rows?.item(0)["h"];
                if (l < h) {
                    item.subitemTitle = `§§ ${l}-${h}`;
                } else if (l == h) {
                    item.subitemTitle = `§ ${l}`;
                }
            }
        }

        return toc;
    }
}

import { Document } from "../document/Document";
import { SdItem } from "../document/types";

export class CfrItem extends SdItem {
    public description() {
        var d = "";
        const cfrTitle = this.refid.match(/T_(?<title>[0-9]+)/)?.groups?.title;
        if (cfrTitle) {
            d += `${cfrTitle} CFR `;
        }

        const cfrPart = this.refid.match(/P_(?<part>[0-9]+)/)?.groups?.part;
        if (cfrPart) {
            d += `Part ${cfrPart} `;
        }

        const cfrSection =
            this.refid.match(/S_(?<section>[0-9]+)/)?.groups?.section;
        if (cfrSection) {
            d += `Section ${cfrSection} `;
        }

        if (cfrPart && cfrSection) {
            d += `(${cfrPart}.${cfrSection})`;
        }

        return d;
    }
}

export class CfrDocument extends Document {
    protected readonly _tocItemTypes = [5, 6];
    protected readonly _pageTypes = [7, 8, 9];
    public static readonly docid = "FDFD560B-425F-4562-ABCE-673FF2E1E51D";

    constructor() {
        super("cfr.sqlite", "cfr-template.html");
    }

    protected item(item: SdItem) {
        return new CfrItem(item);
    }

    public async itemForDocumentPage(page: number): Promise<SdItem> {
        const item = await super.itemForDocumentPage(page);
        item.description = function () {
            var d = "";
            const cfrTitle =
                this.refid.match(/T_(?<title>[0-9]+)/)?.groups?.title;
            if (cfrTitle) {
                d += `${cfrTitle} CFR `;
            }

            const cfrPart = this.refid.match(/P_(?<part>[0-9]+)/)?.groups?.part;
            if (cfrPart) {
                d += `Part ${cfrPart} `;
            }

            const cfrSection =
                this.refid.match(/S_(?<section>[0-9]+)/)?.groups?.section;
            if (cfrSection) {
                d += `Section ${cfrSection} `;
            }

            if (cfrPart && cfrSection) {
                d += `(${cfrPart}.${cfrSection})`;
            }

            return d;
        };

        return item;
    }
}

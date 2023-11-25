import { Document } from "../document/Document"
import { SdItem } from "../document/types";

export class AimItem extends SdItem {
    public description() {
        var d = "AIM ";
        const aimChapter = this.refid.match(/C_(?<chapter>[0-9]+)/)?.groups?.chapter;
        if (aimChapter) {
            d += `${aimChapter}-`;
        }

        const aimSection = this.refid.match(/S_(?<section>[0-9]+)/)?.groups?.section;
        if (aimSection) {
            d += `${aimSection}-`;
        }

        const aimParagraph = this.refid.match(/P_(?<paragraph>[0-9]+)/)?.groups?.paragraph;
        if (aimParagraph) {
            d += `${aimParagraph}`;
        }
        return d;
    } 
}

export class AimDocument extends Document {
    protected readonly _tocItemTypes = [2];
    protected readonly _pageTypes = [3,4];
    public static readonly docid = "9A7EC787-C7CF-48B8-AD01-F983FE0AB22A";

    protected item(item: Partial<SdItem>): SdItem {
        return new AimItem(item);
    }

    constructor() {
        super("aim.sqlite", "aim-template.html")
    }
}
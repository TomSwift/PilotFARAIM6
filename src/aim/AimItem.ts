import { SdItem } from "../document/types";

export class AimItem extends SdItem {
    public description() {
        var d = "AIM ";
        const aimChapter =
            this.refid.match(/C_(?<chapter>[0-9]+)/)?.groups?.chapter;
        if (aimChapter) {
            d += `${aimChapter}-`;
        }

        const aimSection =
            this.refid.match(/S_(?<section>[0-9]+)/)?.groups?.section;
        if (aimSection) {
            d += `${aimSection}-`;
        }

        const aimParagraph = this.refid.match(/P_(?<paragraph>[0-9]+)/)?.groups
            ?.paragraph;
        if (aimParagraph) {
            d += `${aimParagraph}`;
        }
        return d;
    }
}

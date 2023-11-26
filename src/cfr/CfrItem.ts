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

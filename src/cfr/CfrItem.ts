import { SdItem } from "../document/types";

export enum CfrItemType {
    Cfr = 0,
    Title = 1,
    Subtitle = 2,
    Chapter = 3,
    Subchapter = 4,
    Part = 5,
    Subpart = 6,
    Sfar = 7,
    Section = 8,
    Appendix = 9,
    Note = 10,
    Footnote = 11,
    Authority = 12,
}

export class CfrItem extends SdItem<CfrItemType> {
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

    public tagTitle(): string {
        switch (this.type) {
            case CfrItemType.Cfr:
                return "CFR";
            case CfrItemType.Title:
                return "Title";
            case CfrItemType.Subtitle:
                return "Subtitle";
            case CfrItemType.Chapter:
                return "Chapter";
            case CfrItemType.Subchapter:
                return "Subchapter";
            case CfrItemType.Part:
                return "Part";
            case CfrItemType.Subpart:
                return "Subpart";
            case CfrItemType.Sfar:
                return "Sfar";
            case CfrItemType.Section:
                return "Section";
            case CfrItemType.Appendix:
                return "Appendix";
        }
        return "";
    }

    public subitemsTitle(): string | null {
        return null;
    }
}

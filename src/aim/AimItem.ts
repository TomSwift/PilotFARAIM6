import { SdItem } from "../document/types";

export enum AimItemType {
    Aim = 0,
    Chapter = 1,
    Section = 2,
    Paragraph = 3,
    Appendix = 4,
    Callout = 10,
}

export class AimItem extends SdItem<AimItemType> {
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

    public tagTitle(): string {
        switch (this.type) {
            case AimItemType.Aim:
                return "AIM";
            case AimItemType.Chapter:
                return "Chapter";
            case AimItemType.Section:
                return "Section";
            case AimItemType.Paragraph:
                return "Paragraph";
            case AimItemType.Appendix:
                return "Appendix";
        }
        return "";
    }

    public subitemsTitle(): string | null {
        return null;
    }
}

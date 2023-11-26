import { Document } from "../document/Document";
import { SdItem } from "../document/types";
import { AimItem } from "./AimItem";

export class AimDocument extends Document {
    protected readonly _tocItemTypes = [2];
    protected readonly _pageTypes = [3, 4];
    public static readonly docid = "9A7EC787-C7CF-48B8-AD01-F983FE0AB22A";

    protected item(item: Partial<SdItem>): SdItem {
        return new AimItem(item);
    }

    constructor() {
        super("aim.sqlite", "aim-template.html");
    }
}

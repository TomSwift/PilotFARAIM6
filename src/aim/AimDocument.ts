import { Document } from "../document/Document"

export class AimDocument extends Document {
    protected readonly _tocItemTypes = [2];
    protected readonly _pageTypes = [3,4];
    public static readonly docid = "9A7EC787-C7CF-48B8-AD01-F983FE0AB22A";

    constructor() {
        super("aim.sqlite", "aim-template.html")
    }
}
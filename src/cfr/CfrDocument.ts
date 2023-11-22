import { Document } from "../document/Document"

export class CfrDocument extends Document {
    protected readonly _tocItemTypes = [5,6];
    protected readonly _pageTypes = [7,8,9];
    public static readonly docid = "FDFD560B-425F-4562-ABCE-673FF2E1E51D";

    constructor() {
        super("cfr.sqlite", "cfr-template.html")
    }
}
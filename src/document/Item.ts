export enum SdItemType {
    Content = 100,
    ListItem = 101,
    Figure = 102,
    Table = 103,
}

export abstract class SdItem<P> {
    protected _item: Partial<SdItem<P>>;
    public subitemTitle?: string;

    public constructor(item: Partial<SdItem<P>>) {
        this._item = item;
    }
    public get rowid(): number {
        return this._item.rowid!;
    }
    public get pid(): number {
        return this._item.pid!;
    }
    public get refid(): string {
        return this._item.refid!;
    }
    public get type(): P | SdItemType | number {
        return this._item.type!;
    }
    public get tag(): string | null {
        return this._item.tag!;
    }
    public get title(): string | null {
        return this._item.title!;
    }
    public get l(): number {
        return this._item.l!;
    }
    public get r(): number {
        return this._item.r!;
    }
    public get p(): number {
        return this._item.p!;
    }
    public get i(): number {
        return this._item.i!;
    }
    public get content(): string | null {
        return this._item.content!;
    }
    public get isPageItem(): boolean {
        return this.i !== null ? true : false;
    }
    public abstract description(): string;
    public abstract tagTitle(): string;
}

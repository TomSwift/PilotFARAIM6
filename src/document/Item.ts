export enum SdItemType {
    Content = 100,
    ListItem = 101,
    Figure = 102,
    Table = 103,
}

export abstract class SdItem<P> {
    public rowid!: number;
    public pid!: number;
    public refid!: string;
    public type!: P | SdItemType | number;
    public tag!: string | null;
    public title!: string | null;
    public l!: number;
    public r!: number;
    public p!: number;
    public i!: number;
    public content!: string | null;
    public subitemTitle?: string;
    public isPageItem?: true;
    public constructor(item: Partial<SdItem<P>>) {
        Object.assign(this, item);
    }
    public abstract description(): string;
    public abstract tagTitle(): string;
}

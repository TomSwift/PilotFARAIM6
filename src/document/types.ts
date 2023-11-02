export type XElement = {
    name: string;
    attributes?: Record<string, string>;
    content: Array<XElement | string>;
    r: number;
};

export enum SdItemType {
    Content = 100,
    ListItem = 101,
    Figure = 102,
    Table = 103,
}

export type SdItem = {
    rowid: number;
    pid: number;
    refid: string;
    type: SdItemType | number;
    tag: string | null;
    title: string | null;
    l: number;
    r: number;
    p: number;
    i: number;
    content: string | null;
    isPageItem?: true;
};

export type SdItemContent = Omit<SdItem, "l" | "p" | "i" | "pid"> & { content: string | null };

export type SdItemGroup = {
    index: number;
    parents: Record<number, SdItem>;
    children: Array<SdItem>;
};

export type SdToc = Array<SdItemGroup>;

import { SdItem, SdItemType } from "./Item";

export { SdItem, SdItemType };

export type XElement = {
    name: string;
    attributes?: Record<string, string>;
    content: Array<XElement | string>;
    r: number;
};

export type SdItemContent = Omit<SdItem<never>, "l" | "p" | "i" | "pid"> & {
    content: string | null;
};

export type SdItemGroup<Item> = {
    index: number;
    parents: Record<number, Item>;
    children: Array<Item>;
};

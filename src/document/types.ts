import { SdItem, SdItemType } from "./Item";

export { SdItem, SdItemType };

export type XElement = {
    name: string;
    attributes?: Record<string, string>;
    content: Array<XElement | string>;
    r: number;
};

export type SdItemContent = Omit<SdItem, "l" | "p" | "i" | "pid"> & { content: string | null };

export type SdItemGroup = {
    index: number;
    parents: Record<number, SdItem>;
    children: Array<SdItem>;
};

export type SdToc = Array<SdItemGroup>;
 

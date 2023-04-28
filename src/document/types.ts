export type XElement = {
    name: string;
    attributes?: Record<string, string>;
    content: Array<XElement | string>;
    r: number;
};

import { XElement } from "./types";

export function htmlForElement(element: XElement): string {
    const attributes =
        (element.attributes &&
            " " +
                Object.entries(element.attributes)
                    .map((a) => `${a[0]}="${a[1]}"`)
                    .join(" ")) ||
        "";

    const children = element.content
        .map((e) => {
            if (typeof e === "string") {
                return e;
            } else {
                return htmlForElement(e);
            }
        })
        .join("\n");

    return `<${element.name}${attributes}>${children}</${element.name}>`;
}

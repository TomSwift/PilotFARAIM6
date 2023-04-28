import { useContext } from "react";
import { DocumentContext } from "./DocumentContext";

export function usePfaDocument() {
    const document = useContext(DocumentContext);
    return document!;
}

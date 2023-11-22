import { useContext } from "react";
import { DocumentContext } from "./DocumentContext";

export function usePfaDocuments() {
    const { documents } = useContext(DocumentContext);
    return documents;
}

export function usePfaDocument(docid: string) {
    const documents = usePfaDocuments();
    return documents[docid];
}
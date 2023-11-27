import React from "react";
import { ReferenceView } from "../ReferenceView";
import { CfrDocument } from "./CfrDocument";

export function CfrReferenceView() {
    return <ReferenceView docid={CfrDocument.docid} />;
}

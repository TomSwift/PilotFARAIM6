import React from "react";
import { ReferenceView } from "../ReferenceView";
import { AimDocument } from "./AimDocument";

export function AimReferenceView() {
    return <ReferenceView docid={AimDocument.docid} />;
}

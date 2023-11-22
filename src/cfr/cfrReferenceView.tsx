import React, { useLayoutEffect, useState } from "react";
import { ReferenceView } from "../ReferenceView";
import { CfrTocNavigator } from "./CfrTocView";
import { CfrDocument } from "./CfrDocument";

export function CfrReferenceView() {
    return <ReferenceView docid={CfrDocument.docid} TocView={CfrTocNavigator} />;
}

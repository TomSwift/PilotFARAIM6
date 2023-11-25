import React, { useLayoutEffect, useState } from "react";
import { ReferenceView } from "../ReferenceView";
import { AimTocNavigator } from "./AimTocView";
import { AimDocument } from "./AimDocument";

export function AimReferenceView() {
    return (
        <ReferenceView docid={AimDocument.docid} TocView={AimTocNavigator} />
    );
}

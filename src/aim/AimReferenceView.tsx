import React from "react";
import { ReferenceView } from "../ReferenceView";
import { AimTocSectionHeader } from "./AimTocSectionHeader";
import { AimTocItem } from "./AimTocItem";
import { AimDocument } from "./AimDocument";
import { ContentView } from "../ContentView";
import { TocNavigator } from "../TocView";

export function AimReferenceView() {
    return (
        <ReferenceView
            docid={AimDocument.docid}
            TocView={TocNavigator}
            TocItem={AimTocItem}
            TocSectionHeader={AimTocSectionHeader}
            ContentView={ContentView}
        />
    );
}

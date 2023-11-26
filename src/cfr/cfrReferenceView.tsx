import React from "react";
import { ReferenceView } from "../ReferenceView";
import { CfrTocSectionHeader } from "./CfrTocSectionHeader";
import { CfrTocItem } from "./CfrTocItem";
import { CfrDocument } from "./CfrDocument";
import { ContentView } from "../ContentView";
import { TocNavigator } from "../TocView";

export function CfrReferenceView() {
    return (
        <ReferenceView
            docid={CfrDocument.docid}
            TocView={TocNavigator}
            TocItem={CfrTocItem}
            TocSectionHeader={CfrTocSectionHeader}
            ContentView={ContentView}
        />
    );
}

import React from "react";
import { SplitView } from "./splitView";
import { ReferenceContentView } from "./referenceContentView";

type Props = {
    TocView: React.ComponentType;
    ContentView?: React.ComponentType;
};

export function ReferenceView({ TocView, ContentView }: Props) {
    return <SplitView Master={TocView} Detail={ContentView ?? ReferenceContentView} />;
}

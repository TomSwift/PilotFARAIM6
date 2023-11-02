import React, { useState } from "react";
import { SplitView } from "./splitView";
import { ReferenceContentView, ReferenceContentViewContext } from "./referenceContentView";

type Props = {
    TocView: React.ComponentType;
    ContentView?: React.ComponentType;
};

export function ReferenceView({ TocView, ContentView }: Props) {
    const [index, setIndex] = useState(0);

    return (
        <ReferenceContentViewContext.Provider value={{ index, setIndex }}>
            <SplitView Master={TocView} Detail={ContentView ?? ReferenceContentView} />
        </ReferenceContentViewContext.Provider>
    );
}

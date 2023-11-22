import React, { useState } from "react";
import { SplitView } from "./splitView";
import { ReferenceContentView, ReferenceContentViewContext } from "./ReferenceContentView";

type Props = {
    docid: string,
    TocView: React.ComponentType;
    ContentView?: React.ComponentType;
};

export function ReferenceView({ docid, TocView, ContentView }: Props) {
    const [index, setIndex] = useState(0);

    return (
        <ReferenceContentViewContext.Provider value={{ docid, index, setIndex }}>
            <SplitView Master={TocView} Detail={ContentView ?? ReferenceContentView} />
        </ReferenceContentViewContext.Provider>
    );
}

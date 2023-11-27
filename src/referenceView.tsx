import React, { useState } from "react";
import { SplitView } from "./SplitView";
import { ReferenceContentViewContext } from "./ContentView";
import { TocNavigator } from "./TocView";
import { ContentView } from "./ContentView";

type Props = {
    docid: string;
};

export function ReferenceView({ docid }: Props) {
    const [index, setIndex] = useState(0);

    return (
        <ReferenceContentViewContext.Provider
            value={{ docid, index, setIndex }}
        >
            <SplitView Master={TocNavigator} Detail={ContentView} />
        </ReferenceContentViewContext.Provider>
    );
}

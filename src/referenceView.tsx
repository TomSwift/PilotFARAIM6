import React, { useState } from "react";
import { SplitView } from "./SplitView";
import { TocNavigator } from "./TocView";
import { ContentView } from "./ContentView";

type ReferenceContent = {
    docid: string;
    index: number;
    setIndex: (i: number) => void;
};
export const ReferenceContentViewContext =
    React.createContext<ReferenceContent>({
        docid: "",
        index: 0,
        setIndex: () => {},
    });

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

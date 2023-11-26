import React, { useState } from "react";
import { SplitView } from "./SplitView";
import { ReferenceContentViewContext } from "./ContentView";
import { SectionListRenderItem, SectionListData } from "react-native";
import { SdItem } from "./document/Item";
import { SdItemGroup } from "./document/types";

type Props = {
    docid: string;
    TocView: React.ComponentType;
    ContentView: React.ComponentType;
    TocItem: SectionListRenderItem<SdItem>;
    TocSectionHeader: {
        (info: {
            section: SectionListData<SdItem, SdItemGroup>;
        }): React.ReactElement | null;
    };
};

export function ReferenceView({
    docid,
    TocView,
    ContentView,
    TocItem,
    TocSectionHeader,
}: Props) {
    const [index, setIndex] = useState(0);

    return (
        <ReferenceContentViewContext.Provider
            value={{ docid, index, setIndex, TocItem, TocSectionHeader }}
        >
            <SplitView Master={TocView} Detail={ContentView} />
        </ReferenceContentViewContext.Provider>
    );
}

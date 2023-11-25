import * as React from "react";
import { Text, View } from "react-native";
import { SectionListData } from "react-native/types";
import { SdItem, SdItemGroup } from "../document/types";

export function TocSectionHeader({
    section,
}: {
    section: SectionListData<SdItem, SdItemGroup>;
}) {
    return (
        <View style={{ backgroundColor: "gray" }}>
            {Object.entries(section.parents).map(([_, item]) => {
                return <Text key={item.rowid.toString()}>{item.title}</Text>;
            })}
        </View>
    );
}

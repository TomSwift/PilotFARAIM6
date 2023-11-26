import React from "react";
import { Text, View, SectionListData } from "react-native";
import { SdItem, SdItemGroup } from "../document/types";

export function CfrTocSectionHeader({
    section,
}: {
    section: SectionListData<SdItem, SdItemGroup>;
}) {
    return (
        <View style={{ backgroundColor: "gray" }}>
            {Object.entries(section.parents).map(([_, item]) => {
                return (
                    <Text key={item.rowid.toString()} style={{ margin: 5 }}>
                        {item.title}
                    </Text>
                );
            })}
        </View>
    );
}

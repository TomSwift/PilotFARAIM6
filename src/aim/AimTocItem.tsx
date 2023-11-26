import React, { useCallback, useContext } from "react";
import { Text, View, Pressable } from "react-native";
import { SdItem } from "../document/types";
import { toTitleCase } from "titlecase";
import { useNavigation } from "@react-navigation/native";
import { ReferenceContentViewContext } from "../ContentView";
import { TocScreenNavigationProp } from "../TocView";

export function AimTocItem({ item }: { item: SdItem }) {
    const n = useNavigation<TocScreenNavigationProp>();
    const r = useContext(ReferenceContentViewContext);
    const onPress = useCallback(() => {
        if (item.isPageItem) {
            r?.setIndex(item.i);
        } else {
            n.push("Toc", { rootItem: item });
        }
    }, [n, item, r]);

    return (
        <Pressable onPress={onPress}>
            <View>
                <Text style={{ margin: 5 }}>
                    {toTitleCase(item.title?.toLowerCase() ?? "")}
                </Text>
            </View>
        </Pressable>
    );
}

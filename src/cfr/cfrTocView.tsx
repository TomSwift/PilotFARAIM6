import React, { useEffect, useState } from "react";
import { Text, View, SectionList, SectionListData } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { usePfaDocument } from "../document/usePfaDocument";
import { SdItem, SdItemGroup } from "../document/types";
import { toTitleCase } from "titlecase";

const Stack = createStackNavigator();

function CfrTocView() {
    const { tocWithRoot } = usePfaDocument();
    const [sections, setSections] = useState<Array<any>>([]);

    useEffect(() => {
        (async () => {
            const toc = await tocWithRoot("");
            // console.log(JSON.stringify(toc));

            const ss = toc.map((itemGroup: SdItemGroup) => {
                return {
                    ...itemGroup,
                    data: [...(itemGroup.children ?? [])],
                };
            });
            setSections(ss);
        })();
    }, [tocWithRoot]);

    function renderSectionHeader({ section }: { section: SectionListData<SdItem, SdItemGroup> }) {
        // console.log(JSON.stringify(section));
        return (
            <View style={{ backgroundColor: "gray" }}>
                {Object.entries(section.parents).map(([key, item]) => {
                    return <Text key={item.rowid.toString()}>{item.title}</Text>;
                })}
            </View>
        );
    }

    return (
        <SectionList<SdItem, SdItemGroup>
            sections={sections}
            keyExtractor={(item) => item.rowid.toString()}
            renderItem={({ item }) => (
                <View>
                    <Text>{toTitleCase(item.title?.toLowerCase())}</Text>
                </View>
            )}
            renderSectionHeader={renderSectionHeader}
        />
    );
}

export function CfrTocNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="cfr-toc-root" component={CfrTocView} />
        </Stack.Navigator>
    );
}

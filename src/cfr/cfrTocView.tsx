import React, { useEffect, useState } from "react";
import { Text, View, SectionList, SectionListData, Pressable, SectionListRenderItem } from "react-native";
import { StackNavigationProp, StackScreenProps, createStackNavigator } from "@react-navigation/stack";
import { usePfaDocument } from "../document/usePfaDocument";
import { SdItem, SdItemGroup } from "../document/types";
import { toTitleCase } from "titlecase";
import { useNavigation } from "@react-navigation/native";

type RootStackParamList = {
    CfrToc: { rootItem?: SdItem };
};

type CfrTocScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

function CfrTocItem({ item }: { item: SdItem }) {
    const n = useNavigation<CfrTocScreenNavigationProp>();
    return (
        <Pressable onPress={() => n.push("CfrToc", { rootItem: item })}>
            <View>
                <Text style={{ margin: 5 }}>{toTitleCase(item.title?.toLowerCase())}</Text>
            </View>
        </Pressable>
    );
}
type Props = StackScreenProps<RootStackParamList, "CfrToc">;

function CfrTocView(props: Props) {
    const { tocForRoot } = usePfaDocument();
    const [sections, setSections] = useState<Array<any>>([]);

    useEffect(() => {
        (async () => {
            console.log(JSON.stringify(props.route.params?.rootItem));
            const toc = await tocForRoot(props.route.params?.rootItem);
            // console.log(JSON.stringify(toc));

            const ss = toc.map((itemGroup: SdItemGroup) => {
                return {
                    ...itemGroup,
                    data: [...(itemGroup.children ?? [])],
                };
            });
            setSections(ss);
        })();
    }, [props.route.params?.rootItem, tocForRoot]);

    function renderSectionHeader({ section }: { section: SectionListData<SdItem, SdItemGroup> }) {
        return (
            <View style={{ backgroundColor: "gray" }}>
                {Object.entries(section.parents).map(([key, item]) => {
                    return (
                        <Text key={item.rowid.toString()} style={{ margin: 5 }}>
                            {item.title}
                        </Text>
                    );
                })}
            </View>
        );
    }

    function renderItem({ item }: { item: SectionListRenderItem<SdItem> }) {
        return <CfrTocItem item={item as SdItem} />;
    }

    return (
        <SectionList<SdItem, SdItemGroup>
            sections={sections}
            keyExtractor={(item) => item.rowid.toString()}
            renderItem={CfrTocItem}
            renderSectionHeader={renderSectionHeader}
        />
    );
}

export function CfrTocNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="CfrToc" component={CfrTocView} />
        </Stack.Navigator>
    );
}

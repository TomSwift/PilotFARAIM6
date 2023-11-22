import React, { useCallback, useContext, useEffect, useState } from "react";
import { Text, View, SectionList, SectionListData, Pressable } from "react-native";
import { StackNavigationProp, StackScreenProps, createStackNavigator } from "@react-navigation/stack";
import { usePfaDocument } from "../document/usePfaDocument";
import { SdItem, SdItemGroup } from "../document/types";
import { toTitleCase } from "titlecase";
import { useNavigation } from "@react-navigation/native";
import { ReferenceContentViewContext } from "../ReferenceContentView";

type RootStackParamList = {
    AimToc: { rootItem?: SdItem };
};

type CfrTocScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

function AimTocItem({ item }: { item: SdItem }) {
    const n = useNavigation<CfrTocScreenNavigationProp>();
    const r = useContext(ReferenceContentViewContext);
    const onPress = useCallback(() => {
        if (item.isPageItem) {
            r?.setIndex(item.i);
        } else {
            n.push("AimToc", { rootItem: item });
        }
    }, [n, item, r]);

    return (
        <Pressable onPress={onPress}>
            <View>
                <Text style={{ margin: 5 }}>{toTitleCase(item.title?.toLowerCase() ?? "")}</Text>
            </View>
        </Pressable>
    );
}

function AimTocSectionHeader({ section }: { section: SectionListData<SdItem, SdItemGroup> }) {
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

type Props = StackScreenProps<RootStackParamList, "AimToc">;

function AimTocView(props: Props) {
    const {docid} = useContext(ReferenceContentViewContext);

    const document  = usePfaDocument(docid);
    const [sections, setSections] = useState<Array<any>>([]);

    useEffect(() => {
        (async () => {
            const toc = await document.tocForRoot(props.route.params?.rootItem);

            const ss = toc.map((itemGroup: SdItemGroup) => {
                return {
                    ...itemGroup,
                    data: [...(itemGroup.children ?? [])],
                };
            });
            setSections(ss);
        })();
    }, [props.route.params?.rootItem, document]);

    return (
        <SectionList<SdItem, SdItemGroup>
            sections={sections}
            keyExtractor={(item) => item.rowid.toString()}
            renderItem={AimTocItem}
            renderSectionHeader={AimTocSectionHeader}
        />
    );
}

export function AimTocNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="AimToc" component={AimTocView} />
        </Stack.Navigator>
    );
}

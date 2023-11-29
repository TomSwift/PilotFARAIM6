import React, {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import { SectionList } from "react-native";
import {
    StackNavigationProp,
    StackScreenProps,
    createStackNavigator,
} from "@react-navigation/stack";
import { usePfaDocument } from "./document/usePfaDocument";
import { SdItem, SdItemGroup } from "./document/types";
import { ReferenceContentViewContext } from "./ReferenceView";
import { TocItem } from "./TocItem";
import { TocSectionHeader } from "./TocSectionHeader";
import { Divider } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";

export const TocStack = createStackNavigator<RootStackParamList>();

type RootStackParamList = {
    Toc: {
        rootItem?: SdItem<any>;
    };
};

export type TocScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Props = StackScreenProps<RootStackParamList, "Toc">;

export function TocView(props: Props) {
    const { docid } = useContext(ReferenceContentViewContext);
    const document = usePfaDocument(docid);
    const [sections, setSections] = useState<Array<any>>([]);

    useLayoutEffect(() => {
        (async () => {
            const toc = await document.tocForRoot(props.route.params?.rootItem);

            const ss = toc.map((itemGroup: SdItemGroup<unknown>) => {
                return {
                    ...itemGroup,
                    data: [...(itemGroup.children ?? [])],
                };
            });
            setSections(ss);
        })();
    }, [props.route.params?.rootItem, document]);

    const { push } = useNavigation<TocScreenNavigationProp>();
    const { setIndex } = useContext(ReferenceContentViewContext);
    const onPress = useCallback(
        (item: SdItem<any>) => {
            if (item.isPageItem) {
                setIndex(item.i);
            } else {
                push("Toc", { rootItem: item });
            }
        },
        [push, setIndex]
    );

    const keyExtractor = useCallback(
        (item: SdItem<any>) => item.rowid.toString(),
        []
    );

    const renderItem = useCallback(
        ({ item }: { item: SdItem<any> }) => (
            <TocItem item={item} onPress={onPress} />
        ),
        []
    );

    return (
        <SectionList<SdItem<any>, SdItemGroup<any>>
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            renderSectionHeader={TocSectionHeader}
            ItemSeparatorComponent={Divider}
        />
    );
}

export function TocNavigator() {
    return (
        <TocStack.Navigator>
            <TocStack.Screen name="Toc" component={TocView} />
        </TocStack.Navigator>
    );
}

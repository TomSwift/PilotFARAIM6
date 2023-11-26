import React, { useContext, useEffect, useState } from "react";
import { SectionList } from "react-native";
import {
    StackNavigationProp,
    StackScreenProps,
    createStackNavigator,
} from "@react-navigation/stack";
import { usePfaDocument } from "./document/usePfaDocument";
import { SdItem, SdItemGroup } from "./document/types";
import { ReferenceContentViewContext } from "./ContentView";

export const TocStack = createStackNavigator<RootStackParamList>();

type RootStackParamList = {
    Toc: {
        rootItem?: SdItem;
    };
};

export type TocScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Props = StackScreenProps<RootStackParamList, "Toc">;

export function TocView(props: Props) {
    const { docid, TocItem, TocSectionHeader } = useContext(
        ReferenceContentViewContext
    );

    const document = usePfaDocument(docid);
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
            renderItem={TocItem}
            renderSectionHeader={TocSectionHeader}
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

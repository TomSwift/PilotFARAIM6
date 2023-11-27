import React, { useCallback, useContext } from "react";
import { View, Pressable } from "react-native";
import { SdItem } from "./document/types";
import { toTitleCase } from "titlecase";
import { useNavigation } from "@react-navigation/native";
import { ReferenceContentViewContext } from "./ContentView";
import { TocScreenNavigationProp } from "./TocView";

import {
    Box,
    Center,
    Divider,
    HStack,
    Text,
    VStack,
    Icon,
    ChevronRightIcon,
} from "@gluestack-ui/themed";

export function TocItem({ item }: { item: SdItem<any> }) {
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
            <HStack>
                <Box
                    width={65}
                    minHeight={65}
                    padding={"$2"}
                    justifyContent="center"
                >
                    <VStack>
                        <Center>
                            <Text size="xs" adjustsFontSizeToFit={true}>
                                {item.tagTitle()}
                            </Text>
                            <Text
                                size="xl"
                                bold={true}
                                adjustsFontSizeToFit={true}
                            >
                                {item.tag}
                            </Text>
                        </Center>
                    </VStack>
                </Box>
                <Box flex={1} padding={"$2"} justifyContent="center">
                    <Text size="md">
                        {toTitleCase(item.title?.toLowerCase() ?? "")}
                    </Text>
                </Box>
                {!item.isPageItem && (
                    <Box justifyContent="center">
                        <Icon as={ChevronRightIcon} size="md" />
                    </Box>
                )}
            </HStack>
            <Divider />
            {item.subitemTitle && (
                <Text
                    size="xs"
                    textAlign="right"
                    sx={{ position: "absolute", right: "$2", bottom: "$1" }}
                >
                    {item.subitemTitle}
                </Text>
            )}
        </Pressable>
    );
}

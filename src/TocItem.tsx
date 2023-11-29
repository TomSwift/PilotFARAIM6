import React, { useCallback, useContext } from "react";
import { View, Pressable } from "react-native";
import { SdItem } from "./document/types";
import { toTitleCase } from "titlecase";

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

function _TocItem({
    item,
    onPress,
}: {
    item: SdItem<any>;
    onPress: (item: SdItem<any>) => void;
}) {
    return (
        <Pressable onPress={() => onPress(item)}>
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
export const TocItem = React.memo(_TocItem);

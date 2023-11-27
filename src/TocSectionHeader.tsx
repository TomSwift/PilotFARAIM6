import React from "react";
import { SectionListData } from "react-native";
import { SdItem, SdItemGroup } from "./document/types";
import { Box, HStack, VStack, Text } from "@gluestack-ui/themed";

export function TocSectionHeader({
    section,
}: {
    section: SectionListData<SdItem<any>, SdItemGroup<SdItem<any>>>;
}) {
    return (
        <VStack backgroundColor="$backgroundLight200">
            {Object.entries(section.parents).map(([_, item]) => {
                return (
                    <HStack key={item.rowid.toString()}>
                        <Box justifyContent="center">
                            <Text
                                minWidth={100}
                                textAlign="right"
                                adjustsFontSizeToFit={true}
                                size="sm"
                            >{`${item.tagTitle()} ${item.tag}:`}</Text>
                        </Box>
                        <Text flex={1} style={{ margin: 5 }} size="sm">
                            {item.title}
                        </Text>
                    </HStack>
                );
            })}
        </VStack>
    );
}

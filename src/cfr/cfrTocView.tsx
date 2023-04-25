import React from "react";
import { Text, View, SectionList } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

function CfrTocView() {
    const sections = React.useMemo(() => {
        return [
            {
                title: "One",
                data: ["a", "b", "c"],
            },
            {
                title: "Two",
                data: ["d", "e", "f"],
            },
            {
                title: "Three",
                data: ["g", "h", "i"],
            },
        ];
    }, []);

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
                <View>
                    <Text>{item}</Text>
                </View>
            )}
            renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
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

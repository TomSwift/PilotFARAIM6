import React from "react";
import type { PropsWithChildren } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from "react-native/Libraries/NewAppScreen";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CfrReferenceView } from "./cfr/CfrReferenceView";
import { AimReferenceView } from "./aim/AimReferenceView";
import { DocumentContext, DocumentProvider } from "./document/DocumentContext";

const Tab = createBottomTabNavigator();

function App(): JSX.Element {
    return (
        <DocumentProvider>
            <NavigationContainer>
                <Tab.Navigator initialRouteName="FAR">
                    <Tab.Screen name="FAR" component={CfrReferenceView} />
                    <Tab.Screen name="AIM" component={AimReferenceView} />
                </Tab.Navigator>
            </NavigationContainer>
        </DocumentProvider>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "600",
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "400",
    },
    highlight: {
        fontWeight: "700",
    },
});

export default App;

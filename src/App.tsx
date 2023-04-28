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
import { CfrReferenceView } from "./cfr/cfrReferenceView";
import { DocumentContext, DocumentProvider } from "./document/DocumentContext";

type SectionProps = PropsWithChildren<{
    title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
    const isDarkMode = useColorScheme() === "dark";
    return (
        <View style={styles.sectionContainer}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: isDarkMode ? Colors.white : Colors.black,
                    },
                ]}
            >
                {title}
            </Text>
            <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: isDarkMode ? Colors.light : Colors.dark,
                    },
                ]}
            >
                {children}
            </Text>
        </View>
    );
}

function Content(): JSX.Element {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
                <Header />
                <View
                    style={{
                        backgroundColor: isDarkMode ? Colors.black : Colors.white,
                    }}
                >
                    <Section title="Step One">
                        Edit <Text style={styles.highlight}>App.tsx</Text> to change this screen and then come back to
                        see your edits.
                    </Section>
                    <Section title="See Your Changes">
                        <ReloadInstructions />
                    </Section>
                    <Section title="Debug">
                        <DebugInstructions />
                    </Section>
                    <Section title="Learn More">Read the docs to discover what to do next:</Section>
                    <LearnMoreLinks />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const Tab = createBottomTabNavigator();

function App(): JSX.Element {
    return (
        <DocumentProvider>
            <DocumentContext.Consumer>
                {(document?: Document) => {
                    if (!document) {
                        return <ActivityIndicator />;
                    }
                    return (
                        <NavigationContainer>
                            <Tab.Navigator initialRouteName="FAR">
                                <Tab.Screen name="FAR" component={CfrReferenceView} />
                                <Tab.Screen name="AIM" component={Content} />
                            </Tab.Navigator>
                        </NavigationContainer>
                    );
                }}
            </DocumentContext.Consumer>
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
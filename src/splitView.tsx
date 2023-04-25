import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
    splitViewContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: "row",
        alignContent: "stretch",
    },
    masterContainer: {
        minWidth: 0,
        maxWidth: 320,
        flexBasis: 320,
        alignContent: "stretch",
        borderRightColor: "black",
        borderRightWidth: 1,
    },
    detailContainer: {
        flexGrow: 1,
        alignContent: "stretch",
    },
});

type Props = {
    Master: React.ComponentType;
    Detail: React.ComponentType;
};

export function SplitView({ Master, Detail }: Props) {
    return (
        <View style={styles.splitViewContainer}>
            <View style={styles.masterContainer}>
                <Master />
            </View>
            <View style={styles.detailContainer}>
                <Detail />
            </View>
        </View>
    );
}

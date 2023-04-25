import React, { useState } from "react";
import { LayoutChangeEvent, LayoutRectangle, StyleSheet, Text, View, VirtualizedList } from "react-native";
import WebView from "react-native-webview";

export function ReferenceContentView() {
    const [layoutRectangle, setLayoutRectangle] = useState<LayoutRectangle>({ x: 0, y: 0, width: 10, height: 10 });
    function onLayout(event: LayoutChangeEvent) {
        setLayoutRectangle(event.nativeEvent.layout);
    }
    return (
        <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
            <VirtualizedList
                getItemCount={(data) => 100}
                getItem={(data, index) => index}
                horizontal
                pagingEnabled
                keyExtractor={(item: number, index: number) => {
                    return `webview-${item}`;
                }}
                windowSize={5}
                renderItem={({ index }) => (
                    <WebView
                        key={index}
                        source={{ uri: `http://localhost:3000/${index}` }}
                        style={{ width: layoutRectangle.width }}
                    />
                )}
            />
        </View>
    );
}

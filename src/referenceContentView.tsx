import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, LayoutRectangle, StyleSheet, View, VirtualizedList } from "react-native";
import WebView from "react-native-webview";
import { usePfaDocument } from "./document/usePfaDocument";

export function ReferenceContentView() {
    const [layoutRectangle, setLayoutRectangle] = useState<LayoutRectangle>({ x: 0, y: 0, width: 10, height: 10 });
    function onLayout(event: LayoutChangeEvent) {
        setLayoutRectangle(event.nativeEvent.layout);
    }

    const [pageCount, setPageCount] = useState(0);
    const { documentPageCount } = usePfaDocument();

    useEffect(() => {
        (async () => {
            setPageCount(await documentPageCount(""));
        })();
    });

    return (
        <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
            <VirtualizedList
                getItemCount={(_) => pageCount}
                getItem={(_, index) => index}
                horizontal
                pagingEnabled
                keyExtractor={(item: number, index: number) => {
                    return `webview-${item}-${index}`;
                }}
                windowSize={5}
                renderItem={({ index }) => (
                    <WebView
                        key={index}
                        source={{ uri: `http://localhost:3000/FDFD560B-425F-4562-ABCE-673FF2E1E51D/${index}` }}
                        style={{ width: layoutRectangle.width }}
                    />
                )}
            />
        </View>
    );
}

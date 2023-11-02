import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, LayoutRectangle, StyleSheet, View, ViewToken, VirtualizedList } from "react-native";
import WebView from "react-native-webview";
import { usePfaDocument } from "./document/usePfaDocument";

type ReferenceContent = {
    index: number;
    setIndex: (i: number) => void;
};
export const ReferenceContentViewContext = React.createContext<ReferenceContent | undefined>(undefined);

export function ReferenceContentView() {
    const [layoutRectangle, setLayoutRectangle] = useState<LayoutRectangle>({ x: 0, y: 0, width: 10, height: 10 });
    function onLayout(event: LayoutChangeEvent) {
        setLayoutRectangle(event.nativeEvent.layout);
    }

    const [pageCount, setPageCount] = useState(0);
    const { documentPageCount } = usePfaDocument();

    const r = useContext(ReferenceContentViewContext);

    const listRef = useRef<VirtualizedList<number>>(null);

    useEffect(() => {
        (async () => {
            setPageCount(await documentPageCount(""));
        })();
    });

    const onChanged = useCallback(
        (info: { viewableItems: Array<ViewToken>; changed: Array<ViewToken> }) => {
            if (info.viewableItems?.length > 0) {
                r?.setIndex(info.viewableItems[0].index || 0);
            }
        },
        [r],
    );

    useEffect(() => {
        if (pageCount > 0) {
            listRef?.current?.scrollToIndex({ index: r?.index || 0 });
        }
    }, [r, pageCount]);

    return (
        <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
            <VirtualizedList
                ref={listRef}
                getItemCount={(_) => pageCount}
                getItem={(_, index) => index}
                getItemLayout={(data, index) => ({
                    offset: index * layoutRectangle.width,
                    length: layoutRectangle.width,
                    index,
                })}
                horizontal
                pagingEnabled
                keyExtractor={(item: number, index: number) => {
                    return `webview-${item}-${index}`;
                }}
                windowSize={3}
                viewabilityConfig={{
                    minimumViewTime: 0,
                    waitForInteraction: false,
                    itemVisiblePercentThreshold: 100,
                }}
                onViewableItemsChanged={onChanged}
                renderItem={({ index }) => (
                    <WebView
                        key={index}
                        source={{ uri: `http://localhost:3000/FDFD560B-425F-4562-ABCE-673FF2E1E51D/${index}` }}
                        style={{ width: layoutRectangle.width }}
                        webviewDebuggingEnabled={true}
                    />
                )}
            />
        </View>
    );
}

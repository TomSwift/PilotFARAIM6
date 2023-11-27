import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    LayoutChangeEvent,
    LayoutRectangle,
    StyleSheet,
    Text,
    View,
    ViewToken,
    VirtualizedList,
} from "react-native";
import WebView, { WebViewProps } from "react-native-webview";
import { usePfaDocument } from "./document/usePfaDocument";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { SdItem, SdItemGroup } from "./document/types";
import { Document } from "./document/Document";

function Content({
    docid,
    document,
    index,
    width,
}: {
    docid: string;
    document: Document<any>;
    index: number;
    width: number;
}) {
    const r = useContext(ReferenceContentViewContext);

    const [pageItem, setPageItem] = useState<SdItem<never>>();

    const shouldStartLoadWithRequest = useCallback(
        (event: ShouldStartLoadRequest) => {
            console.log(`shouldStart: ${event.url}`);
            if (event.url.startsWith("pfa:")) {
                const [_, __, docid, refid] = event.url.split("/");
                const result = document.splitContentRefid(refid);
                if (result) {
                    console.log(result.refid);
                    document
                        .itemForDocumentRefid(result.refid)
                        .then((item: SdItem<never>) => {
                            r?.setIndex(item.i);
                        });
                }
                return false;
            }
            return true;
        },
        [document]
    );

    useEffect(() => {
        document.itemForDocumentPage(index).then((item: SdItem<never>) => {
            setPageItem(item);
        });
    }, [index]);

    const webViewRef = useRef<WebView | null>(null);

    return (
        <View style={{ flexDirection: "column" }}>
            <View
                style={{
                    width: "100%",
                    height: 40,
                    backgroundColor: "lightGray",
                }}
            >
                <Text>{pageItem?.description()}</Text>
                <Text>{pageItem?.title}</Text>
            </View>
            <WebView
                key={index}
                source={{ uri: `http://localhost:3000/${docid}/${index}` }}
                style={{ width: width }}
                webviewDebuggingEnabled={true}
                originWhitelist={["*"]}
                onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
                ref={webViewRef}
                onContentProcessDidTerminate={webViewRef.current?.reload}
            />
        </View>
    );
}

type ReferenceContent = {
    docid: string;
    index: number;
    setIndex: (i: number) => void;
};
export const ReferenceContentViewContext =
    React.createContext<ReferenceContent>({
        docid: "",
        index: 0,
        setIndex: () => {},
    });

export function ContentView() {
    const [layoutRectangle, setLayoutRectangle] = useState<LayoutRectangle>({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
    });
    function onLayout(event: LayoutChangeEvent) {
        setLayoutRectangle(event.nativeEvent.layout);
    }

    const { docid } = useContext(ReferenceContentViewContext);

    const [pageCount, setPageCount] = useState(0);
    const document = usePfaDocument(docid);

    const r = useContext(ReferenceContentViewContext);

    const listRef = useRef<VirtualizedList<number>>(null);

    useEffect(() => {
        (async () => {
            setPageCount(await document.documentPageCount(""));
        })();
    }, [document]);

    const onChanged = useCallback(
        (info: {
            viewableItems: Array<ViewToken>;
            changed: Array<ViewToken>;
        }) => {
            if (info.viewableItems?.length > 0) {
                r?.setIndex(info.viewableItems[0].index || 0);
            }
        },
        [r]
    );

    useEffect(() => {
        if (pageCount > 0) {
            listRef?.current?.scrollToIndex({ index: r?.index || 0 });
        }
    }, [r, pageCount]);

    const shouldStartLoadWithRequest = useCallback(
        (event: ShouldStartLoadRequest) => {
            console.log(`shouldStart: ${event.url}`);
            if (event.url.startsWith("pfa:")) {
                const [_, __, docid, refid] = event.url.split("/");
                const result = document.splitContentRefid(refid);
                if (result) {
                    console.log(result.refid);
                    document
                        .itemForDocumentRefid(result.refid)
                        .then((item: SdItem<never>) => {
                            r?.setIndex(item.i);
                        });
                }
                return false;
            }
            return true;
        },
        [document]
    );

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
                    <Content
                        docid={docid}
                        width={layoutRectangle.width}
                        document={document}
                        index={index}
                    />
                )}
            />
        </View>
    );
}

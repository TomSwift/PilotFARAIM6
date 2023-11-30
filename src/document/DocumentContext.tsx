import * as React from "react";
import loadLocalRawResource from "react-native-local-resource";
import { htmlForElement } from "./htmlForElement";
import {
    SdItem,
    SdItemContent,
    SdItemGroup,
    SdItemType,
    XElement,
} from "./types";
import { CfrDocument } from "../cfr/CfrDocument";
import { Document } from "./Document";
import { AimDocument } from "../aim/AimDocument";
import { BridgeServer } from "react-native-http-bridge-refurbished";

export const DocumentContext = React.createContext<{
    documents: Record<string, Document<any>>;
}>({ documents: {} });

interface Asset {
    content: string;
    type: string;
}

export function DocumentProvider({
    children,
}: {
    children: React.ReactElement;
}) {
    const documents = React.useMemo<Record<string, Document<any>>>(
        () => ({
            [CfrDocument.docid]: new CfrDocument(),
            [AimDocument.docid]: new AimDocument(),
        }),
        []
    );

    React.useEffect(() => {
        return () => {
            Object.values(documents).forEach((document: Document<any>) =>
                document.db.close()
            );
        };
    }, [documents]);

    const [ready, setReady] = React.useState(false);

    React.useLayoutEffect(() => {
        const server = new BridgeServer("http_service", true);
        (async () => {
            const [
                cfrTemplate,
                pfa,
                rangyCore,
                rangySerializer,
                rangyClassApplier,
            ] = await Promise.all([
                loadLocalRawResource(require("./assets/cfr-template.html")),
                loadLocalRawResource(require("./assets/pfa.js_asset")),
                loadLocalRawResource(require("./assets/rangy-core.js_asset")),
                loadLocalRawResource(
                    require("./assets/rangy-serializer.js_asset")
                ),
                loadLocalRawResource(
                    require("./assets/rangy-cssclassapplier.js_asset")
                ),
            ]);

            const assets: Record<string, Asset> = {
                "cfr-template.html": {
                    content: cfrTemplate,
                    type: "text/html",
                },
                "pfa.js": { content: pfa, type: "text/javascript" },
                "rangy-core.js": {
                    content: rangyCore,
                    type: "text/javascript",
                },
                "rangy-serializer.js": {
                    content: rangySerializer,
                    type: "text/javascript",
                },
                "rangy-cssclassapplier.js": {
                    content: rangyClassApplier,
                    type: "text/javascript",
                },
            };

            server.get("*", async (req, res) => {
                console.log(`request for: ${req.url}`);
                const [_, docid, file] = req.url.split("/");
                const document = documents[docid];
                if (/FIG_/.test(file) && document) {
                    const resource = await document.resourceWithName(file);
                    if (resource) {
                        return res.send(
                            200,
                            resource.mime_type,
                            resource.resource
                        );
                    } else {
                        return res.send(404, "", "");
                    }
                } else if (/[0-9+]/.test(file)) {
                    if (document) {
                        return res.send(
                            200,
                            "text/html; charset=utf-8",
                            await document.htmlForDocumentPage(
                                parseInt(file, 10)
                            )
                        );
                    } else {
                        return res.send(404, "", "");
                    }
                } else {
                    const a = assets[file];
                    if (a) {
                        return res.send(200, a.type, a.content);
                    } else {
                        console.log(`requested file not found: ${req.url}`);
                        return res.send(404, "", "");
                    }
                }
            });
            await server.listen(3000);

            await new Promise((resolve) => setTimeout(resolve as any, 100));
            setReady(true);
        })();

        return () => {
            server.stop();
        };
    }, [documents]);

    return ready ? (
        <DocumentContext.Provider value={{ documents }}>
            {children}
        </DocumentContext.Provider>
    ) : null;
}

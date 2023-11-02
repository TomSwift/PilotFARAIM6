import React, { useLayoutEffect, useState } from "react";
import { ReferenceView } from "../referenceView";
import { CfrTocNavigator } from "./cfrTocView";
import { BridgeServer } from "react-native-http-bridge-refurbished";
import { usePfaDocument } from "../document/usePfaDocument";

export function CfrReferenceView() {
    const { asset, htmlForDocumentPage } = usePfaDocument();
    const [ready, setReady] = useState(false);

    useLayoutEffect(() => {
        const server = new BridgeServer("http_service", true);
        (async () => {
            server.get("*", async (req, res) => {
                // console.log(`request for: ${req.url}`);
                const [_, docid, file] = req.url.split("/");
                console.log(JSON.stringify(req));
                if (/[0-9+]/.test(file)) {
                    return res.send(200, "text/html; charset=utf-8", await htmlForDocumentPage(docid, parseInt(file, 10)));
                    // return res.html(await htmlForDocumentPage(docid, parseInt(file, 10)), 200);
                } else {
                    const a = asset(file);
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
    }, [asset, htmlForDocumentPage]);

    return ready ? <ReferenceView TocView={CfrTocNavigator} /> : null;
}

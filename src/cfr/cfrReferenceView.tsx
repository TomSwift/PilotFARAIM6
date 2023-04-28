import React, { useEffect } from "react";
import { ReferenceView } from "../referenceView";
import { CfrTocNavigator } from "./cfrTocView";
import { BridgeServer } from "react-native-http-bridge-refurbished";
import { usePfaDocument } from "../document/usePfaDocument";

export function CfrReferenceView() {
    const { asset, htmlForDocumentPage } = usePfaDocument();

    useEffect(() => {
        const server = new BridgeServer("http_service", true);
        server.get("*", async (req, res) => {
            console.log(`request for: ${req.url}`);
            const [_, docid, file] = req.url.split("/");
            if (/[0-9+]/.test(file)) {
                return res.html(await htmlForDocumentPage(docid, parseInt(file, 10)), 200);
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
        server.listen(3000);

        return () => {
            server.stop();
        };
    }, [asset, htmlForDocumentPage]);

    return <ReferenceView TocView={CfrTocNavigator} />;
}

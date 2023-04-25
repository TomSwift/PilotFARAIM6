import React, { useEffect, useRef } from "react";
import { NativeModules } from "react-native";
import { ReferenceView } from "../referenceView";
import { CfrTocNavigator } from "./cfrTocView";
import { BridgeServer } from "react-native-http-bridge-refurbished";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { QuickSQLiteConnection, open } from "react-native-quick-sqlite";

export function CfrReferenceView() {
    const qdb = useRef<QuickSQLiteConnection>();

    useEffect(() => {
        async function f() {
            // const bundlePath = FileSystem.bundleDirectory + "cfr.bin";
            // const documentsPath = FileSystem.documentDirectory + "SQLite";
            // console.log(`from: ${bundlePath}`);
            // console.log(`to:   ${documentsPath}`);
            // await FileSystem.makeDirectoryAsync(documentsPath);
            // await FileSystem.copyAsync({ from: bundlePath, to: documentsPath });
            qdb.current = open({ name: "cfr.sqlite" });
            const result = qdb.current?.execute(
                "SELECT s.type, s.tag, s.title, s.r, s.modified, s.modification, c.content, s.refid, c.rowid FROM sd_structure s LEFT OUTER JOIN sd_content c ON s.rowid = c.rowid WHERE s.l BETWEEN ? AND ? ORDER BY l ASC",
                [6, 709],
            );
            result.rows?._array.forEach((r: any) => {
                console.log(r);
            });

            // db.current = SQLite.openDatabase("cfr.sqlite");
            // console.log(db.current.version);

            // db.current.readTransaction((t: SQLite.SQLTransaction) => {
            //     t.executeSql(
            //         "SELECT s.type, s.tag, s.title, s.r, c.content, s.refid, c.rowid FROM sd_structure s LEFT OUTER JOIN sd_content c ON s.rowid = c.rowid WHERE s.l BETWEEN ? AND ? ORDER BY l ASC",
            //         [6, 709],
            //         (_, rs) => {
            //             rs.rows._array.forEach((row: any) => {
            //                 console.log(row);
            //             });
            //         },
            //     );
            // });
        }
        f();

        return () => {
            qdb.current?.close();
            qdb.current = undefined;
            // db.current?.closeAsync();
            // db.current = undefined;
        };
    }, []);

    useEffect(() => {
        const server = new BridgeServer("http_service", true);
        server.get("*", async (req, res) => {
            console.log(`request for: ${req.url}`);
            return res.html(
                `<html><meta name="viewport" content="width=device-width, initial-scale=1" /><body>${req.url}</body></html>`,
                200,
            );
        });
        server.listen(3000);

        return () => {
            server.stop();
        };
    }, []);

    return <ReferenceView TocView={CfrTocNavigator} />;
}

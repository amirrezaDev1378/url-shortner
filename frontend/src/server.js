import express from "express";
import {handler as ssrHandler} from "../dist/server/entry.mjs";

const APP_PORT = Bun.env?.PORT || 8080;

const Bootstrap = () => {
    const app = express();
    // Change this based on your astro.config.mjs, `base` option.
    // They should match. The default value is "/".
    const base = "/";
    app.use(base, express.static("dist/client"));


    app.use(ssrHandler);

    try {
        app.listen(APP_PORT, () => console.log(`App started at http://localhost:${APP_PORT}/`));
    } catch (e) {
        console.error("failed to run application!");
        console.error(e);
    }
};

Bootstrap();

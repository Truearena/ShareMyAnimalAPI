import express from "express";
import { json } from "body-parser";
import mongoose from "mongoose";
import routes from "./routes";
import dotenv from "dotenv";

const PORT = 80;
const MONGO_URI = "mongodb://127.0.0.1:27018/shareMyAnimal";

dotenv.config();

console.log(MONGO_URI)
mongoose
    .connect(MONGO_URI)
    .then((res) => {
        console.log('OK CONNECTED mongoose')
        const app = express();
        app.use(json());
        if (Array.isArray(routes)) {
            for (const route of routes) {
                app.use(route);
            }
        } else {
            throw new Error("Error configuring routes.");
        }
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}.`);
        });
    })
    .catch((err) => {
        console.error(err);
        console.error("Cannot connect to database and/or start server.");
    });

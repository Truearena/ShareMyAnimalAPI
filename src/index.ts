import express from "express";
import { json } from "body-parser";
import mongoose from "mongoose";
import routes from "./routes";
import dotenv from "dotenv";

const PORT = 8082;
const MONGO_URI = "mongodb://localhost:27017/shareMyAnimal";

dotenv.config();

mongoose
    .connect(MONGO_URI)
    .then((res) => {
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

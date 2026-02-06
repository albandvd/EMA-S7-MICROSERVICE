import cors from "cors";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { notFound } from "./middlewares/notFound.js";
import router from "./routes/item.route.js";

export const app = express();

app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());
app.use(cors());
app.use(router);

app.use(notFound);

if (process.env.NODE_ENV !== "test") {
	app.listen(3006, () => console.log("Running"));
}

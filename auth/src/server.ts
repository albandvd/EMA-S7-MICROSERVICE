import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { notFound } from "./middlewares/example";
import router from "./routes/example";

dotenv.config();

const app = express();

app.use(morgan("combined"));
app.use(cors());
app.use(router);

app.use(notFound);

app.listen(process.env.API_PORT, () => {
	console.log(`Server running on port ${process.env.API_PORT}`);
});

import cors from "cors";
import express from "express";
import morgan from "morgan";
import { notFound } from "./middlewares/notFound";
import router from "./routes/auth.route";

const app = express();

app.use(express.json());
app.use(morgan("combined"));
app.use(router);

app.use(notFound);

app.listen(3001, () => {
	console.log(`Server running on port 3001`);
});

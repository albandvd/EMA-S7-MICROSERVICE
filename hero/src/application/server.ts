import { app } from "./app";

const port = process.env.PORT || 3005;

app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
	console.log(`Swagger docs at http://localhost:${port}/docs`);
});

import express from "express";
import * as fs from "node:fs";
import * as YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import { InMemoryDialogRepository } from "../infrastructure/adapters/InMemoryDialogRepository";
import { InMemoryMonsterRepository } from "../infrastructure/adapters/InMemoryMonsterRepository";
import { DungeonController } from "../presentation/controllers/DungeonController";
import { DungeonService } from "../domain/services/DungeonService";

const app = express();
app.use(express.json());

const file = fs.readFileSync(
	require.resolve("../api/levelDesign.yml"),
	"utf-8",
);
const swaggerDocument = YAML.parse(file);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const inMemoryDialogRepo = new InMemoryDialogRepository();
const inMemoryMonsterRepo = new InMemoryMonsterRepository();

const dungeonService = new DungeonService(
	inMemoryMonsterRepo,
	inMemoryDialogRepo,
);

const dungeonController = new DungeonController(dungeonService);

dungeonController.registerRoutes(app);

app.get("/levelDesign", (req, res) => {
	res.set("Content-Type", "text/plain");
	res.send("Hello World!");
});

export { app };

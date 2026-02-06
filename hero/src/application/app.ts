import express from "express";
import * as fs from "node:fs";
import * as YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import { PrismaHeroRepository } from "../infrastrucure/adapters/PrismaHeroRepository";
import { HeroService } from "../domain/services/HeroService";
import { HeroController } from "../presentation/controllers/HeroController";
import { HeroConsumer } from "../infrastrucure/messaging/heroConsumer";

const app = express();
app.use(express.json());

const file = fs.readFileSync(require.resolve("../api/hero.yml"), "utf-8");
const swaggerDocument = YAML.parse(file);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const prismaHeroRepository = new PrismaHeroRepository();

const heroService = new HeroService(prismaHeroRepository);

const heroController = new HeroController(heroService);

const heroConsumer = new HeroConsumer(heroService);
heroConsumer.start().catch(console.error);

heroController.registerRoutes(app);

app.get("/", (req, res) => {
	res.set("Content-Type", "text/plain");
	res.send("Hello World!");
});

export { app };

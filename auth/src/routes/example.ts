import { Router } from "express";
import { healthCheck } from "../controllers/example";

const router = Router();

router.get("/health-check", (_req, res) => {
	res.send(healthCheck());
});

export default router;
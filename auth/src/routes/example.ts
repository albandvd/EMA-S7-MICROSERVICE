import { Router, Request, Response } from "express";
import { healthCheck } from "../controllers/example";

const router = Router();

router.get("/health-check", (_req: Request, res: Response) => {
	res.send(healthCheck());
});

export default router;
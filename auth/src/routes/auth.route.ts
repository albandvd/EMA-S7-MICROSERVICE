import { Router, Request, Response } from "express";
import { healthCheck } from "../controllers/example";
import { login } from "../controllers/auth.controller";

const router = Router();

router.get("/health-check", (_req: Request, res: Response) => {
    res.send(healthCheck());
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const result = await login(req.body);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error });
    }
});

export default router;
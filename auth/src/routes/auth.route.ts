import { Router, Request, Response } from "express";
import { login, healthCheck } from "../controllers/auth.controller";

const router = Router();

router.get("/auth/health-check", (_req: Request, res: Response) => {
    res.send(healthCheck());
});

router.post("/auth/login", async (_req: Request, res: Response) => {
    try {
        const result = await login(_req.body);
        res.cookie('token', result.token, { httpOnly: true, secure: false, sameSite: 'none' });
        res.status(result.message === "Login successful" ? 200 : 401).json(result.message);
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error });
    }
});

export default router;
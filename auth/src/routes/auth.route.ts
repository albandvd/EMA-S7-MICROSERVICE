import { Router, Request, Response } from "express";
import { login, register, healthCheck } from "../controllers/auth.controller";

const router = Router();

router.get("/auth/health-check", (_req: Request, res: Response) => {
    res.send(healthCheck());
});

router.post("/auth/login", async (_req: Request, res: Response) => {
    try {
        const result = await login(_req.body);
        res.cookie('token', result.token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
        res.status(result.message === "Login successful" ? 200 : 401).json(result.message);
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error });
    }
});

router.post("/auth/register", async (_req: Request, res: Response) => {
    try {
        const result = await register(_req.body);
        res.cookie('token', result.token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
        res.status(201).json(result.message);
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error });
    }
});

export default router;
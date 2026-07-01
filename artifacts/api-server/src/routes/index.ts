import { Router, type IRouter } from "express";
import healthRouter from "./health";
import importedWebRouter from "./imported-web";
import documentsRouter from "./documents";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(importedWebRouter);
router.use(documentsRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import importedWebRouter from "./imported-web";
import documentsRouter from "./documents";

const router: IRouter = Router();

router.use(healthRouter);
router.use(importedWebRouter);
router.use(documentsRouter);

export default router;

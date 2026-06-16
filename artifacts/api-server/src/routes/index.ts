import { Router, type IRouter } from "express";
import healthRouter from "./health";
import importedWebRouter from "./imported-web";

const router: IRouter = Router();

router.use(healthRouter);
router.use(importedWebRouter);

export default router;

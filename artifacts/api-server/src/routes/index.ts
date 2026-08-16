import { Router, type IRouter } from "express";
import healthRouter from "./health";
import courseRouter from "./course";
import assignmentsRouter from "./assignments";
import practiceRouter from "./practice";
import practiceAssignmentsRouter from "./practice-assignments";
import tutorRouter from "./tutor";
import detectionRouter from "./detection";
import analyticsRouter from "./analytics";
import diagnosticsRouter from "./diagnostics";
import visitorsRouter from "./visitors";
import exportRouter from "./export";
import { aiUsageGate } from "../middlewares/visitor";

const router: IRouter = Router();

// Anonymous visitors get a small free budget of AI-generated output on the
// AI-powered routes; past it they must sign in. Signed-in users are unlimited.
router.use(
  ["/tutor", "/practice", "/practice-assignments", "/assignments", "/detection"],
  aiUsageGate,
);

router.use(healthRouter);
router.use(courseRouter);
router.use(exportRouter);
router.use(assignmentsRouter);
router.use(practiceRouter);
router.use(practiceAssignmentsRouter);
router.use(tutorRouter);
router.use(detectionRouter);
router.use(analyticsRouter);
router.use(diagnosticsRouter);
router.use(visitorsRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import textsRouter from "./texts";
import sessionsRouter from "./sessions";
import syncRouter from "./sync";
import notificationsRouter from "./notifications";
import textsMnemonicRouter from "./texts-mnemonic";
import textsAcronymRouter from "./texts-acronym";
import reviewsRouter from "./reviews";
import feedbackRouter from "./feedback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/texts/:id/mnemonic", textsMnemonicRouter);
router.use("/texts/:id/acronym", textsAcronymRouter);
router.use(textsRouter);
router.use(sessionsRouter);
router.use(syncRouter);
router.use("/notifications", notificationsRouter);
router.use(reviewsRouter);
router.use(feedbackRouter);

export default router;

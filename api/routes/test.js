import express from "express";
import { shouldbeadmin, shouldloggedin } from "../controller/testController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/shouldloggedin" , verifyToken, shouldloggedin);

router.get("/shouldadmin" ,verifyToken, shouldbeadmin);

export default router;
import express from "express";
import { deleteUsers,profilePosts,getUsers,updateUser,savePost,getNotificationNumber} from "../controller/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/" ,getUsers);

router.post("/:id" ,verifyToken, updateUser);

router.delete("/:id" ,verifyToken, deleteUsers);

router.post("/:id/save",verifyToken, savePost)

router.get("/profilePosts",verifyToken, profilePosts)

router.get("/notification" , verifyToken, getNotificationNumber)

export default router;
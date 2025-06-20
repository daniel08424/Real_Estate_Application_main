import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addPost ,getPost,getPosts,deletePost,updatePost} from "../controller/postController.js";

const router = express.Router();

router.get("/" ,getPosts);
router.get("/:id" ,getPost);
router.post("/" ,verifyToken , addPost);
router.put("/:id" ,verifyToken, updatePost);
router.delete("/delete/:id" ,verifyToken,deletePost);


export default router;
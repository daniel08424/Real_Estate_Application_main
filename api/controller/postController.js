import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async(req,res) =>{
    const query = req.query;
    
    try{
        const posts  = await prisma.post.findMany({
            where:{
                city: query.city || undefined,
                type: query.type || undefined,
                property: query.prototype || undefined,
                bedroom: parseInt(query.bedroom) || undefined,
                price: {
                    gte : parseInt(query.minPrice) || 0,
                    lte : parseInt(query.maxPrice) || 10000000,
                }
            },
        });
        // setTimeout(()=>{
            res.status(200).json(posts);
        // },3000)
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"failed to add Post"})
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          postDetails: true,
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      });
  
      const token = req.cookies?.token;
  
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
          if (!err) {
            const saved = await prisma.savedPost.findUnique({
              where: {
                userId_postId: {
                  postId: id,
                  userId: payload.id,
                },
              },
            });
            res.status(200).json({ ...post, isSaved: saved ? true : false });
          }
        });
      } else {
        res.status(200).json({ ...post, isSaved: false });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get post" });
    }
  };
  
  export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;

    try {
        // Ensure required fields are present in the request body
        if (!body.postData || !body.postDetails) {
            return res.status(400).json({ message: "Invalid data. postData and postDetails are required." });
        }

        // Create a new post with related postDetails
        const newPost = await prisma.post.create({
            data: {
                ...body.postData,
                userId: tokenUserId, // Ensure the post is associated with the correct user
                postDetails: {
                    create: body.postDetails, // Ensure postDetails is properly structured
                },
            },
        });

        res.status(200).json(newPost);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Failed to add Post" });
    }
};


export const updatePost = async(req,res) =>{
    try{
        res.status(200).json()
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"failed to add Post"})
    }
}

export const deletePost = async(req,res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  
  try {
      const post = await prisma.post.findUnique({
          where: { id },
          include: { postDetails: true } // Include related PostDetails
      });

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      console.log(post.userId);
      if (post.userId !== tokenUserId) {
          return res.status(403).json({ message: "Not Authorized" });
      }

      // Delete the related PostDetails if they exist
      if (post.postDetails) {
          await prisma.postDetails.delete({
              where: { id: post.postDetails.id }
          });
      }

      await prisma.post.delete({
          where: { id }
      });

      res.status(200).json({ message: "Post Deleted" });
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to delete Post" });
  }
};

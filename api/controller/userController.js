import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async(req,res)=>{
    try{
       const users = await prisma.user.findMany();
       res.status(200).json(users);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get user"})
    }
}

export const getUser = async(req,res)=>{
    const id = req.params.id;
    try{
        const user = await prisma.user.findUnique({
            where :{id},
        });
        res.status(200).json(user);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get user"})
    }
}

export const updateUser = async(req,res)=>{
    const id = req.params.id;
    const tokenUserId = req.userId;
    console.log(tokenUserId);
    const {password,avatar,...input} = req.body;
    
    if(id !== tokenUserId){
        return res.status(403).json({message:"Not Authorized"})
    }

    let updatedPassword = "";
    try{
        if(password){
            updatedPassword = await bcrypt.hash(password,10);
        }


        const updateUser = await prisma.user.update({
            where:{id},
            data:{
                ...input,
                ...(updatedPassword && {password: updatedPassword}),
                ...(avatar && {avatar}),
            },
        });

        const {password:userPassword,...rest} = updateUser
        res.status(200).json(rest)
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get user"})
    }
}

export const deleteUsers = async(req,res)=>{
    
    try{
        const id = req.params.id;
        const tokenUserId = req.userId;

        if(id !== tokenUserId){
            return res.status(403).json({message:"Nott Authorized"})
        }

        await prisma.user.delete({
            where : {id}
        })

        res.status(200).json({message : "User Deleted"})
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get user"})
    }
}

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const save = saved.map((item) => item.post);
    res.status(200).json({ userPosts, save });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const getNotificationNumber = async(req,res) =>{
   const tokenUserId = req.userId;

   try{
      const number = await prisma.chat.count({
        where:{
          userIDs: {
            hasSome : [tokenUserId],
          },
          NOT: {
            seenBy:{
              hasSome : [tokenUserId]
            }
          }
        }
      })
      res.status(200).json(number);
   }
   catch(err){

   }
}


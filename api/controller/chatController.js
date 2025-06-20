import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    //get the user information like username and image
    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });
      chat.receiver = receiver;
    }

    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChat = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat!" });
  }
};

export const addChat = async (req, res) => {
  const tokenUserId = req.userId;

  const chatId = req.body.receiverId;

  const chatRes = await prisma.chat.findMany({
    where : {
      userIDs: {
        hasEvery: [tokenUserId, chatId]
      }
    }
  });

  var userIds0;
  var chatIds1;
  chatRes.forEach(chat => {
    userIds0 = chat.userIDs[0]
    chatIds1 = chat.userIDs[1]
  });

  if(userIds0 == tokenUserId && chatIds1 == chatId){
    console.log("Successfully executed");
    return res.status(200).json({ message: "Chat already present"});
  }

  // if(chatRes.userIds[0] == tokenUserId && chatRes.userIds[1] == chatId){
  //   return res.status(300).json({ message: "Chat Atready exists" });
  // }

  try {
    const newChat = await prisma.chat.create({
      data: {
        userIDs: [tokenUserId, req.body.receiverId],
      },
    });
    res.status(200).json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add chat!" });
  }
};

export const readChat = async (req, res) => {
  const tokenUserId = req.userId;
  
  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          set: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to read chat!" });
  }
};

export const deleteChat = async (req, res) => {
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat record not found" });
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    res.status(200).json({ message: "Chat Deleted" });
  } catch (err) {
    if (err.code === 'P2025') {
      console.error('Record to delete does not exist.');
      res.status(404).json({ message: "Chat record not found" });
    } else {
      console.error(err);
      res.status(500).json({ message: "Failed to delete Chat" });
    }
  }
};


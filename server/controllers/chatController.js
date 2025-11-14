import Chat from "../models/Chat.js"; 
import User from "../models/User.js"; 
import { protect } from "../middlewares/auth.js";

// api for creating a newchat
export const createChats = async (req,res)=>{
    try {
        const userId = req.user._id

        const chatData = {
            userId,
            messages:[],
            name:"New Chat",
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json({success:true,message:"Chat created"})
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}
// api for getting all chat
export const getChats = async (req,res)=>{
    try {
        const userId = req.user._id

        const chats = await Chat.find({userId}).sort({updatedAt:-1}) 

        res.json({success:true,chats})
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}
// api for deleting a chat
export const deleteChats = async (req,res)=>{
    try {
        const userId = req.user._id

        const {chatId} = req.body

        await Chat.deleteOne({_id: chatId,userId})

        res.json({success:true,message:"Chat deleted"})
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}
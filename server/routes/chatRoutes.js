import express from "express";
import { createChats,deleteChats,getChats } from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";

const route = express.Router();

route.get('/create',protect,createChats);
route.post('/delete',protect,deleteChats);
route.get('/get',protect,getChats);

export default route;
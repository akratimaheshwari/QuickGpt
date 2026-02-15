import express from "express";
import { protect } from "../middlewares/auth.js";
import { getChatMessages, imageMessageController, textMessageController } from "../controllers/messageController.js";

const router = express.Router()

router.post('/text',protect,textMessageController);
router.post('/image',protect,imageMessageController);
router.get("/:chatId", protect, getChatMessages);

export default router;
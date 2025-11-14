import express from "express";
import {registerUser,loginUser,getUser, getPublishedImages} from "../controllers/userController.js";
import {protect} from "../middlewares/auth.js";

const userRoute = express.Router();

userRoute.post('/register',registerUser);
userRoute.post('/login',loginUser);
userRoute.get('/data',protect, getUser);
userRoute.get('/published-images',getPublishedImages);

export default userRoute;

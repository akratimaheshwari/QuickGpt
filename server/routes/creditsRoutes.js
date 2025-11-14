import express from "express";
import { getPlans, purchansePlan } from "../controllers/creditController.js";
import { protect } from "../middlewares/auth.js";

const route = express.Router();

route.get('/plan',getPlans);
route.post('/purchase',protect,purchansePlan);

export default route;


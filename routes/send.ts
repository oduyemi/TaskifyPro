import express, { Request, Response } from "express";
import Task, { ITask } from "../models/taskModel.js";
import TaskCategory, { ITaskCategory} from "../models/taskCategoryModel.js";
import Subscription, { ISubscription} from "../models/subscriptionModel.js";
import User, { IUser } from "../models/userModel.js";
import Admin, { IAdmin } from "../models/adminModel.js";

const router = express.Router();




export default router;
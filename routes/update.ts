import express, { Request, Response } from "express";
import Task, { ITask } from "../models/taskModel.js";
import TaskCategory, { ITaskCategory} from "../models/taskCategoryModel.js";
import Subscription, { ISubscription} from "../models/subscriptionModel.js";
import User, { IUser } from "../models/userModel.js";
import Admin, { IAdmin } from "../models/adminModel.js";

const router = express.Router();


router.put("/users/:userId", async (req: Request, res: Response) => {
    try {
        const userId = req.params.adminId;
        const updatedUserData: Partial<IUser> = req.body;

        const requiredFields = ["fname", "lname", "email", "phone", "password"];
        const missingFields = requiredFields.filter(field => !(field in updatedUserData));

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ Message: "User not found" });
        }

        res.json({ data: updatedUser });
    } catch (error) {
        console.error("Error updating user profile", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

  
router.put("/admins/:adminId", async (req: Request, res: Response) => {
    try {
        const adminId = req.params.adminId;
        const updatedAdminData: Partial<IAdmin> = req.body;

        const requiredFields = ["fname", "lname", "email", "phone", "password"];
        const missingFields = requiredFields.filter(field => !(field in updatedAdminData));

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updatedAdminData, { new: true });

        if (!updatedAdmin) {
            return res.status(404).json({ Message: "Admin not found" });
        }

        res.json({ data: updatedAdmin });
    } catch (error) {
        console.error("Error updating admin profile", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});


router.put("/task-categories/:categoryId", async (req: Request, res: Response) => {
    try {
        const categoryId = req.params.categoryId;
        const updatedCategoryData: Partial<ITaskCategory> = req.body;

        const requiredFields = ["name", "description", "img"];
        const missingFields = requiredFields.filter(field => !(field in updatedCategoryData));

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        const updatedCategory = await TaskCategory.findByIdAndUpdate(categoryId, updatedCategoryData, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ Message: "Task category not found" });
        }

        res.json({ data: updatedCategory });
    } catch (error) {
        console.error("Error updating task category", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});


router.put("/tasks/:taskId", async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskId;
        const updatedTaskData: Partial<ITask> = req.body;

        const requiredFields = ["title", "description", "img", "deadline", "completed", "createdAt", "updatedAt"];
        const missingFields = requiredFields.filter(field => !(field in updatedTaskData));

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, updatedTaskData, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ Message: "Task not found" });
        }

        res.json({ data: updatedTask });
    } catch (error) {
        console.error("Error updating task", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});


router.put("/subscriptions/:subscriptionId", async (req: Request, res: Response) => {
    try {
        const subscriptionId = req.params.subscriptionId;
        const updatedSubscriptionData: Partial<ISubscription> = req.body;

        const requiredFields = ["name", "description", "price"];
        const missingFields = requiredFields.filter(field => !(field in updatedSubscriptionData));

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId, updatedSubscriptionData, { new: true });

        if (!updatedSubscription) {
            return res.status(404).json({ Message: "Subscription not found" });
        }

        res.json({ data: updatedSubscription });
    } catch (error) {
        console.error("Error updating subscription", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

export default router;
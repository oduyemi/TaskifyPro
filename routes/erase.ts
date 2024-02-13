import express, { Request, Response } from "express";
import Task from "../models/taskModel.js";
import TaskCategory from "../models/taskCategoryModel.js";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

const router = express.Router();


router.delete("/users/:userId", async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ Message: "User not found" });
        }

        res.json({ Message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});


router.delete("/tasks/:taskId", async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskId;
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ Message: "Task not found" });
        }

        res.json({ Message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});


router.delete("/task-categories/:categoryId", async (req: Request, res: Response) => {
    try {
        const categoryId = req.params.categoryId;
        const deletedCategory = await TaskCategory.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ Message: "Task category not found" });
        }

        res.json({ Message: "Task category deleted successfully" });
    } catch (error) {
        console.error("Error deleting task category", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});


router.delete("/admins/:adminId", async (req: Request, res: Response) => {
    try {
        const adminId = req.params.adminId;
        const deletedAdmin = await Admin.findByIdAndDelete(adminId);

        if (!deletedAdmin) {
            return res.status(404).json({ Message: "Admin not found" });
        }

        res.json({ Message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting admin", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});


router.delete("/subscriptions/:subscriptionId", async (req: Request, res: Response) => {
    try {
        const subscriptionId = req.params.subscriptionId;
        const deletedSubscription = await Subscription.findByIdAndDelete(subscriptionId);

        if (!deletedSubscription) {
            return res.status(404).json({ Message: "Subscription not found" });
        }

        res.json({ Message: "Subscription deleted successfully" });
    } catch (error) {
        console.error("Error deleting subscription", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});



export default router;
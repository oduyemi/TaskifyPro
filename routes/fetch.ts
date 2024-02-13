import express, { Request, Response } from "express";
import Task, { ITask } from "../models/taskModel.js";
import TaskCategory, { ITaskCategory} from "../models/taskCategoryModel.js";
import Subscription, { ISubscription} from "../models/subscriptionModel.js";
import User, { IUser } from "../models/userModel.js";
import Admin, { IAdmin } from "../models/adminModel.js";

const router = express.Router();


router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to Taskify!" });
    });

router.get("/users", async (req: Request, res: Response) => {
    try {
        const users: IUser[] = await User.find();
        if (users.length === 0) {
            res.status(404).json({ Message: "Users not available" });
        } else {
            res.json({ data: users });
        }
        } catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

    
router.get("/users/:userId", async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const user: IUser | null = await User.findById(userId);
    
        if (!user) {
        res.status(404).json({ Message: "User not found" });
        } else {
        res.json({ data: user });
        }
    } catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});
        


        
router.get("/admins", async (req: Request, res: Response) => {
    try {
        const admins: IAdmin[] = await Admin.find();
        if (admins.length === 0) {
            res.status(404).json({ Message: "Administrators not available" });
        } else {
            res.json({ data: admins });
        }
        } catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

    
router.get("/admins/:adminId", async (req: Request, res: Response) => {
    try {
        const adminId = req.params.adminId;
        const admin: IAdmin | null = await Admin.findById(adminId);
    
        if (!admin) {
        res.status(404).json({ Message: "Admin not found" });
        } else {
        res.json({ data: admin });
        }
    } catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

router.get("/tasks", async (req: Request, res: Response) => {
    try {
        const tasks: ITask[] = await Task.find();
        if (tasks.length === 0) {
            res.status(404).json({ Message: "Tasks not available" });
        } else {
            res.json({ data: tasks });
        }
        } catch (error) {

        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

    
router.get("/tasks/:taskId", async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskCategoryId;
        const task: ITask | null = await Task.findById(taskId);
    
        if (!task) {
        res.status(404).json({ Message: "Task not found" });
        } else {
        res.json({ data: task });
        }
    } catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

router.get("/tasks/task/task-categories", async (req: Request, res: Response) => {
    try {
      const categories: ITaskCategory[] = await TaskCategory.find();
  
      if (categories.length === 0) {
        res.status(404).json({ Message: "No task categories available" });
      } else {
        res.json({ data: categories });
      }
    } catch (error) {
      console.error("Error fetching course categories from the database", error);
      res.status(500).json({ Message: "Internal Server Error" });
    }
});
  

router.get("/tasks/task/:categoryId", async (req: Request, res: Response) => {
    try {
        const categoryId = req.params.categoryId;
    
        const category: ITaskCategory[] = await TaskCategory.find({ category: categoryId });
    
        if (category.length === 0) {
        res.status(404).json({ Message: `No tasks available for this category: ${categoryId}` });
        } else {
        res.json({ data: category });
        }
    } catch (error) {
        console.error("Error fetching course category from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});

router.get("/users/subscriptions", async (req: Request, res: Response) => {
    try {
      const subscriptions: ISubscription[] = await Subscription.find();
  
      if (subscriptions.length === 0) {
        res.status(404).json({ Message: "No subscriptions available" });
      } else {
        res.json({ data: subscriptions });
      }
    } catch (error) {
      console.error("Error fetching course categories from the database", error);
      res.status(500).json({ Message: "Internal Server Error" });
    }
});
  

router.get("/users/:userId/subscription/:subscriptionId", async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const subscriptionId = req.params.subscriptionId;

        const user: IUser | null = await User.findById(userId).populate('subscription');
        if (!user) {
            return res.status(404).json({ Message: "User not found" });
        }

        const userSubscription = user.subscription;
        if (!userSubscription || userSubscription._id.toString() !== subscriptionId) {
            return res.status(404).json({ Message: "User is not subscribed to this subscription" });
        }

        res.json({ data: userSubscription });

    } catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
});




export default router;
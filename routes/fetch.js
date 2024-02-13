"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskModel_js_1 = __importDefault(require("../models/taskModel.js"));
const taskCategoryModel_js_1 = __importDefault(require("../models/taskCategoryModel.js"));
const subscriptionModel_js_1 = __importDefault(require("../models/subscriptionModel.js"));
const userModel_js_1 = __importDefault(require("../models/userModel.js"));
const adminModel_js_1 = __importDefault(require("../models/adminModel.js"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.json({ message: "Welcome to Taskify!" });
});
router.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_js_1.default.find();
        if (users.length === 0) {
            res.status(404).json({ Message: "Users not available" });
        }
        else {
            res.json({ data: users });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const user = yield userModel_js_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ Message: "User not found" });
        }
        else {
            res.json({ data: user });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/admins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield adminModel_js_1.default.find();
        if (admins.length === 0) {
            res.status(404).json({ Message: "Administrators not available" });
        }
        else {
            res.json({ data: admins });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/admins/:adminId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.params.adminId;
        const admin = yield adminModel_js_1.default.findById(adminId);
        if (!admin) {
            res.status(404).json({ Message: "Admin not found" });
        }
        else {
            res.json({ data: admin });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/tasks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield taskModel_js_1.default.find();
        if (tasks.length === 0) {
            res.status(404).json({ Message: "Tasks not available" });
        }
        else {
            res.json({ data: tasks });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/tasks/:taskId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = req.params.taskCategoryId;
        const task = yield taskModel_js_1.default.findById(taskId);
        if (!task) {
            res.status(404).json({ Message: "Task not found" });
        }
        else {
            res.json({ data: task });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/tasks/task/task-categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield taskCategoryModel_js_1.default.find();
        if (categories.length === 0) {
            res.status(404).json({ Message: "No task categories available" });
        }
        else {
            res.json({ data: categories });
        }
    }
    catch (error) {
        console.error("Error fetching course categories from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/tasks/task/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.categoryId;
        const category = yield taskCategoryModel_js_1.default.find({ category: categoryId });
        if (category.length === 0) {
            res.status(404).json({ Message: `No tasks available for this category: ${categoryId}` });
        }
        else {
            res.json({ data: category });
        }
    }
    catch (error) {
        console.error("Error fetching course category from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/users/subscriptions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptions = yield subscriptionModel_js_1.default.find();
        if (subscriptions.length === 0) {
            res.status(404).json({ Message: "No subscriptions available" });
        }
        else {
            res.json({ data: subscriptions });
        }
    }
    catch (error) {
        console.error("Error fetching course categories from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/users/:userId/subscription/:subscriptionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const subscriptionId = req.params.subscriptionId;
        const user = yield userModel_js_1.default.findById(userId).populate('subscription');
        if (!user) {
            return res.status(404).json({ Message: "User not found" });
        }
        const userSubscription = user.subscription;
        if (!userSubscription || userSubscription._id.toString() !== subscriptionId) {
            return res.status(404).json({ Message: "User is not subscribed to this subscription" });
        }
        res.json({ data: userSubscription });
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
exports.default = router;

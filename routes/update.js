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
router.put("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.adminId;
        const updatedUserData = req.body;
        const requiredFields = ["fname", "lname", "email", "phone", "password"];
        const missingFields = requiredFields.filter(field => !(field in updatedUserData));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        const updatedUser = yield userModel_js_1.default.findByIdAndUpdate(userId, updatedUserData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ Message: "User not found" });
        }
        res.json({ data: updatedUser });
    }
    catch (error) {
        console.error("Error updating user profile", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.put("/admins/:adminId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.params.adminId;
        const updatedAdminData = req.body;
        const requiredFields = ["fname", "lname", "email", "phone", "password"];
        const missingFields = requiredFields.filter(field => !(field in updatedAdminData));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        const updatedAdmin = yield adminModel_js_1.default.findByIdAndUpdate(adminId, updatedAdminData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ Message: "Admin not found" });
        }
        res.json({ data: updatedAdmin });
    }
    catch (error) {
        console.error("Error updating admin profile", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.put("/task-categories/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.categoryId;
        const updatedCategoryData = req.body;
        const requiredFields = ["name", "description", "img"];
        const missingFields = requiredFields.filter(field => !(field in updatedCategoryData));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        const updatedCategory = yield taskCategoryModel_js_1.default.findByIdAndUpdate(categoryId, updatedCategoryData, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ Message: "Task category not found" });
        }
        res.json({ data: updatedCategory });
    }
    catch (error) {
        console.error("Error updating task category", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.put("/tasks/:taskId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = req.params.taskId;
        const updatedTaskData = req.body;
        const requiredFields = ["title", "description", "img", "deadline", "completed", "createdAt", "updatedAt"];
        const missingFields = requiredFields.filter(field => !(field in updatedTaskData));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        const updatedTask = yield taskModel_js_1.default.findByIdAndUpdate(taskId, updatedTaskData, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ Message: "Task not found" });
        }
        res.json({ data: updatedTask });
    }
    catch (error) {
        console.error("Error updating task", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.put("/subscriptions/:subscriptionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptionId = req.params.subscriptionId;
        const updatedSubscriptionData = req.body;
        const requiredFields = ["name", "description", "price"];
        const missingFields = requiredFields.filter(field => !(field in updatedSubscriptionData));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        const updatedSubscription = yield subscriptionModel_js_1.default.findByIdAndUpdate(subscriptionId, updatedSubscriptionData, { new: true });
        if (!updatedSubscription) {
            return res.status(404).json({ Message: "Subscription not found" });
        }
        res.json({ data: updatedSubscription });
    }
    catch (error) {
        console.error("Error updating subscription", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
exports.default = router;

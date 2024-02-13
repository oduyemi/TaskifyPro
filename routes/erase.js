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
router.delete("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const deletedUser = yield userModel_js_1.default.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ Message: "User not found" });
        }
        res.json({ Message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.delete("/tasks/:taskId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = req.params.taskId;
        const deletedTask = yield taskModel_js_1.default.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ Message: "Task not found" });
        }
        res.json({ Message: "Task deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting task", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.delete("/task-categories/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.categoryId;
        const deletedCategory = yield taskCategoryModel_js_1.default.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ Message: "Task category not found" });
        }
        res.json({ Message: "Task category deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting task category", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.delete("/admins/:adminId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.params.adminId;
        const deletedAdmin = yield adminModel_js_1.default.findByIdAndDelete(adminId);
        if (!deletedAdmin) {
            return res.status(404).json({ Message: "Admin not found" });
        }
        res.json({ Message: "Admin deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting admin", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.delete("/subscriptions/:subscriptionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptionId = req.params.subscriptionId;
        const deletedSubscription = yield subscriptionModel_js_1.default.findByIdAndDelete(subscriptionId);
        if (!deletedSubscription) {
            return res.status(404).json({ Message: "Subscription not found" });
        }
        res.json({ Message: "Subscription deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting subscription", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
exports.default = router;

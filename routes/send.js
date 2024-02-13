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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = require("bcrypt");
const twilio_1 = __importDefault(require("twilio"));
const stripe_1 = __importDefault(require("stripe"));
const taskModel_js_1 = __importDefault(require("../models/taskModel.js"));
const taskCategoryModel_js_1 = __importDefault(require("../models/taskCategoryModel.js"));
const userModel_js_1 = __importDefault(require("../models/userModel.js"));
const adminModel_js_1 = __importDefault(require("../models/adminModel.js"));
const router = express_1.default.Router();
const { accountSid, authToken } = process.env;
const client = (0, twilio_1.default)(accountSid, authToken);
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeClient = new stripe_1.default(stripeSecretKey, {
    apiVersion: "2023-10-16",
});
require("dotenv").config();
const PIN_EXPIRY_TIME = 10 * 60 * 1000;
const sendSMSVerification = (pin, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.messages.create({
            body: `Your registration PIN is: ${pin}`,
            to: phoneNumber,
            from: "+12052361255",
        });
        return true;
    }
    catch (error) {
        console.error("Error sending SMS verification:", error);
        return false;
    }
});
router.post("/sms-status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { MessageStatus, MessageSid } = req.body;
    console.log(`Message SID: ${MessageSid}, Status: ${MessageStatus}`);
    res.sendStatus(200);
}));
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fname, lname, email, phone, password, confirmPassword } = req.body;
        if (![fname, lname, email, phone, password, confirmPassword].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Both passwords must match!" });
        }
        const existingUser = yield userModel_js_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        const newUser = new userModel_js_1.default({ fname, lname, email, phone, password: hashedPassword });
        yield newUser.save();
        yield newUser.populate("subscription");
        // Access token
        const token = jsonwebtoken_1.default.sign({
            userID: newUser._id,
            email: newUser.email
        }, process.env.JWT_SECRET);
        // User session
        const userSession = {
            userID: newUser._id,
            fname,
            lname,
            email,
            phone,
            subscription: newUser.subscription
        };
        req.session.user = userSession;
        return res.status(201).json({
            message: "User registered successfully.",
            token,
            nextStep: "/next-login-page",
        });
    }
    catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Error registering user" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (![email, password].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        try {
            const user = yield userModel_js_1.default.findOne({ email });
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "Email not registered. Please register first." });
            }
            const isPasswordMatch = yield (0, bcrypt_1.compare)(password, user.password);
            if (!isPasswordMatch) {
                return res.status(401).json({ message: "Incorrect email or password" });
            }
            const pin = Math.floor(1000 + Math.random() * 9000).toString();
            const phoneNumber = user.email;
            req.session.registrationPin = {
                pin,
                expiryTime: Date.now() + PIN_EXPIRY_TIME,
            };
            const smsSent = yield sendSMSVerification(pin, phoneNumber);
            if (!smsSent) {
                return res.status(500).json({ message: "Error sending registration PIN" });
            }
            // Access token
            const token = jsonwebtoken_1.default.sign({
                userID: user._id,
                email: user.email
            }, process.env.JWT_SECRET || "default_secret");
            const userSession = {
                userID: user._id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                phone: user.phone,
                subscription: user.subscription
            };
            req.session.user = userSession;
            return res.status(201).json({
                message: "User login successful. PIN sent via SMS.",
                pin,
                nextStep: "/next-user-dashboard",
            });
        }
        catch (error) {
            console.error("Error during user login:", error);
            return res.status(500).json({ message: "Error logging in user" });
        }
    }
    catch (error) {
        console.error("Error during user login:", error);
        return res.status(500).json({ message: "Error logging in user" });
    }
}));
router.post("/admin/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fname, lname, email, phone, password, confirmPassword } = req.body;
        if (![fname, lname, email, phone, password, confirmPassword].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Both passwords must match!" });
        }
        const existingAdmin = yield adminModel_js_1.default.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        const newAdmin = new adminModel_js_1.default({ fname, lname, email, phone, password: hashedPassword });
        yield newAdmin.save();
        // Generate and send PIN
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const phoneNumber = phone;
        const smsSent = yield sendSMSVerification(pin, phoneNumber);
        if (!smsSent) {
            return res.status(500).json({ message: "Error sending registration PIN" });
        }
        // Access token
        const token = jsonwebtoken_1.default.sign({
            userID: newAdmin._id,
            email: newAdmin.email
        }, process.env.JWT_SECRET || "default_secret");
        // Admin session
        const adminSession = {
            adminID: newAdmin._id,
            fname,
            lname,
            email,
            phone
        };
        req.session.admin = adminSession;
        return res.status(201).json({
            message: "Administrator registered successfully. PIN sent via SMS.",
            nextStep: "/next-login-page",
        });
    }
    catch (error) {
        console.error("Error during Administrator registration:", error);
        return res.status(500).json({ message: "Error registering Administrator" });
    }
}));
router.post("/admin/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (![email, password].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        try {
            const admin = yield adminModel_js_1.default.findOne({ email });
            if (!admin) {
                return res
                    .status(401)
                    .json({ message: "Email not registered. Please register first." });
            }
            const isPasswordMatch = yield (0, bcrypt_1.compare)(password, admin.password);
            if (!isPasswordMatch) {
                return res.status(401).json({ message: "Incorrect email or password" });
            }
            const pin = Math.floor(1000 + Math.random() * 9000).toString();
            const phoneNumber = admin.email;
            req.session.registrationPin = {
                pin,
                expiryTime: Date.now() + PIN_EXPIRY_TIME,
            };
            const smsSent = yield sendSMSVerification(pin, phoneNumber);
            if (!smsSent) {
                return res.status(500).json({ message: "Error sending registration PIN" });
            }
            // Access token
            const token = jsonwebtoken_1.default.sign({
                userID: admin._id,
                email: admin.email
            }, process.env.JWT_SECRET || "default_secret");
            const adminSession = {
                adminID: admin._id,
                fname: admin.fname,
                lname: admin.lname,
                email: admin.email,
                phone: admin.phone,
            };
            req.session.admin = adminSession;
            return res.status(201).json({
                message: "Administrator login successful. PIN sent via SMS.",
                pin,
                nextStep: "/next-admin-dashboard",
            });
        }
        catch (error) {
            console.error("Error during administrator login:", error);
            return res.status(500).json({ message: "Error logging in administrator" });
        }
    }
    catch (error) {
        console.error("Error during administrator login:", error);
        return res.status(500).json({ message: "Error logging in administrator" });
    }
}));
router.post("/tasks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, category } = req.body;
        if (![name, description, category].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingCategory = yield taskCategoryModel_js_1.default.findOne({ name: category });
        if (!existingCategory) {
            return res.status(400).json({ message: "Invalid task category" });
        }
        // New task
        const newTask = new taskModel_js_1.default({ name, description, category: existingCategory._id });
        yield newTask.save();
        return res.status(201).json({ message: "Task created successfully", task: newTask });
    }
    catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Error creating task" });
    }
}));
router.post("/task-categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name field is required" });
        }
        const existingCategory = yield taskCategoryModel_js_1.default.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Task category already exists" });
        }
        // New category
        const newCategory = new taskCategoryModel_js_1.default({ name });
        yield newCategory.save();
        return res.status(201).json({ message: "Task category created successfully", category: newCategory });
    }
    catch (error) {
        console.error("Error creating task category:", error);
        return res.status(500).json({ message: "Error creating task category" });
    }
}));
router.post("/subscribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const user = yield userModel_js_1.default.findById(req.session.user.userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Construct event object from the request
        const sig = req.headers["stripe-signature"];
        const stripeWebhookSecret = "your-stripe-webhook-secret"; // Ensure this is defined
        let event;
        try {
            const requestBody = JSON.stringify(req.body);
            event = stripeClient.webhooks.constructEvent(requestBody, sig, stripeWebhookSecret);
        }
        catch (err) {
            console.error("Error verifying webhook signature:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        switch (event.type) {
            case "payment_intent.succeeded":
                // Update user status to PAID in the db
                user.status = "paid";
                yield user.save();
                console.log("User status updated to 'paid'");
                break;
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error("Error processing webhook event:", error);
        res.status(500).json({ message: "Error processing webhook event" });
    }
}));
// Stripe webhook events
router.post("/stripe-webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers["stripe-signature"];
    console.log("Type of req.body:", typeof req.body);
    console.log("Type of sig:", typeof sig);
    if (!sig) {
        return res.status(400).send("Missing stripe-signature header");
    }
    let event;
    try {
        event = stripeClient.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    }
    catch (err) {
        console.error("Error verifying webhook signature:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        // Update user status to "paid"
        try {
            const user = yield userModel_js_1.default.findOne({ customerId });
            if (user) {
                user.status = "paid";
                yield user.save();
            }
        }
        catch (error) {
            console.error("Error updating user status:", error);
            return res.status(500).json({ message: "Error updating user status" });
        }
    }
    res.status(200).json({ received: true });
}));
router.post("/logout", (req, res) => {
    try {
        // Pop user session
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying user session:", err);
                return res.status(500).json({ message: "Error logging out user" });
            }
            return res.status(200).json({ message: "User logged out successfully" });
        });
    }
    catch (error) {
        console.error("Error logging out user:", error);
        return res.status(500).json({ message: "Error logging out user" });
    }
});
router.post("/admin/logout", (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying admin session:", err);
                return res.status(500).json({ message: "Error logging out admin" });
            }
            return res.status(200).json({ message: "Admin logged out successfully" });
        });
    }
    catch (error) {
        console.error("Error logging out admin:", error);
        return res.status(500).json({ message: "Error logging out admin" });
    }
});
exports.default = router;

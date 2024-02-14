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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var bcrypt_1 = require("bcrypt");
var twilio_1 = require("twilio");
var stripe_1 = require("stripe");
var taskModel_js_1 = require("../models/taskModel.js");
var taskCategoryModel_js_1 = require("../models/taskCategoryModel.js");
var userModel_js_1 = require("../models/userModel.js");
var adminModel_js_1 = require("../models/adminModel.js");
var router = express_1["default"].Router();
var _a = process.env, TWILIO_ACCOUNT_SID = _a.TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN = _a.TWILIO_AUTH_TOKEN;
var client = twilio_1["default"](TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
var stripeSecretKey = process.env.STRIPE_SECRET_KEY;
var stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
var stripeClient = new stripe_1["default"](stripeSecretKey, {
    apiVersion: "2023-10-16"
});
require("dotenv").config();
var PIN_EXPIRY_TIME = 10 * 60 * 1000;
var sendSMSVerification = function (pin, phoneNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.messages.create({
                        body: "Your registration PIN is: " + pin,
                        to: phoneNumber,
                        from: "+12052361255"
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, true];
            case 2:
                error_1 = _a.sent();
                console.error("Error sending SMS verification:", error_1);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
router.post("/sms-status", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, MessageStatus, MessageSid;
    return __generator(this, function (_b) {
        _a = req.body, MessageStatus = _a.MessageStatus, MessageSid = _a.MessageSid;
        console.log("Message SID: " + MessageSid + ", Status: " + MessageStatus);
        res.sendStatus(200);
        return [2 /*return*/];
    });
}); });
router.post("/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fname, lname, email, phone, password, confirmPassword, existingUser, hashedPassword, newUser, token, userSession, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, fname = _a.fname, lname = _a.lname, email = _a.email, phone = _a.phone, password = _a.password, confirmPassword = _a.confirmPassword;
                if (![fname, lname, email, phone, password, confirmPassword].every(function (field) { return field; })) {
                    return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                }
                if (password !== confirmPassword) {
                    return [2 /*return*/, res.status(400).json({ message: "Both passwords must match!" })];
                }
                return [4 /*yield*/, userModel_js_1["default"].findOne({ email: email })];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({ message: "Email already registered" })];
                }
                return [4 /*yield*/, bcrypt_1.hash(password, 10)];
            case 2:
                hashedPassword = _b.sent();
                newUser = new userModel_js_1["default"]({ fname: fname, lname: lname, email: email, phone: phone, password: hashedPassword });
                return [4 /*yield*/, newUser.save()];
            case 3:
                _b.sent();
                return [4 /*yield*/, newUser.populate("subscription")];
            case 4:
                _b.sent();
                token = jsonwebtoken_1["default"].sign({
                    userID: newUser._id,
                    email: newUser.email
                }, process.env.JWT_SECRET);
                userSession = {
                    userID: newUser._id,
                    fname: fname,
                    lname: lname,
                    email: email,
                    phone: phone,
                    subscription: newUser.subscription
                };
                req.session.user = userSession;
                return [2 /*return*/, res.status(201).json({
                        message: "User registered successfully.",
                        token: token,
                        nextStep: "/next-login-page"
                    })];
            case 5:
                error_2 = _b.sent();
                console.error("Error during user registration:", error_2);
                return [2 /*return*/, res.status(500).json({ message: "Error registering user" })];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isPasswordMatch, pin, phoneNumber, smsSent, token, userSession, error_3, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                _a = req.body, email = _a.email, password = _a.password;
                if (![email, password].every(function (field) { return field; })) {
                    return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, userModel_js_1["default"].findOne({ email: email })];
            case 2:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res
                            .status(401)
                            .json({ message: "Email not registered. Please register first." })];
                }
                return [4 /*yield*/, bcrypt_1.compare(password, user.password)];
            case 3:
                isPasswordMatch = _b.sent();
                if (!isPasswordMatch) {
                    return [2 /*return*/, res.status(401).json({ message: "Incorrect email or password" })];
                }
                pin = Math.floor(1000 + Math.random() * 9000).toString();
                phoneNumber = user.email;
                req.session.registrationPin = {
                    pin: pin,
                    expiryTime: Date.now() + PIN_EXPIRY_TIME
                };
                return [4 /*yield*/, sendSMSVerification(pin, phoneNumber)];
            case 4:
                smsSent = _b.sent();
                if (!smsSent) {
                    return [2 /*return*/, res.status(500).json({ message: "Error sending registration PIN" })];
                }
                token = jsonwebtoken_1["default"].sign({
                    userID: user._id,
                    email: user.email
                }, process.env.JWT_SECRET || "default_secret");
                userSession = {
                    userID: user._id,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email,
                    phone: user.phone,
                    subscription: user.subscription
                };
                req.session.user = userSession;
                return [2 /*return*/, res.status(201).json({
                        message: "User login successful. PIN sent via SMS.",
                        pin: pin,
                        nextStep: "/next-user-dashboard"
                    })];
            case 5:
                error_3 = _b.sent();
                console.error("Error during user login:", error_3);
                return [2 /*return*/, res.status(500).json({ message: "Error logging in user" })];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_4 = _b.sent();
                console.error("Error during user login:", error_4);
                return [2 /*return*/, res.status(500).json({ message: "Error logging in user" })];
            case 8: return [2 /*return*/];
        }
    });
}); });
router.post("/admin/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fname, lname, email, phone, password, confirmPassword, existingAdmin, hashedPassword, newAdmin, pin, phoneNumber, smsSent, token, adminSession, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, fname = _a.fname, lname = _a.lname, email = _a.email, phone = _a.phone, password = _a.password, confirmPassword = _a.confirmPassword;
                if (![fname, lname, email, phone, password, confirmPassword].every(function (field) { return field; })) {
                    return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                }
                if (password !== confirmPassword) {
                    return [2 /*return*/, res.status(400).json({ message: "Both passwords must match!" })];
                }
                return [4 /*yield*/, adminModel_js_1["default"].findOne({ email: email })];
            case 1:
                existingAdmin = _b.sent();
                if (existingAdmin) {
                    return [2 /*return*/, res.status(400).json({ message: "Email already registered" })];
                }
                return [4 /*yield*/, bcrypt_1.hash(password, 10)];
            case 2:
                hashedPassword = _b.sent();
                newAdmin = new adminModel_js_1["default"]({ fname: fname, lname: lname, email: email, phone: phone, password: hashedPassword });
                return [4 /*yield*/, newAdmin.save()];
            case 3:
                _b.sent();
                pin = Math.floor(1000 + Math.random() * 9000).toString();
                phoneNumber = phone;
                return [4 /*yield*/, sendSMSVerification(pin, phoneNumber)];
            case 4:
                smsSent = _b.sent();
                if (!smsSent) {
                    return [2 /*return*/, res.status(500).json({ message: "Error sending registration PIN" })];
                }
                token = jsonwebtoken_1["default"].sign({
                    userID: newAdmin._id,
                    email: newAdmin.email
                }, process.env.JWT_SECRET || "default_secret");
                adminSession = {
                    adminID: newAdmin._id,
                    fname: fname,
                    lname: lname,
                    email: email,
                    phone: phone
                };
                req.session.admin = adminSession;
                return [2 /*return*/, res.status(201).json({
                        message: "Administrator registered successfully. PIN sent via SMS.",
                        nextStep: "/next-login-page"
                    })];
            case 5:
                error_5 = _b.sent();
                console.error("Error during Administrator registration:", error_5);
                return [2 /*return*/, res.status(500).json({ message: "Error registering Administrator" })];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post("/admin/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, admin, isPasswordMatch, pin, phoneNumber, smsSent, token, adminSession, error_6, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                _a = req.body, email = _a.email, password = _a.password;
                if (![email, password].every(function (field) { return field; })) {
                    return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, adminModel_js_1["default"].findOne({ email: email })];
            case 2:
                admin = _b.sent();
                if (!admin) {
                    return [2 /*return*/, res
                            .status(401)
                            .json({ message: "Email not registered. Please register first." })];
                }
                return [4 /*yield*/, bcrypt_1.compare(password, admin.password)];
            case 3:
                isPasswordMatch = _b.sent();
                if (!isPasswordMatch) {
                    return [2 /*return*/, res.status(401).json({ message: "Incorrect email or password" })];
                }
                pin = Math.floor(1000 + Math.random() * 9000).toString();
                phoneNumber = admin.email;
                req.session.registrationPin = {
                    pin: pin,
                    expiryTime: Date.now() + PIN_EXPIRY_TIME
                };
                return [4 /*yield*/, sendSMSVerification(pin, phoneNumber)];
            case 4:
                smsSent = _b.sent();
                if (!smsSent) {
                    return [2 /*return*/, res.status(500).json({ message: "Error sending registration PIN" })];
                }
                token = jsonwebtoken_1["default"].sign({
                    userID: admin._id,
                    email: admin.email
                }, process.env.JWT_SECRET || "default_secret");
                adminSession = {
                    adminID: admin._id,
                    fname: admin.fname,
                    lname: admin.lname,
                    email: admin.email,
                    phone: admin.phone
                };
                req.session.admin = adminSession;
                return [2 /*return*/, res.status(201).json({
                        message: "Administrator login successful. PIN sent via SMS.",
                        pin: pin,
                        nextStep: "/next-admin-dashboard"
                    })];
            case 5:
                error_6 = _b.sent();
                console.error("Error during administrator login:", error_6);
                return [2 /*return*/, res.status(500).json({ message: "Error logging in administrator" })];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_7 = _b.sent();
                console.error("Error during administrator login:", error_7);
                return [2 /*return*/, res.status(500).json({ message: "Error logging in administrator" })];
            case 8: return [2 /*return*/];
        }
    });
}); });
router.post("/tasks", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, description, category, existingCategory, newTask, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, name = _a.name, description = _a.description, category = _a.category;
                if (![name, description, category].every(function (field) { return field; })) {
                    return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                }
                return [4 /*yield*/, taskCategoryModel_js_1["default"].findOne({ name: category })];
            case 1:
                existingCategory = _b.sent();
                if (!existingCategory) {
                    return [2 /*return*/, res.status(400).json({ message: "Invalid task category" })];
                }
                newTask = new taskModel_js_1["default"]({ name: name, description: description, category: existingCategory._id });
                return [4 /*yield*/, newTask.save()];
            case 2:
                _b.sent();
                return [2 /*return*/, res.status(201).json({ message: "Task created successfully", task: newTask })];
            case 3:
                error_8 = _b.sent();
                console.error("Error creating task:", error_8);
                return [2 /*return*/, res.status(500).json({ message: "Error creating task" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/task-categories", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name, existingCategory, newCategory, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                name = req.body.name;
                if (!name) {
                    return [2 /*return*/, res.status(400).json({ message: "Name field is required" })];
                }
                return [4 /*yield*/, taskCategoryModel_js_1["default"].findOne({ name: name })];
            case 1:
                existingCategory = _a.sent();
                if (existingCategory) {
                    return [2 /*return*/, res.status(400).json({ message: "Task category already exists" })];
                }
                newCategory = new taskCategoryModel_js_1["default"]({ name: name });
                return [4 /*yield*/, newCategory.save()];
            case 2:
                _a.sent();
                return [2 /*return*/, res.status(201).json({ message: "Task category created successfully", category: newCategory })];
            case 3:
                error_9 = _a.sent();
                console.error("Error creating task category:", error_9);
                return [2 /*return*/, res.status(500).json({ message: "Error creating task category" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/subscribe", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, sig, stripeWebhookSecret_1, event, requestBody, _a, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                if (!req.session || !req.session.user) {
                    return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                }
                return [4 /*yield*/, userModel_js_1["default"].findById(req.session.user.userID)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                }
                sig = req.headers["stripe-signature"];
                stripeWebhookSecret_1 = "your-stripe-webhook-secret";
                event = void 0;
                try {
                    requestBody = JSON.stringify(req.body);
                    event = stripeClient.webhooks.constructEvent(requestBody, sig, stripeWebhookSecret_1);
                }
                catch (err) {
                    console.error("Error verifying webhook signature:", err.message);
                    return [2 /*return*/, res.status(400).send("Webhook Error: " + err.message)];
                }
                _a = event.type;
                switch (_a) {
                    case "payment_intent.succeeded": return [3 /*break*/, 2];
                }
                return [3 /*break*/, 4];
            case 2:
                // Update user status to PAID in the db
                user.status = "paid";
                return [4 /*yield*/, user.save()];
            case 3:
                _b.sent();
                console.log("User status updated to 'paid'");
                return [3 /*break*/, 4];
            case 4:
                res.status(200).json({ received: true });
                return [3 /*break*/, 6];
            case 5:
                error_10 = _b.sent();
                console.error("Error processing webhook event:", error_10);
                res.status(500).json({ message: "Error processing webhook event" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Stripe webhook events
router.post("/stripe-webhook", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sig, event, invoice, customerId, user, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sig = req.headers["stripe-signature"];
                console.log("Type of req.body:", typeof req.body);
                console.log("Type of sig:", typeof sig);
                if (!sig) {
                    return [2 /*return*/, res.status(400).send("Missing stripe-signature header")];
                }
                try {
                    event = stripeClient.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
                }
                catch (err) {
                    console.error("Error verifying webhook signature:", err.message);
                    return [2 /*return*/, res.status(400).send("Webhook Error: " + err.message)];
                }
                if (!(event.type === "invoice.payment_succeeded")) return [3 /*break*/, 6];
                invoice = event.data.object;
                customerId = invoice.customer;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, userModel_js_1["default"].findOne({ customerId: customerId })];
            case 2:
                user = _a.sent();
                if (!user) return [3 /*break*/, 4];
                user.status = "paid";
                return [4 /*yield*/, user.save()];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_11 = _a.sent();
                console.error("Error updating user status:", error_11);
                return [2 /*return*/, res.status(500).json({ message: "Error updating user status" })];
            case 6:
                res.status(200).json({ received: true });
                return [2 /*return*/];
        }
    });
}); });
router.post("/logout", function (req, res) {
    try {
        // Pop user session
        req.session.destroy(function (err) {
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
router.post("/admin/logout", function (req, res) {
    try {
        req.session.destroy(function (err) {
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
exports["default"] = router;

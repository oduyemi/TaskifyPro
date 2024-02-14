import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcrypt";
import twilio from "twilio";
import Stripe from "stripe";
import Task, { ITask } from "../models/taskModel.js";
import mongoose, { Schema, Document } from "mongoose";
import TaskCategory, { ITaskCategory} from "../models/taskCategoryModel.js";
import Subscription, { ISubscription} from "../models/subscriptionModel.js";
import User, { IUser } from "../models/userModel.js";
import Admin, { IAdmin } from "../models/adminModel.js";

const router = express.Router();

const { accountSid, authToken } = process.env;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripeClient = new Stripe(stripeSecretKey!, {
    apiVersion: "2023-10-16",
  });
  
  
  

require("dotenv").config();

interface UserSession {
    userID: mongoose.Types.ObjectId; 
    fname: string;
    lname: string;
    email: string;
    phone: string;
    subscription?: mongoose.Types.ObjectId;
  }
  
  interface RegistrationPinSession {
    pin: string;
    expiryTime: number;
  }

  interface AdminSession {
    adminID: mongoose.Types.ObjectId;
    fname: string;
    lname: string;
    email: string;
    phone: string;
  }

  declare module "express-session" {
    interface SessionData {
      user?: UserSession; 
      admin?: AdminSession;
      registrationPin?: RegistrationPinSession;
    }
  }
  
  const PIN_EXPIRY_TIME = 10 * 60 * 1000;

const sendSMSVerification = async (pin: string, phoneNumber: string) => {
    try {
        await client.messages.create({
            body: `Your registration PIN is: ${pin}`,
            to: phoneNumber,
            from: "+12052361255",
        });
        return true;
    } catch (error) {
        console.error("Error sending SMS verification:", error);
        return false;
    }
};

router.post("/sms-status", async (req: Request, res: Response) => {
    const { MessageStatus, MessageSid } = req.body;
    console.log(`Message SID: ${MessageSid}, Status: ${MessageStatus}`);
    res.sendStatus(200);
});

router.post("/register", async (req: Request, res: Response) => {
    try {
        const { fname, lname, email, phone, password, confirmPassword } = req.body;
        if (![fname, lname, email, phone, password, confirmPassword].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Both passwords must match!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await hash(password, 10);
        const newUser = new User({ fname, lname, email, phone, password: hashedPassword });
        await newUser.save();
        await newUser.populate("subscription");

        // Access token
        const token = jwt.sign(
            {
                userID: newUser._id,
                email: newUser.email
            },
            process.env.JWT_SECRET!,
        );

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
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Error registering user" });
    }
});

   
  
router.post("/login", async (req: Request, res: Response) => {
try {
    const { email, password } = req.body;
    if (![email, password].every((field) => field)) {
    return res.status(400).json({ message: "All fields are required" });
    }

    try {
    const user = await User.findOne({ email });
    if (!user) {
        return res
        .status(401)
        .json({ message: "Email not registered. Please register first." });
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Incorrect email or password" });
    }

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const phoneNumber = user.email;
    req.session.registrationPin = {
        pin,
        expiryTime: Date.now() + PIN_EXPIRY_TIME,
    };

    const smsSent = await sendSMSVerification(pin, phoneNumber);
    if (!smsSent) {
        return res.status(500).json({ message: "Error sending registration PIN" });
    }

    // Access token
    const token = jwt.sign(
        {
            userID: user._id,
            email: user.email
        },
        process.env.JWT_SECRET || "default_secret",
    );

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
    } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Error logging in user" });
    }
} catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Error logging in user" });
}
});


router.post("/admin/register", async (req: Request, res: Response) => {
    try {
        const { fname, lname, email, phone, password, confirmPassword } = req.body;
        if (![fname, lname, email, phone, password, confirmPassword].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Both passwords must match!" });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await hash(password, 10);
        const newAdmin = new Admin({ fname, lname, email, phone, password: hashedPassword });
        await newAdmin.save();

        // Generate and send PIN
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const phoneNumber = phone;
        const smsSent = await sendSMSVerification(pin, phoneNumber);

        if (!smsSent) {
            return res.status(500).json({ message: "Error sending registration PIN" });
        }

        // Access token
        const token = jwt.sign(
            {
                userID: newAdmin._id,
                email: newAdmin.email
            },
            process.env.JWT_SECRET || "default_secret",
        );

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
    } catch (error) {
        console.error("Error during Administrator registration:", error);
        return res.status(500).json({ message: "Error registering Administrator" });
    }
});



router.post("/admin/login", async (req: Request, res: Response) => {
try {
    const { email, password } = req.body;
    if (![email, password].every((field) => field)) {
    return res.status(400).json({ message: "All fields are required" });
    }

    try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res
        .status(401)
        .json({ message: "Email not registered. Please register first." });
    }

    const isPasswordMatch = await compare(password, admin.password);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Incorrect email or password" });
    }

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const phoneNumber = admin.email;
    req.session.registrationPin = {
        pin,
        expiryTime: Date.now() + PIN_EXPIRY_TIME,
    };

    const smsSent = await sendSMSVerification(pin, phoneNumber);
    if (!smsSent) {
        return res.status(500).json({ message: "Error sending registration PIN" });
    }

    // Access token
    const token = jwt.sign(
        {
            userID: admin._id,
            email: admin.email
        },
        process.env.JWT_SECRET || "default_secret",
    );        
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
    } catch (error) {
    console.error("Error during administrator login:", error);
    return res.status(500).json({ message: "Error logging in administrator" });
    }
} catch (error) {
    console.error("Error during administrator login:", error);
    return res.status(500).json({ message: "Error logging in administrator" });
}
});


router.post("/tasks", async (req: Request, res: Response) => {
    try {
        const { name, description, category } = req.body;
        if (![name, description, category].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingCategory = await TaskCategory.findOne({ name: category });
        if (!existingCategory) {
            return res.status(400).json({ message: "Invalid task category" });
        }

        // New task
        const newTask = new Task({ name, description, category: existingCategory._id });
        await newTask.save();

        return res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Error creating task" });
    }
});


router.post("/task-categories", async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name field is required" });
        }

        const existingCategory = await TaskCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Task category already exists" });
        }

        // New category
        const newCategory = new TaskCategory({ name });
        await newCategory.save();

        return res.status(201).json({ message: "Task category created successfully", category: newCategory });
    } catch (error) {
        console.error("Error creating task category:", error);
        return res.status(500).json({ message: "Error creating task category" });
    }
});


router.post("/subscribe", async (req: Request, res: Response) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user: IUser | null = await User.findById(req.session.user.userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Construct event object from the request
        const sig: string | string[] | undefined = req.headers["stripe-signature"];
        const stripeWebhookSecret: string = "your-stripe-webhook-secret"; // Ensure this is defined

        let event;

        try {
            const requestBody = JSON.stringify(req.body);
            event = stripeClient.webhooks.constructEvent(requestBody, sig as string, stripeWebhookSecret);
        } catch (err: any) {
            console.error("Error verifying webhook signature:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "payment_intent.succeeded":
                // Update user status to PAID in the db
                user.status = "paid";
                await user.save();
                console.log("User status updated to 'paid'");
                break;
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error processing webhook event:", error);
        res.status(500).json({ message: "Error processing webhook event" });
    }
});

 // Stripe webhook events
router.post("/stripe-webhook", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    console.log("Type of req.body:", typeof req.body);
    console.log("Type of sig:", typeof sig);

    if (!sig) {
        return res.status(400).send("Missing stripe-signature header");
    }

    let event;

    try {
        event = stripeClient.webhooks.constructEvent(req.body as Buffer, sig as string, stripeWebhookSecret!);
    } catch (err: any) {
        console.error("Error verifying webhook signature:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Update user status to "paid"
        try {
            const user = await User.findOne({ customerId });
            if (user) {
                user.status = "paid";
                await user.save();
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            return res.status(500).json({ message: "Error updating user status" });
        }
    }

    res.status(200).json({ received: true });
});


    
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
    } catch (error) {
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
    } catch (error) {
        console.error("Error logging out admin:", error);
        return res.status(500).json({ message: "Error logging out admin" });
    }
});

















export default router;
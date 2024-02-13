import mongoose, { Schema, Document } from "mongoose";
import { ISubscription } from "./subscriptionModel";

export interface IUser extends Document {
  user_id: mongoose.Types.ObjectId;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  salt: string;
  subscription: ISubscription["_id"];
}

const userSchema: Schema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: "Subscription"
  },
  createdAt: { 
    type: Date, default: Date.now 
  },
  updatedAt: { 
    type: Date, default: Date.now
  }
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;

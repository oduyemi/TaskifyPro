import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  task_id: mongoose.Types.ObjectId;
  title: string;
  task_category_id: mongoose.Types.ObjectId;
  description: string;
  img: string;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  task_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories", 
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", taskSchema);


export default Task;
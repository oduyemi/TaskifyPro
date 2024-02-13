import mongoose, { Schema, Document } from "mongoose";

export interface ITaskCategory extends Document {
  task_category_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
}

const taskCategorySchema: Schema = new mongoose.Schema({
    name: {
        type: String,
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
    });

const Categories = mongoose.model<ITaskCategory>("Categories", taskCategorySchema);


export default Categories;
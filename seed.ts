import { MongoClient, ObjectId } from "mongodb";
import { Collection } from "mongodb";
import Categories from "./models/taskCategoryModel.js";
require("dotenv").config();

const seedDatabase = async () => {
    const url: string = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    const client = new MongoClient(url);
    try {
        await client.connect();
        const taskCategory: Collection<any> = client.db("taskifyprodb").collection("categories");
  
        await taskCategory.drop();

        const categories = [
          { name: "Frontend Web Application", description: "These are frontend web development projects or tasks", img: "https://res.cloudinary.com/dymd1jkbl/image/upload/v1691953768/taskifypro/web.jpg" },
          { name: "Frontend Mobile Application", description: "These are mobile frontend projects or tasks", img: "https://res.cloudinary.com/dymd1jkbl/image/upload/v1691953768/taskifypro/mobile.jpg" },
          { name: "Backend", description: "These are backend projects or tasks", img: "https://res.cloudinary.com/dymd1jkbl/image/upload/v1691953768/taskifypro/backend.jpg" },
          { name: "Fullstack", description: "Build fullstack CRUD applications", img: "https://res.cloudinary.com/dymd1jkbl/image/upload/v1691953768/taskifypro/fullstack.jpg" }
        ];
        for (const category of categories) {
          await taskCategory.insertOne(category);
        }
    
        console.log("task categories created successfully!");

      } catch (e) {
        console.error(e);
      } finally {
        await client.close();
      }
};

seedDatabase();
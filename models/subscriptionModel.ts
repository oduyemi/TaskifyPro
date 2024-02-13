import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  subscription_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
}

const subscriptionSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true
  }
});

const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);


export default Subscription;
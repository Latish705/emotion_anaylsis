import mongoose from "mongoose";
import { Document, model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IEmotion extends Document {
  id?: string;
  userId: IUser["id"];
  emotion: number;
  description: string;
}

const EmotionSchema = new Schema<IEmotion>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    emotion: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Emotion = model("Emotion", EmotionSchema);
export default Emotion;

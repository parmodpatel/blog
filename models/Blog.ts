import mongoose, { models, Schema } from "mongoose";

export type BlogDocument = {
  _id: mongoose.Types.ObjectId;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  imagePublicId?: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const BlogSchema = new Schema<BlogDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: String,
    imagePublicId: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default models.Blog ||
  mongoose.model<BlogDocument>("Blog", BlogSchema);

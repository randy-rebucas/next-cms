import { Schema, model, models, Document } from "mongoose";

export interface IPage extends Document {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  author: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, default: "" },
    content: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    status: { type: String, default: "draft" },
    author: { type: String, default: "Atty. Levi Baligod" },
    featured_image: { type: String, default: "" },
    meta_title: { type: String, default: "" },
    meta_description: { type: String, default: "" },
    og_image: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Page = models.Page ?? model<IPage>("Page", PageSchema);

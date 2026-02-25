import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId;
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },

    description: { type: String },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

export const Category =
  models.Category ?? model<ICategory>("Category", CategorySchema);

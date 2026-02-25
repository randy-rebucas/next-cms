import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

export const Tag = models.Tag ?? model<ITag>("Tag", TagSchema);

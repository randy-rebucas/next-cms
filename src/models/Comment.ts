import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  authorName?: string;
  authorEmail?: string;
  content?: string;
  status: "approved" | "pending" | "spam";
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    authorName: { type: String },
    authorEmail: { type: String },

    content: { type: String },

    status: {
      type: String,
      enum: ["approved", "pending", "spam"],
      default: "pending",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

export const Comment =
  models.Comment ?? model<IComment>("Comment", CommentSchema);

import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IRevision extends Document {
  post: Types.ObjectId;
  title: string;
  content: unknown;
  excerpt?: string;
  status: string;
  revisionNumber: number;
  savedBy?: string;
  createdAt: Date;
}

const RevisionSchema = new Schema<IRevision>(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed },
    excerpt: { type: String },
    status: { type: String, default: "draft" },
    revisionNumber: { type: Number, default: 1 },
    /** Author display name at time of save */
    savedBy: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const MAX_REVISIONS_PER_POST = 20;

export const Revision = models.Revision ?? model<IRevision>("Revision", RevisionSchema);

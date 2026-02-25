import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IMedia extends Document {
  fileName?: string;
  url?: string;
  mimeType?: string;
  size?: number;
  uploadedBy?: Types.ObjectId;
  tenantId?: Types.ObjectId;
  // Legacy fields kept for backward-compat with media upload API
  filename?: string;
  original_name?: string;
  mime_type?: string;
  size_bytes?: number;
  alt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    fileName: { type: String },
    url: { type: String },
    mimeType: { type: String },
    size: { type: Number },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },

    // Legacy fields
    filename: { type: String },
    original_name: { type: String },
    mime_type: { type: String },
    size_bytes: { type: Number },
    alt: { type: String },
  },
  { timestamps: true }
);

export const Media = models.Media ?? model<IMedia>("Media", MediaSchema);

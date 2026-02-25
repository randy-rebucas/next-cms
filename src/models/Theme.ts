import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ITheme extends Document {
  name: string;
  key: string;
  version?: string;
  author?: string;
  isActive: boolean;
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema = new Schema<ITheme>(
  {
    name: { type: String },
    key: { type: String, unique: true },

    version: { type: String },
    author: { type: String },

    isActive: {
      type: Boolean,
      default: false,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

export const Theme = models.Theme ?? model<ITheme>("Theme", ThemeSchema);

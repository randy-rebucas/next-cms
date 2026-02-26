import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ITheme extends Document {
  name: string;
  key: string;
  description?: string;
  version?: string;
  author?: string;
  isActive: boolean;
  colors?: Record<string, string>;  // visual config: primaryColor, accentColor, bgDark, fontFamily, borderRadius
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema = new Schema<ITheme>(
  {
    name: { type: String, required: true },
    key:  { type: String, required: true, unique: true },

    description: { type: String, default: "" },
    version:     { type: String, default: "1.0.0" },
    author:      { type: String, default: "" },

    isActive: { type: Boolean, default: false },

    colors: {
      type: Map,
      of: String,
      default: {},
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

export const Theme = models.Theme ?? model<ITheme>("Theme", ThemeSchema);

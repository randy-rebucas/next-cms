import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IPlugin extends Document {
  name: string;
  key: string;
  version?: string;
  author?: string;
  isActive: boolean;
  settings: Record<string, unknown>;
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PluginSchema = new Schema<IPlugin>(
  {
    name: { type: String },
    key: { type: String, unique: true },

    version: { type: String },
    author: { type: String },

    isActive: {
      type: Boolean,
      default: false,
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

export const Plugin = models.Plugin ?? model<IPlugin>("Plugin", PluginSchema);

import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ITenant extends Document {
  name: string;
  domain?: string;
  subdomain?: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended";
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    domain: { type: String, unique: true, sparse: true },
    subdomain: { type: String, unique: true, sparse: true },

    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const Tenant = models.Tenant ?? model<ITenant>("Tenant", TenantSchema);

import mongoose, { Schema, model, models, Document, Types } from "mongoose";
import type { Role } from "@/core/rbac";

export interface IUser extends Document {
  name?: string;
  email: string;
  /** Bcrypt hash — stored as `password_hash` to distinguish from plaintext */
  password_hash: string;
  role: Role;
  permissions: string[];
  tenantId?: Types.ObjectId;
  status: "active" | "disabled";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true },

    /** Field name kept as password_hash for auth compatibility */
    password_hash: { type: String, default: "" },

    role: {
      type: String,
      enum: ["admin", "editor", "author", "subscriber"],
      default: "subscriber",
    },

    permissions: {
      type: [String],
      default: [],
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const User = models.User ?? model<IUser>("User", UserSchema);

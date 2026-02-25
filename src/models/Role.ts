import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IRole extends Document {
  name: string;
  key: string;
  permissions: string[];
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true },

    permissions: {
      type: [String],
      default: [],
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

export const Role = models.Role ?? model<IRole>("Role", RoleSchema);

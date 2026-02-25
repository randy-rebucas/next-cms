import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: unknown;
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true },

    value: { type: mongoose.Schema.Types.Mixed },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  { timestamps: true }
);

// Compound unique index: one key per tenant (null tenantId = global)
SettingSchema.index({ key: 1, tenantId: 1 }, { unique: true });

export const Setting =
  models.Setting ?? model<ISetting>("Setting", SettingSchema);

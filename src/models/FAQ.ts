import { Schema, model, models, Document } from "mongoose";

export interface IFAQ extends Document {
  question: string;
  answer: string;
  sort_order: number;
  status: string;
}

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true, default: "" },
  answer: { type: String, default: "" },
  sort_order: { type: Number, default: 0 },
  status: { type: String, default: "published" },
});

export const FAQ = models.FAQ ?? model<IFAQ>("FAQ", FAQSchema);

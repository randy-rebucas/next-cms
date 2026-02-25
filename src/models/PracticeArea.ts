import { Schema, model, models, Document } from "mongoose";

export interface IPracticeArea extends Document {
  icon: string;
  title: string;
  description: string;
  bullets: string[];
  color: string;
  bg: string;
  sort_order: number;
  status: string;
}

const PracticeAreaSchema = new Schema<IPracticeArea>({
  icon: { type: String, default: "📌" },
  title: { type: String, required: true, default: "" },
  description: { type: String, default: "" },
  bullets: { type: [String], default: [] },
  color: { type: String, default: "border-amber-500" },
  bg: { type: String, default: "bg-amber-50" },
  sort_order: { type: Number, default: 0 },
  status: { type: String, default: "published" },
});

export const PracticeArea =
  models.PracticeArea ?? model<IPracticeArea>("PracticeArea", PracticeAreaSchema);

import { Schema, model, models, Document } from "mongoose";

export interface IExperience extends Document {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  sort_order: number;
}

const ExperienceSchema = new Schema<IExperience>({
  year: { type: String, required: true, default: "" },
  title: { type: String, required: true, default: "" },
  subtitle: { type: String, default: "" },
  description: { type: String, default: "" },
  sort_order: { type: Number, default: 0 },
});

export const Experience =
  models.Experience ?? model<IExperience>("Experience", ExperienceSchema);

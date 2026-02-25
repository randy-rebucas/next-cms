import { Schema, model, models, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  case_type: string;
  rating: number;
  text: string;
  initials: string;
  color: string;
  status: string;
}

const TestimonialSchema = new Schema<ITestimonial>({
  name: { type: String, required: true, default: "" },
  case_type: { type: String, default: "" },
  rating: { type: Number, default: 5 },
  text: { type: String, default: "" },
  initials: { type: String, default: "" },
  color: { type: String, default: "bg-slate-600" },
  status: { type: String, default: "published" },
});

export const Testimonial =
  models.Testimonial ?? model<ITestimonial>("Testimonial", TestimonialSchema);

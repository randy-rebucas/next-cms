import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IMenuItem {
  _id?: mongoose.Types.ObjectId;
  label: string;
  type: "page" | "post" | "custom" | "category";
  url: string;          // resolved href for rendering
  target: "_self" | "_blank";
  order: number;
  parentId?: string | null;  // _id of parent item (for nesting, future use)
}

export interface IMenu extends Document {
  name: string;
  location: string;   // e.g. "primary", "footer", "mobile"
  items: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    label:    { type: String, required: true },
    type:     { type: String, enum: ["page", "post", "custom", "category"], default: "custom" },
    url:      { type: String, default: "" },
    target:   { type: String, enum: ["_self", "_blank"], default: "_self" },
    order:    { type: Number, default: 0 },
    parentId: { type: String, default: null },
  },
  { _id: true }
);

const MenuSchema = new Schema<IMenu>(
  {
    name:     { type: String, required: true },
    location: { type: String, required: true, unique: true },
    items:    { type: [MenuItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Menu = models.Menu ?? model<IMenu>("Menu", MenuSchema);

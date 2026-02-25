import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  slug: string;
  /** JSON block-based content or HTML string */
  content: unknown;
  excerpt?: string;
  status: "draft" | "published" | "archived";
  /** post | page | custom */
  type: string;
  author?: Types.ObjectId;
  categories: Types.ObjectId[];
  tags: Types.ObjectId[];
  featuredImage?: Types.ObjectId;
  meta: Record<string, unknown>;
  tenantId?: Types.ObjectId;
  // ── Legacy display fields (kept for backward-compat with admin UI) ───────
  read_time?: string;
  tag_css?: string;
  /** Legacy plain-text author name for display */
  author_name?: string;
  preview_token?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },

    content: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    excerpt: { type: String },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    type: {
      type: String,
      default: "post",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }],

    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    }],

    featuredImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },

    // Legacy display fields
    read_time: { type: String },
    tag_css: { type: String },
    author_name: { type: String },
    preview_token: { type: String, default: null },
  },
  { timestamps: true }
);

export const Post = models.Post ?? model<IPost>("Post", PostSchema);

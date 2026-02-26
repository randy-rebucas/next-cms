"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Minus,
  Image as ImageIcon,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onChange, placeholder = "Start writing…" }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none min-h-[320px] px-5 py-4 focus:outline-none text-slate-200 [&_h2]:text-amber-400 [&_h3]:text-amber-300 [&_blockquote]:border-l-amber-500 [&_a]:text-amber-400",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const iconBtn = (active: boolean, Icon: React.ElementType, label: string, action: () => void) => (
    <button
      key={label}
      type="button"
      title={label}
      onClick={action}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"
      }`}
    >
      <Icon size={15} />
    </button>
  );

  const addLink = () => {
    const url = window.prompt("URL:", editor.getAttributes("link").href);
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-slate-600 rounded-xl overflow-hidden bg-slate-800 focus-within:border-amber-500 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-700 bg-slate-900">
        {iconBtn(editor.isActive("bold"), Bold, "Bold", () => editor.chain().focus().toggleBold().run())}
        {iconBtn(editor.isActive("italic"), Italic, "Italic", () => editor.chain().focus().toggleItalic().run())}
        {iconBtn(editor.isActive("underline"), UnderlineIcon, "Underline", () => editor.chain().focus().toggleUnderline().run())}
        <span className="w-px h-4 bg-slate-700 mx-1" />
        {iconBtn(editor.isActive("heading", { level: 2 }), Heading2, "H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {iconBtn(editor.isActive("heading", { level: 3 }), Heading3, "H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        <span className="w-px h-4 bg-slate-700 mx-1" />
        {iconBtn(editor.isActive("bulletList"), List, "Bullet List", () => editor.chain().focus().toggleBulletList().run())}
        {iconBtn(editor.isActive("orderedList"), ListOrdered, "Numbered List", () => editor.chain().focus().toggleOrderedList().run())}
        {iconBtn(editor.isActive("blockquote"), Quote, "Quote", () => editor.chain().focus().toggleBlockquote().run())}
        {iconBtn(false, Minus, "Divider", () => editor.chain().focus().setHorizontalRule().run())}
        <span className="w-px h-4 bg-slate-700 mx-1" />
        {iconBtn(editor.isActive({ textAlign: "left" }), AlignLeft, "Align Left", () => editor.chain().focus().setTextAlign("left").run())}
        {iconBtn(editor.isActive({ textAlign: "center" }), AlignCenter, "Align Center", () => editor.chain().focus().setTextAlign("center").run())}
        {iconBtn(editor.isActive({ textAlign: "right" }), AlignRight, "Align Right", () => editor.chain().focus().setTextAlign("right").run())}
        <span className="w-px h-4 bg-slate-700 mx-1" />
        {iconBtn(editor.isActive("link"), LinkIcon, "Link", addLink)}
        {iconBtn(false, ImageIcon, "Image", addImage)}
        <span className="w-px h-4 bg-slate-700 mx-1" />
        {iconBtn(!editor.can().undo(), Undo, "Undo", () => editor.chain().focus().undo().run())}
        {iconBtn(!editor.can().redo(), Redo, "Redo", () => editor.chain().focus().redo().run())}
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

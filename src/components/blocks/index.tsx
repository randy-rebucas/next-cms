/**
 * components/blocks/index.tsx
 *
 * BlockRenderer — maps a Block[] to the appropriate component.
 * Also re-exports parseBlocks / stringifyBlocks for convenience.
 */
import type { Block } from "@/models/content";
export { parseBlocks, stringifyBlocks } from "@/models/content";

import Heading from "./Heading";
import Paragraph from "./Paragraph";
import BlockImage from "./Image";
import Quote from "./Quote";
import Code from "./Code";
import List from "./List";
import Divider from "./Divider";
import Html from "./Html";
import Button from "./Button";
import Video from "./Video";
import Table from "./Table";
import Callout from "./Callout";
import Accordion from "./Accordion";
import Gallery from "./Gallery";
import Embed from "./Embed";
import Spacer from "./Spacer";
import Columns from "./Columns";

interface Props {
  blocks: Block[];
  className?: string;
}

export default function BlockRenderer({ blocks, className }: Props) {
  if (!blocks.length) return null;

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return <Heading key={i} block={block} />;
          case "paragraph":
            return <Paragraph key={i} block={block} />;
          case "image":
            return <BlockImage key={i} block={block} />;
          case "quote":
            return <Quote key={i} block={block} />;
          case "code":
            return <Code key={i} block={block} />;
          case "list":
            return <List key={i} block={block} />;
          case "divider":
            return <Divider key={i} />;
          case "html":
            return <Html key={i} block={block} />;
          case "button":
            return <Button key={i} block={block} />;
          case "video":
            return <Video key={i} block={block} />;
          case "table":
            return <Table key={i} block={block} />;
          case "callout":
            return <Callout key={i} block={block} />;
          case "accordion":
            return <Accordion key={i} block={block} />;
          case "gallery":
            return <Gallery key={i} block={block} />;
          case "embed":
            return <Embed key={i} block={block} />;
          case "spacer":
            return <Spacer key={i} block={block} />;
          case "columns":
            return <Columns key={i} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

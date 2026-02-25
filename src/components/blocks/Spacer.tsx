import type { SpacerBlock } from "@/models/content";

const HEIGHTS: Record<string, string> = {
  sm: "h-4",
  md: "h-8",
  lg: "h-16",
  xl: "h-24",
};

export default function Spacer({ block }: { block: SpacerBlock }) {
  return <div className={HEIGHTS[block.size ?? "md"]} aria-hidden="true" />;
}

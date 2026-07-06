import type { AccentColor } from "@/types";

/**
 * 暖色点缀板。使用 @theme 中定义的色 token。
 * 类名字符串必须是字面量，Tailwind JIT 才能扫描到。
 */
export const ACCENT: Record<
  AccentColor,
  {
    chip: string;
    text: string;
    dot: string;
    border: string;
    solid: string;
    soft: string;
  }
> = {
  rose: {
    chip: "bg-rose/25 text-rose-deep",
    text: "text-rose-deep",
    dot: "bg-rose",
    border: "border-rose/50",
    solid: "bg-rose text-white",
    soft: "bg-rose/15",
  },
  pink: {
    chip: "bg-pink/25 text-pink-deep",
    text: "text-pink-deep",
    dot: "bg-pink",
    border: "border-pink/50",
    solid: "bg-pink text-white",
    soft: "bg-pink/15",
  },
  amber: {
    chip: "bg-amber/35 text-amber-deep",
    text: "text-amber-deep",
    dot: "bg-amber",
    border: "border-amber/60",
    solid: "bg-amber text-amber-deep",
    soft: "bg-amber/20",
  },
  orange: {
    chip: "bg-orange/25 text-orange-deep",
    text: "text-orange-deep",
    dot: "bg-orange",
    border: "border-orange/50",
    solid: "bg-orange text-white",
    soft: "bg-orange/15",
  },
  leaf: {
    chip: "bg-leaf/25 text-leaf-deep",
    text: "text-leaf-deep",
    dot: "bg-leaf",
    border: "border-leaf/50",
    solid: "bg-leaf text-white",
    soft: "bg-leaf/15",
  },
  tan: {
    chip: "bg-tan/30 text-tan-deep",
    text: "text-tan-deep",
    dot: "bg-tan",
    border: "border-tan/50",
    solid: "bg-tan text-tan-deep",
    soft: "bg-tan/20",
  },
};

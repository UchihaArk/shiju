"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/theme/GlassCard";
import { ACCENT } from "@/lib/colors";
import { cn } from "@/lib/cn";
import type { Member } from "@/types";

export function SeatCard({
  member,
  onPick,
}: {
  member: Member;
  onPick: (m: Member) => void;
}) {
  const accent = ACCENT[member.color];
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -3 }}
      onClick={() => onPick(member)}
      className="w-full focus:outline-none"
    >
      <GlassCard className="flex w-full flex-col items-center gap-2 px-4 py-5">
        <div
          className={cn(
            "grid h-16 w-16 place-items-center rounded-2xl text-3xl shadow-inner",
            accent.soft,
          )}
        >
          <span>{member.emoji}</span>
        </div>
        <div className="text-center leading-tight">
          <p className={cn("text-sm font-semibold", accent.text)}>
            {member.role}
          </p>
          <p className="text-xs text-rose-deep/55">{member.shortName}</p>
        </div>
      </GlassCard>
    </motion.button>
  );
}

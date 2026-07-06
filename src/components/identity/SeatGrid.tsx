"use client";

import { SeatCard } from "./SeatCard";
import type { Member } from "@/types";

export function SeatGrid({
  members,
  onPick,
}: {
  members: Member[];
  onPick: (m: Member) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {members.map((m) => (
        <div key={m.id} className="w-[calc(50%-0.375rem)]">
          <SeatCard member={m} onPick={onPick} />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Splash } from "@/components/ui/Splash";

export default function GuardPage() {
  const router = useRouter();
  const { hydrated, member } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(member ? "/home" : "/login");
  }, [hydrated, member, router]);

  return <Splash />;
}

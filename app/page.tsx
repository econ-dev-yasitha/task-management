"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AppShell = dynamic(() => import("@/components/app-shell"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function Home() {
  return <AppShell />;
}

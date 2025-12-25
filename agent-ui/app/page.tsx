"use client";

import { AddAgentDialog } from "@/components/add-agent";
import { Lead, Muted, Small } from "@/components/ui/typography";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full flex flex-col max-w-sm gap-4 items-center">
        <div className="flex flex-col items-center">
          <Lead>Welcome to Agent UI</Lead>
          <Muted>A minimalist</Muted>
        </div>
        <Small>To get started, register an agent</Small>
        <AddAgentDialog />
      </div>
    </div>
  );
}

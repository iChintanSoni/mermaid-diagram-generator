"use client";

import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchAgents } from "@/lib/features/agents-slice";
import { AddAgentDialog } from "@/components/add-agent";

export default function NavAgents() {
  const { isMobile } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();
  const { agents, status } = useSelector((state: RootState) => state.agents);

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  return (
    <>
      <SidebarGroup key="Agents">
        <SidebarGroupLabel>Agents</SidebarGroupLabel>

        <AddAgentDialog
          trigger={
            <SidebarGroupAction title="Add Agent">
              <Plus /> <span className="sr-only">Add Agent</span>
            </SidebarGroupAction>
          }
        />

        <SidebarGroupContent>
          <SidebarMenu>
            {agents.map((agent) => (
              <SidebarMenuItem key={agent.url}>
                <SidebarMenuButton asChild>
                  <a href={`/dashboard/agent-detail?url=${encodeURIComponent(agent.url)}`}>
                    {agent.name}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {status === "loading" && agents.length === 0 && (
              <div className="px-2 py-1 text-xs text-muted-foreground">Loading...</div>
            )}
            {status === "success" && agents.length === 0 && (
              <div className="px-2 py-1 text-xs text-muted-foreground">No agents found</div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

"use client";

import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import { Folder, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchAgents, removeAgent } from "@/lib/features/agents-slice";
import { AddAgentDialog } from "@/components/add-agent";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function NavAgents() {
  const { isMobile } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();
  const { agents, status } = useSelector((state: RootState) => state.agents);

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  const handleDelete = (url: string) => {
    if (confirm("Are you sure you want to remove this agent?")) {
      dispatch(removeAgent(url));
    }
  };

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
                    <span>{agent.name}</span>
                  </a>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <Folder className="text-muted-foreground" />
                      <span>View Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Folder className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(agent.url)}>
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Agent</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

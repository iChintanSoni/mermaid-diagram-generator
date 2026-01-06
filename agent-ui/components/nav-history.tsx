"use client";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuAction } from "./ui/sidebar";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchHistory, deleteSession } from "@/lib/features/chat-slice";
import { MessageSquare, Trash2 } from "lucide-react";

export default function NavHistory() {
    const dispatch = useDispatch<AppDispatch>();
    const { history } = useSelector((state: RootState) => state.chat);

    useEffect(() => {
        dispatch(fetchHistory());
    }, [dispatch]);

    return (
        <>
            <SidebarGroup key="History">
                <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {history.map((session) => (
                            <SidebarMenuItem key={session.id}>
                                <SidebarMenuButton asChild>
                                    <a href={`/dashboard/chat?sessionId=${session.id}`}>
                                        <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <span className="truncate">{session.title}</span>
                                    </a>
                                </SidebarMenuButton>
                                <SidebarMenuAction
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm("Are you sure you want to delete this conversation?")) {
                                            dispatch(deleteSession(session.id));
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </SidebarMenuAction>
                            </SidebarMenuItem>
                        ))}
                        {history.length === 0 && (
                            <div className="px-2 py-1 text-xs text-muted-foreground">No recent chats</div>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}

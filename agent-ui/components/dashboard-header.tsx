"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteSession } from "@/lib/features/chat-slice";

export function DashboardHeader() {
    const dispatch = useDispatch<AppDispatch>();
    const { activeAgent, sessionId } = useSelector((state: RootState) => state.chat);

    return (
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-all ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        {activeAgent && (
                            <>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{activeAgent.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            {sessionId && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={() => {
                        if (confirm("Are you sure you want to delete this conversation?")) {
                            dispatch(deleteSession(sessionId));
                        }
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </header>
    );
}

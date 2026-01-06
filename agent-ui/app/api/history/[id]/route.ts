import { NextResponse } from "next/server";
import redis from "@/lib/redis";

const SESSION_PREFIX = "session:";

// Handle /api/history/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Next.js 15 requires awaiting params
        const { id } = await params;

        const data = await redis.get(`${SESSION_PREFIX}${id}`);

        if (!data) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json(JSON.parse(data));

    } catch (error) {
        console.error("Redis fetch session error:", error);
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
        }

        // 1. Remove from ZSET
        await redis.zrem("history:list", id);

        // 2. Remove session data
        await redis.del(`${SESSION_PREFIX}${id}`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Redis delete session error:", error);
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}

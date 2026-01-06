import { NextResponse } from "next/server";
import redis from "@/lib/redis";
// Removed import of ChatSession from "@/lib/db" to avoid conflict

interface ChatSession {
    id: string;
    agentUrl: string;
    agentName: string;
    title: string;
    lastModified: number;
    messages: any[];
}

const HISTORY_KEY = "history:list";
const SESSION_PREFIX = "session:";

export async function GET(request: Request) {
    try {
        // Fetch recent sessions from ZSET (sorted by score desc)
        // ZREVRANGE history:list 0 9
        const sessionIds = await redis.zrevrange(HISTORY_KEY, 0, 9);

        if (sessionIds.length === 0) {
            return NextResponse.json([]);
        }

        const pipeline = redis.pipeline();
        sessionIds.forEach(id => {
            pipeline.get(`${SESSION_PREFIX}${id}`);
        });

        const results = await pipeline.exec();
        const sessions: ChatSession[] = [];

        results?.forEach(([err, result]) => {
            if (!err && result && typeof result === "string") {
                try {
                    sessions.push(JSON.parse(result));
                } catch (e) {
                    console.error("Failed to parse session", e);
                }
            }
        });

        return NextResponse.json(sessions);

    } catch (error) {
        console.error("Redis fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session: ChatSession = await request.json();

        if (!session.id) {
            return NextResponse.json({ error: "Invalid session" }, { status: 400 });
        }

        // 1. Save Session Data as JSON
        await redis.set(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session));

        // 2. Add to History ZSET with timestamp score
        await redis.zadd(HISTORY_KEY, session.lastModified, session.id);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Redis save error:", error);
        return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
    }
}

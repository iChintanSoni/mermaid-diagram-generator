"use server";
import redis from "@/lib/redis";

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

export async function getHistory(): Promise<ChatSession[]> {
  const sessionIds = await redis.zrevrange(HISTORY_KEY, 0, 9);

  if (sessionIds.length === 0) return [];

  const pipeline = redis.pipeline();
  sessionIds.forEach((id) => pipeline.get(`${SESSION_PREFIX}${id}`));

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

  return sessions;
}

export async function getSession(id: string): Promise<ChatSession | null> {
  const data = await redis.get(`${SESSION_PREFIX}${id}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as ChatSession;
  } catch (e) {
    console.error("Failed to parse session", e);
    return null;
  }
}

export async function saveSession(session: ChatSession): Promise<void> {
  if (!session?.id) throw new Error("Invalid session");
  await redis.set(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session));
  await redis.zadd(HISTORY_KEY, session.lastModified, session.id);
}

export async function deleteSession(id: string): Promise<void> {
  if (!id) throw new Error("Invalid session id");
  await redis.zrem(HISTORY_KEY, id);
  await redis.del(`${SESSION_PREFIX}${id}`);
}

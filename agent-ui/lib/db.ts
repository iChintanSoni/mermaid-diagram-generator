
import { AgentCard } from "@a2a-js/sdk";

const DB_NAME = "agent-ui-db";
const STORE_NAME = "agents";
const HISTORY_STORE_NAME = "chat_history";
const DB_VERSION = 2; // Bumped to 2

export interface ChatSession {
    id: string;
    agentUrl: string;
    agentName: string;
    title: string;
    lastModified: number;
    messages: any[]; // Storing raw message objects including events
}

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", event);
            reject("Database error");
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "url" });
            }
            if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
                const historyStore = db.createObjectStore(HISTORY_STORE_NAME, { keyPath: "id" });
                historyStore.createIndex("lastModified", "lastModified", { unique: false });
            }
        };
    });
};

export const saveAgent = async (agent: AgentCard): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(agent);

        request.onerror = () => reject("Failed to save agent");
        request.onsuccess = () => resolve();
    });
};

export const getAgents = async (): Promise<AgentCard[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject("Failed to retrieve agents");
        request.onsuccess = () => resolve(request.result);
    });
};

export const saveSession = async (session: ChatSession): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([HISTORY_STORE_NAME], "readwrite");
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        const request = store.put(session);

        request.onerror = () => reject("Failed to save session");
        request.onsuccess = () => resolve();
    });
};

export const getSession = async (id: string): Promise<ChatSession> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([HISTORY_STORE_NAME], "readonly");
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        const request = store.get(id);

        request.onerror = () => reject("Failed to get session");
        request.onsuccess = () => resolve(request.result);
    });
};

export const getRecentSessions = async (limit: number = 10): Promise<ChatSession[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([HISTORY_STORE_NAME], "readonly");
        const store = transaction.objectStore(HISTORY_STORE_NAME);
        const index = store.index("lastModified");
        // Open cursor in descending order (prev)
        const request = index.openCursor(null, "prev");

        const results: ChatSession[] = [];

        request.onerror = () => reject("Failed to get recent sessions");
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor && results.length < limit) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                resolve(results);
            }
        };
    });
};

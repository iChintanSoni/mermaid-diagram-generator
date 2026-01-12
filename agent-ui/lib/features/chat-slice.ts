import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AgentCard,
  MessageSendParams,
  Message,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
} from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";
import { ChatSession } from "@/lib/db";
import {
  getHistory,
  getSession as getSessionAction,
  deleteSession as deleteSessionAction,
  saveSession as saveSessionAction,
} from "@/app/actions/history";
import { RootState } from "@/lib/store";

// Define union type for events we want to store
export type StreamEvent =
  | Message
  | TaskStatusUpdateEvent
  | TaskArtifactUpdateEvent;

// Define message type
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  events: StreamEvent[]; // Store raw events for rendering timeline
}

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  activeAgentUrl: string | null;
  activeAgent: AgentCard | null;
  error: string | null;
  history: ChatSession[];
}

const initialState: ChatState = {
  sessionId: null,
  messages: [],
  isStreaming: false,
  activeAgentUrl: null,
  activeAgent: null,
  error: null,
  history: [],
};

// Async Thunks - Now using API Routes
export const fetchHistory = createAsyncThunk("chat/fetchHistory", async () => {
  return await getHistory();
});

export const loadSession = createAsyncThunk(
  "chat/loadSession",
  async (sessionId: string, { dispatch }) => {
    const session = await getSessionAction(sessionId);
    if (!session) throw new Error("Session not found");
    return session as ChatSession;
  }
);

export const deleteSession = createAsyncThunk(
  "chat/deleteSession",
  async (sessionId: string, { dispatch }) => {
    await deleteSessionAction(sessionId);
    return sessionId;
  }
);

// Async Thunk for sending message with streaming
export const sendMessageStream = createAsyncThunk<
  void,
  { text: string; agentUrl: string },
  { rejectValue: string; state: RootState }
>(
  "chat/sendMessageStream",
  async ({ text, agentUrl }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState().chat;
      let currentSessionId = state.sessionId;

      // If no session, create one
      if (!currentSessionId) {
        currentSessionId = crypto.randomUUID();
        dispatch(setSessionId(currentSessionId));
      }

      // 1. Add User Message
      const userMsgId = crypto.randomUUID();
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: text,
        events: [],
      };
      dispatch(addMessage(userMsg));

      // 2. Add Assistant Placeholder (empty initially)
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        events: [],
      };
      dispatch(addMessage(assistantMsg));

      dispatch(setStreaming(true));

      // 3. Initialize SDK Client
      const factory = new ClientFactory();
      const client = await factory.createFromUrl(agentUrl);

      // 4. Stream Response
      const params: MessageSendParams = {
        message: {
          kind: "message",
          role: "user",
          messageId: userMsgId,
          contextId: currentSessionId, // Pass session ID as contextId for parsing
          parts: [
            {
              kind: "text",
              text: text,
            },
          ],
        },
      };

      let fullContent = "";

      for await (const chunk of client.sendMessageStream(params)) {
        // Cast to any to access discrimination property safely if Typescript complains about union
        const event = chunk as any;
        console.log("Received chunk:", event);

        // store every event
        dispatch(
          addEventToMessage({
            messageId: assistantMsgId,
            event: chunk as StreamEvent,
          })
        );

        if (event.kind === "message") {
          // It's a Message
          const messageInChunk = event as Message;
          if (messageInChunk.parts) {
            for (const part of messageInChunk.parts) {
              if (part.kind === "text" && part.text) {
                console.log("Updating text:", part.text);
                fullContent += part.text;
              }
            }
            dispatch(
              updateMessageContent({ id: assistantMsgId, content: fullContent })
            );
          }
        }
      }

      // Save Session to DB (via API)
      const updatedState = getState().chat;
      const messagesToSave = updatedState.messages;
      const title = messagesToSave[0]?.content.slice(0, 50) || "New Chat";

      const sessionToSave: ChatSession = {
        id: currentSessionId,
        agentUrl: agentUrl,
        agentName: updatedState.activeAgent?.name || "Unknown Agent",
        title: title,
        lastModified: Date.now(),
        messages: messagesToSave,
      };

      await saveSessionAction(sessionToSave as ChatSession);

      dispatch(fetchHistory()); // Update sidebar
    } catch (error) {
      console.error("Streaming error:", error);
      return rejectWithValue("Failed to send message: " + String(error));
    } finally {
      dispatch(setStreaming(false));
    }
  }
);

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveAgent: (
      state,
      action: PayloadAction<{ url: string; agent: AgentCard | null }>
    ) => {
      state.activeAgentUrl = action.payload.url;
      state.activeAgent = action.payload.agent;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessageContent: (
      state,
      action: PayloadAction<{ id: string; content: string }>
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.id);
      if (msg) {
        msg.content = action.payload.content;
      }
    },
    addEventToMessage: (
      state,
      action: PayloadAction<{ messageId: string; event: StreamEvent }>
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        msg.events.push(action.payload.event);
      }
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    resetChat: (state) => {
      state.messages = [];
      state.error = null;
      state.sessionId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessageStream.rejected, (state, action) => {
      state.error = action.payload as string;
      state.isStreaming = false;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.history = action.payload;
    });
    builder.addCase(loadSession.fulfilled, (state, action) => {
      state.sessionId = action.payload.id;
      state.messages = action.payload.messages;
      state.activeAgentUrl = action.payload.agentUrl;
    });
    builder.addCase(deleteSession.fulfilled, (state, action) => {
      state.history = state.history.filter((h) => h.id !== action.payload);
      if (state.sessionId === action.payload) {
        state.sessionId = null;
        state.messages = [];
        state.activeAgentUrl = null;
        state.activeAgent = null;
      }
    });
  },
});

export const {
  setActiveAgent,
  setSessionId,
  addMessage,
  updateMessageContent,
  addEventToMessage,
  setStreaming,
  resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;

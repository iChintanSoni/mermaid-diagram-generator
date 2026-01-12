import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAgentCard } from "@/lib/agent-client";
import { saveAgent, getAgents, deleteAgent } from "@/lib/db";
import { AgentCard } from "@a2a-js/sdk";

type Status = "idle" | "loading" | "success" | "failure";

type AgentsState = {
  status: Status; // For list loading
  registrationStatus: Status; // For adding new agent
  error: string | null;
  registrationError: string | null;
  agents: AgentCard[];
  url: string; // Form input
};

const initialState: AgentsState = {
  status: "idle",
  registrationStatus: "idle",
  error: null,
  registrationError: null,
  agents: [],
  url: "",
};

export const fetchAgents = createAsyncThunk<AgentCard[]>(
  "agents/fetchAll",
  async () => {
    return await getAgents();
  }
);

export const registerAgent = createAsyncThunk<
  AgentCard,
  string,
  { rejectValue: string }
>("agents/register", async (url, { rejectWithValue }) => {
  try {
    const agentCard = await fetchAgentCard(url);
    if (!agentCard) {
      return rejectWithValue("Could not fetch a valid Agent Card from this URL.");
    }
    await saveAgent(agentCard);
    return agentCard;
  } catch (error) {
    return rejectWithValue("An error occurred while registering the agent.");
    return rejectWithValue("An error occurred while registering the agent.");
  }
});

export const removeAgent = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("agents/remove", async (url, { rejectWithValue }) => {
  try {
    await deleteAgent(url);
    return url;
  } catch (error) {
    return rejectWithValue("Failed to delete agent");
  }
});

export const agentsSlice = createSlice({
  name: "agents",
  initialState: initialState,
  reducers: {
    setUrl: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
      if (state.registrationError) state.registrationError = null;
    },
    resetRegistrationState: (state) => {
      state.registrationStatus = "idle";
      state.registrationError = null;
      state.url = "";
    }
  },
  extraReducers: (builder) => {
    // Register Agent
    builder
      .addCase(registerAgent.pending, (state) => {
        state.registrationStatus = "loading";
        state.registrationError = null;
      })
      .addCase(registerAgent.fulfilled, (state, action) => {
        state.registrationStatus = "success";
        // Check if agent already exists to avoid duplicates in list (IndexedDB overwrites by key, so safe)
        const exists = state.agents.find(a => a.url === action.payload.url);
        if (!exists) {
          state.agents.push(action.payload);
        } else {
          // Update existing
          state.agents = state.agents.map(a => a.url === action.payload.url ? action.payload : a);
        }
      })
      .addCase(registerAgent.rejected, (state, action) => {
        state.registrationStatus = "failure";
        state.registrationError = action.payload as string;
      })
      .addCase(removeAgent.fulfilled, (state, action) => {
        state.agents = state.agents.filter(a => a.url !== action.payload);
      });

    // Fetch Agents
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = "success";
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state) => {
        state.status = "failure";
        state.error = "Failed to load agents";
      });
  },
});

export const { setUrl, resetRegistrationState } = agentsSlice.actions;
export default agentsSlice.reducer;

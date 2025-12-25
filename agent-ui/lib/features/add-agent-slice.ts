import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { get, Status } from "../api";

type AddAgentState = {
  verifyAgentState: {
    status: Status;
    success: string;
    failure: string;
  };
  url: string;
  urlError: string;
};

const initialState: AddAgentState = {
  verifyAgentState: {
    status: "idle",
    success: "",
    failure: "",
  },
  url: "",
  urlError: "",
};

// const verifyAgent = createAsyncThunk<unknown, { url: string }>(
//   "add-agent/verify",
//   async ({ url }) => {
//     const url = await get<object>(url + "/.well-known/agent.json");
//   }
// );

export const addAgentSlice = createSlice({
  name: "addAgent",
  initialState: initialState,
  reducers: {
    setUrl: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
    },
  },
});

export default addAgentSlice.reducer;

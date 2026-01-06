import { configureStore } from "@reduxjs/toolkit";
import agentsReducer from "@/lib/features/agents-slice";
import chatReducer from "@/lib/features/chat-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      agents: agentsReducer,
      chat: chatReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

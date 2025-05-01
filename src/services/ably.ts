import * as Ably from "ably";

export const ably = new Ably.Realtime({
  key: import.meta.env.VITE_ABLY_API_KEY,
});

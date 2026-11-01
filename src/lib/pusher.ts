import PusherServer from "pusher";
import PusherClient from "pusher-js";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!appId || !key || !secret || !cluster) {
  console.warn(
    "[lib/pusher] Pusher environment variables are not fully set. Realtime features will be disabled.",
  );
}

export const pusherServer =
  appId && key && secret && cluster
    ? new PusherServer({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      })
    : null;

export const pusherClient =
  typeof window !== "undefined" && key && cluster
    ? new PusherClient(key, {
        cluster,
      })
    : null;


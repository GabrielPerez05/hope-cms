import { useEffect } from "react";
import { updateLastSeen } from "../lib/admin-api";

const HEARTBEAT_INTERVAL_MS = 60_000;

export function useHeartbeat() {
  useEffect(() => {
    updateLastSeen();
    const interval = setInterval(updateLastSeen, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
}

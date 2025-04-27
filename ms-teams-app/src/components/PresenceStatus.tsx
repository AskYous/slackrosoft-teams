import { useCallback, useEffect, useRef, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { safeStringContent } from "../utils/renderUtils";

// Interface that matches the Microsoft Graph Presence type structure
interface PresenceInfo {
  id?: string;
  availability?: string | null;
  activity?: string | null;
  statusMessage?: unknown; // Using unknown to handle any format
}

const PresenceStatus = () => {
  const [presence, setPresence] = useState<PresenceInfo | null>(null);
  const { getGraphClient, isLoading, error } = useGraph();
  const intervalRef = useRef<number | null>(null);

  const fetchPresence = useCallback(async () => {
    try {
      const graphClient = await getGraphClient();
      const presenceInfo = await graphClient.getUserPresence();
      setPresence(presenceInfo as PresenceInfo);
    } catch (err) {
      console.error("Error fetching presence:", err);
    }
  }, [getGraphClient]);

  useEffect(() => {
    // Initial fetch
    fetchPresence();

    // Refresh presence every 30 seconds
    intervalRef.current = window.setInterval(fetchPresence, 30000);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchPresence]);

  const getStatusColor = (availability?: string | null) => {
    switch (availability?.toLowerCase()) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
      case 'donotdisturb':
        return 'bg-red-500';
      case 'away':
      case 'bemrightback':
        return 'bg-yellow-500';
      case 'offline':
      case 'presenceunknown':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (isLoading && !presence) {
    return <div className="text-gray-500 text-sm">Loading status...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">Error: {error}</div>;
  }

  if (!presence) {
    return <div className="text-gray-500 text-sm">No presence information</div>;
  }

  const statusMessageText = safeStringContent(presence.statusMessage);

  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${getStatusColor(presence.availability)} mr-2`}></div>
      <div className="text-sm">
        <span className="font-medium">{presence.activity || presence.availability || 'Unknown'}</span>
        {statusMessageText && (
          <span className="ml-1 text-gray-500">- {statusMessageText}</span>
        )}
      </div>
    </div>
  );
};

export default PresenceStatus; 
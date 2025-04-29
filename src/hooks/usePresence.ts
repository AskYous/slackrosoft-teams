import { Presence } from '@microsoft/microsoft-graph-types';
import { useEffect, useState } from 'react';
import { useApiClient } from './useApiClient'; // Ensure this path is correct

interface PresenceResult {
  presence: Presence | null;
  loading: boolean;
  error: Error | null;
}

// Simple cache to avoid refetching rapidly for the same user
const presenceCache = new Map<string, { data: Presence | null, timestamp: number }>();
const CACHE_DURATION_MS = 60 * 1000; // Cache for 1 minute

export const usePresence = (userId: string | undefined): PresenceResult => {
  const [presence, setPresence] = useState<Presence | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    if (!userId || !apiClient) {
      setPresence(null);
      setLoading(false);
      setError(null);
      return;
    }

    const cachedEntry = presenceCache.get(userId);
    const now = Date.now();

    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION_MS)) {
      setPresence(cachedEntry.data);
      setLoading(false);
      setError(null);
      return; // Use cached data
    }

    let isMounted = true;
    const fetchPresence = async () => {
      setLoading(true);
      setError(null);
      try {
        // Note: Fetching presence requires Presence.Read.All permission
        const result = await apiClient.api(`/users/${userId}/presence`).get();
        if (isMounted) {
          setPresence(result as Presence);
          presenceCache.set(userId, { data: result as Presence, timestamp: Date.now() });
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error(`Error fetching presence for user ${userId}:`, err);
          setError(err instanceof Error ? err : new Error('Unknown error fetching presence'));
          setPresence(null);
          // Cache the error/null state briefly to avoid hammering the API on errors
          presenceCache.set(userId, { data: null, timestamp: Date.now() });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPresence();

    return () => {
      isMounted = false;
    };
    // Rerun if userId or apiClient instance changes
  }, [userId, apiClient]);

  return { presence, loading, error };
};

// Optional: Hook to fetch presence for multiple users (more efficient)
// interface MultiPresenceResult {
//   presences: Presence[];
//   loading: boolean;
//   error: Error | null;
// }

// export const useMultiplePresences = (userIds: string[]): MultiPresenceResult => {
//   // Similar logic but uses the batch endpoint or /communications/presences?$filter=...
//   // Implementation omitted for brevity, but would involve checking cache for each ID,
//   // batching requests for non-cached IDs.
//   const [presences, setPresences] = useState<Presence[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<Error | null>(null);
//   const apiClient = useApiClient();

//   useEffect(() => {
//     if (!userIds || userIds.length === 0 || !apiClient) {
//       setPresences([]);
//       setLoading(false);
//       setError(null);
//       return;
//     }

//     // Simplified fetch logic (no caching for brevity)
//     let isMounted = true;
//     const fetchPresences = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const filter = userIds.map(id => `id eq '${id}'`).join(' or ');
//         // Requires Presence.Read.All
//         const result = await apiClient.api(`/communications/presences?$filter=${filter}`).get();
//         if (isMounted && result && result.value) {
//           setPresences(result.value as Presence[]);
//         }
//       } catch (err: any) {
//         if (isMounted) {
//           console.error(`Error fetching multiple presences:`, err);
//           setError(err);
//           setPresences([]);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchPresences();

//     return () => {
//       isMounted = false;
//     };
//   }, [JSON.stringify(userIds), apiClient]); // Stringify to compare array content

//   return { presences, loading, error };
// }; 
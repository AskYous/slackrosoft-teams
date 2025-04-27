import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { safeStringContent } from "../utils/renderUtils";
// Import only necessary Shadcn components
import { Avatar, AvatarFallback } from "./ui/avatar";
// Removed Card imports
// import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface Person {
  id?: string;
  displayName?: string | unknown;
  scoredEmailAddresses?: {
    address?: string | unknown;
    relevanceScore?: number;
  }[];
  personType?: {
    class?: string | unknown;
    subclass?: string | unknown;
  };
}

// Helper function to get initials from display name
const getInitials = (name: string): string => {
  if (!name) return "?";
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const PeopleList = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const { getGraphClient, isLoading, error } = useGraph();

  const fetchPeople = useCallback(async () => {
    try {
      const graphClient = await getGraphClient();
      const peopleList = await graphClient.getPeople();
      setPeople(peopleList);
    } catch (err) {
      console.error("Error fetching people:", err);
    }
  }, [getGraphClient]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  if (isLoading) {
    // Match sidebar text color
    return <div className="p-4 text-gray-400">Loading people...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    // Remove outer div, padding handled in Home.tsx TabContent
    // Use space-y-1 on parent in Home.tsx if needed
    <>
      {people.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-400">No people found</p>
      ) : (
        // Removed wrapper div, map directly
        people.map((person) => {
          const displayName = safeStringContent(person.displayName);
          const email = person.scoredEmailAddresses?.[0]?.address
            ? safeStringContent(person.scoredEmailAddresses[0].address)
            : "No email available";
          const initials = getInitials(displayName);

          return (
            // Replace Card with styled div, add hover effect
            <div
              key={person.id}
              className="flex items-center space-x-3 px-3 py-2 rounded-md cursor-default transition-colors duration-100 ease-in-out hover:bg-gray-700 group"
              title={`${displayName}\n${email}`} // Tooltip for full info
            >
              {/* Avatar styling might need slight adjustment if needed */}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-gray-600 text-gray-200 group-hover:bg-gray-500">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Text styling for dark sidebar */}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 truncate">
                  {email}
                </p>
              </div>
            </div>
          );
        })
      )}
    </>
  );
};

export default PeopleList; 
import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { safeStringContent } from "../utils/renderUtils";
// Import Shadcn components
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

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
    return <div className="p-4">Loading people...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    // Remove border-r, handled by Tabs container
    <div className="h-full">
      {people.length === 0 ? (
        <p className="p-4 text-gray-500">No people found</p>
      ) : (
        // Add padding and spacing for cards
        <div className="p-2 space-y-2">
          {people.map((person) => {
            const displayName = safeStringContent(person.displayName);
            const email = person.scoredEmailAddresses?.[0]?.address
              ? safeStringContent(person.scoredEmailAddresses[0].address)
              : "No email available";

            return (
              <Card key={person.id} className="transition-colors">
                <CardHeader className="flex flex-row items-center space-x-3 p-3">
                  <Avatar>
                    {/* Add AvatarFallback with initials */}
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">{displayName}</CardTitle>
                    <CardDescription className="text-xs">{email}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PeopleList; 
import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import { safeStringContent } from "../utils/renderUtils";

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
    <div className="border-r border-gray-200 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold p-4 border-b">Relevant People</h2>
      <ul>
        {people.length === 0 ? (
          <li className="p-4 text-gray-500">No people found</li>
        ) : (
          people.map((person) => (
            <li key={person.id} className="border-b last:border-0">
              <div className="p-4">
                <div className="font-medium">{safeStringContent(person.displayName)}</div>
                {person.scoredEmailAddresses && person.scoredEmailAddresses.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {safeStringContent(person.scoredEmailAddresses[0].address)}
                  </div>
                )}
                {person.personType && (
                  <div className="text-xs text-gray-400 mt-1">
                    {safeStringContent(person.personType.class)}
                    {person.personType.subclass ?
                      ` (${safeStringContent(person.personType.subclass)})` : ''}
                  </div>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PeopleList; 
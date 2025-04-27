import { useCallback, useEffect, useState } from "react";
import { useGraph } from "../hooks/useGraph";
import LogoutButton from "./LogoutButton";

interface UserInfo {
  displayName?: string | null;
  mail?: string | null;
  userPrincipalName?: string | null;
  jobTitle?: string | null;
  officeLocation?: string | null;
}

const Profile = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { getGraphClient, isLoading, error } = useGraph();

  const fetchUserInfo = useCallback(async () => {
    try {
      const graphClient = await getGraphClient();
      const userProfile = await graphClient.getUserInfo();
      setUserInfo(userProfile as UserInfo);
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }, [getGraphClient]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  if (isLoading && !userInfo) {
    return <div className="flex items-center text-sm text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Error</div>;
  }

  if (!userInfo) {
    return <div className="text-sm text-gray-500">No user information</div>;
  }

  // Get the user's initials for the avatar
  const initials = userInfo.displayName
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  return (
    <div className="flex items-center">
      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 text-sm font-medium">
        {initials}
      </div>
      <div className="mr-3">
        <div className="font-medium text-sm">{userInfo.displayName}</div>
        <div className="text-xs text-gray-600">{userInfo.mail || userInfo.userPrincipalName}</div>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Profile; 
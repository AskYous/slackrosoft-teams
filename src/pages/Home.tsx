import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import PeopleList from "../components/PeopleList";
import PresenceStatus from "../components/PresenceStatus";
import Profile from "../components/Profile";
// Import Shadcn components using relative paths
import { MessageSquareText } from "lucide-react"; // Import an icon
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const Home = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  // Remove activeTab state, Tabs component handles this
  // const [activeTab, setActiveTab] = useState<'chats' | 'people'>('chats');
  const { accounts } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not logged in
    if (accounts.length === 0) {
      navigate("/login");
    }
  }, [accounts, navigate]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return (
    // Main container - Use flex row for sidebar + main content
    <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Sidebar Section - Darker background, fixed width */}
      <aside className="w-72 flex flex-col bg-gray-800 dark:bg-gray-900 text-gray-300 border-r border-gray-700 dark:border-gray-800">
        {/* Sidebar Header (Optional, can add workspace switcher later) */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-gray-700 dark:border-gray-800 shadow-sm">
          <h2 className="font-semibold text-white">Workspace</h2> {/* Placeholder */}
          {/* Add dropdown/profile icon here if needed */}
        </div>

        {/* Tabs for Chats/People */}
        <Tabs defaultValue="chats" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 rounded-none bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800 h-10 px-1 pt-1">
            {/* Updated Trigger styling */}
            <TabsTrigger
              value="chats"
              className="text-sm font-medium rounded-t-md px-3 py-1.5 data-[state=active]:bg-gray-700 dark:data-[state=active]:bg-gray-850 data-[state=active]:text-white dark:data-[state=active]:text-white text-gray-400 hover:text-gray-200 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              Chats
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="text-sm font-medium rounded-t-md px-3 py-1.5 data-[state=active]:bg-gray-700 dark:data-[state=active]:bg-gray-850 data-[state=active]:text-white dark:data-[state=active]:text-white text-gray-400 hover:text-gray-200 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              People
            </TabsTrigger>
          </TabsList>

          {/* Scrollable Content Area */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <TabsContent value="chats" className="mt-0 p-2 space-y-1">
              <ChatList onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />
            </TabsContent>
            <TabsContent value="people" className="mt-0 p-2 space-y-1">
              <PeopleList />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        {/* Sidebar Footer (Profile/Settings) */}
        <div className="p-3 border-t border-gray-700 dark:border-gray-800 bg-gray-800 dark:bg-gray-900 flex items-center space-x-3">
          <Profile /> {/* Moved Profile here */}
          <PresenceStatus /> {/* Moved Presence here */}
        </div>
      </aside>

      {/* Main Content Area - Lighter background */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Main Header (Optional - Could show channel/chat name) */}
        <header className="h-12 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 shadow-sm">
          {/* Content depends on selected chat/view */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedChatId ? 'Chat Details' : 'Select a Chat'} {/* Placeholder */}
          </h1>
        </header>

        {/* Chat Window or Placeholder */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          {selectedChatId !== null ? (
            <ChatWindow chatId={selectedChatId} />
          ) : (
            // Updated Placeholder Styling
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageSquareText className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Select a chat</h3>
              <p className="mt-1 text-sm">Get started by selecting a chat from the list.</p>
            </div>
          )}
        </div>
        {/* Footer (Optional - Could remove or integrate differently) */}
        <footer className="bg-gray-100 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-700 py-2 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>This app only uses permissions that don't require admin consent. Some features are limited.</p>
        </footer>
      </main>
    </div>
  );
};

export default Home; 
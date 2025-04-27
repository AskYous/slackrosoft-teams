import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import PeopleList from "../components/PeopleList";
import PresenceStatus from "../components/PresenceStatus";
import Profile from "../components/Profile";
// Import Shadcn components using relative paths
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
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header Section */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-full mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">MS Teams Viewer</h1>
          <div className="flex items-center space-x-4">
            <PresenceStatus />
            <Profile />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Section - Adjusted width and background */}
        <Tabs defaultValue="chats" className="w-[320px] flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-gray-200 dark:border-gray-700 h-12">
            <TabsTrigger value="chats" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-none rounded-none">Chats</TabsTrigger>
            <TabsTrigger value="people" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-none rounded-none">People</TabsTrigger>
          </TabsList>

          {/* Scrollable Content Area */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <TabsContent value="chats" className="mt-0 p-2">
              <ChatList onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />
            </TabsContent>
            <TabsContent value="people" className="mt-0 p-2">
              <PeopleList />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Main Content Area - Adjusted background */}
        <main className="flex-1 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-850">
          {selectedChatId !== null ? (
            <ChatWindow chatId={selectedChatId} />
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Select a chat</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by selecting a chat from the list.</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer Section - Adjusted background and padding */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>This app only uses permissions that don't require admin consent. Some features are limited.</p>
      </footer>
    </div>
  );
};

export default Home; 
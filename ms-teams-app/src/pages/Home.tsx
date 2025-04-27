import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import PeopleList from "../components/PeopleList";
import PresenceStatus from "../components/PresenceStatus";
import Profile from "../components/Profile";

const Home = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'people'>('chats');
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
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">MS Teams Viewer</h1>
          <div className="flex items-center space-x-4">
            <PresenceStatus />
            <Profile />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 flex flex-col border-r border-gray-200">
          <div className="bg-gray-100 border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-3 flex-1 text-center font-medium ${activeTab === 'chats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                  }`}
                onClick={() => setActiveTab('chats')}
              >
                Chats
              </button>
              <button
                className={`px-4 py-3 flex-1 text-center font-medium ${activeTab === 'people' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                  }`}
                onClick={() => setActiveTab('people')}
              >
                People
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'chats' ? (
              <ChatList onSelectChat={handleSelectChat} />
            ) : (
              <PeopleList />
            )}
          </div>
        </div>

        <div className="w-2/3 h-full overflow-hidden">
          <ChatWindow chatId={selectedChatId} />
        </div>
      </div>

      <footer className="bg-gray-50 border-t border-gray-200 py-3 text-center text-sm text-gray-500">
        <p>This app only uses permissions that don't require admin consent. Some features are limited.</p>
      </footer>
    </div>
  );
};

export default Home; 
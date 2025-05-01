import { Button } from "@/components/ui/button";
import { Message } from "ably";
import { useChannel, useConnectionStateListener } from "ably/react";
import React, { useState } from "react";

const Playground: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useConnectionStateListener("connected", () => {
    console.log("Connected to Ably!");
  });

  // Create a channel called 'get-started' and subscribe to all messages with the name 'first' using the useChannel hook
  const { channel } = useChannel("slackrosoft-teams", "first", (message) => {
    setMessages((previousMessages) => [...previousMessages, message]);
  });

  return (
    // Publish a message with the name 'first' and the contents 'Here is my first message!' when the 'Publish' button is clicked
    <div className="flex justify-center flex-col items-center">
      <Button
        onClick={() => {
          channel.publish("first", "Here is my first message!");
        }}
      >
        Publish
      </Button>
      {messages.map((message) => (
        <p key={message.id}>{message.data}</p>
      ))}
    </div>
  );
};

export default Playground;

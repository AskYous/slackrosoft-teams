import { FC, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [shouldFocus, setShouldFocus] = useState(false);

  // Use an effect to focus the input when needed or when disabled state changes to false
  useEffect(() => {
    if (shouldFocus && !disabled) {
      inputRef.current?.focus();
      setShouldFocus(false);
    }
  }, [shouldFocus, disabled]);

  // Auto-focus when component mounts
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage(""); // Clear input after sending
      setShouldFocus(true); // Request focus after sending
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div data-testid="message-input" className="mt-auto flex gap-2 border-t pt-4">
      <input
        ref={inputRef}
        type="text"
        placeholder="Type your message..."
        value={newMessage}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="flex-grow border rounded px-2 py-1"
        disabled={disabled}
        autoFocus
      />
      <Button onClick={handleSendMessage} disabled={disabled || !newMessage.trim()}>
        {disabled ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}; 
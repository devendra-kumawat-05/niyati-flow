import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-zinc-800 bg-white flex items-center gap-2"
    >
      <Input
        placeholder="Your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-white border-zinc-700 flex-1 text-black"
      />
      <Button
        type="submit"
        className="bg-[#ffb34e] hover:bg-[#ffb34e]/90 text-black hover:text-black/90"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}

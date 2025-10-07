interface ChatMessageProps {
  role: string;
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  return (
    <div
      className={`p-4 rounded-xl max-w-2xl ${
        isUser
          ? "bg-[#ffb34e] text-black ml-auto"
          : "bg-black text-white mr-auto"
      }`}
    >
      <p>{content}</p>
    </div>
  );
}

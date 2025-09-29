import { Send } from "lucide-react";

export default function Home() {
  return (
    <div className=" hidden  flex-1 md:flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to Chat
          </h3>
          <p className="text-gray-500">
            Select a user from the list to start messaging
          </p>
        </div>
      </div>
    </div>
  );
}

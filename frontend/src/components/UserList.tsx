import { useGetUsers } from "@/api/user/userApi";
import useUserState from "@/state/useUserState";
import Link from "next/link";
import React from "react";
const getUserAvatar = (username: string) => {
  return username.slice(0, 2).toUpperCase();
};

// Helper function to format timestamp
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const UserList = () => {
    const userId = useUserState(state => state?.userId)
  const { data, isLoading } = useGetUsers();
  const selectedUser = 1;

  const filterUsers = data?.filter(user => user?.username !== userId)
  return (
       <>
       <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Messages</h1>

          {/* Search */}
        </div>
    <div className="flex-1 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">Loading users...</div>
      ) : filterUsers?.length === 0 ? (
        <div className="p-4 text-center text-gray-500">{"No users found"}</div>
      ) : (
        filterUsers?.map((user, index) => (
          <Link
          href={`/user/${user?.username}`}
            key={user.uuid}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors block ${
              selectedUser === index
                ? "bg-blue-50 border-r-2 border-r-blue-500"
                : ""
            }`}
            onClick={() => {}}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  {getUserAvatar(user.username)}
                </div>
                {user.activated && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {user.username}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatTime(user.modified)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate">
                    {user.activated ? "Active user" : "Inactive user"}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.activated
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.activated ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
       </>
  );
};

export default UserList;

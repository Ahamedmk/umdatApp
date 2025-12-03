import React from "react";

export function NarratorAvatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
      {initials}
    </div>
  );
}

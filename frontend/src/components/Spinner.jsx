import React from "react";

export default function Spinner({ size = 24 }) {
  return (
    <div className="flex justify-center items-center">
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

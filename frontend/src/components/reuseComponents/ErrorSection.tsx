import React from "react";

interface propTypes {
  error: string | null;
}

function ErrorSection({ error }: propTypes) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-600">{error}</p>
    </div>
  );
}

export default ErrorSection;

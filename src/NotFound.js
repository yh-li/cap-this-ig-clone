import React from "react";
import Header from "./Header";
function NotFound() {
  return (
    <div>
      <Header setHomeUser={() => null} />
      404
    </div>
  );
}

export default NotFound;

import React from "react";
import R3FDemo from "../components/R3FDemo";

const ReactThreeFiberGame = () => {
  return (
    <div className="flex h-full w-full justify-center bg-gray-700">
      <div className="container flex min-h-screen flex-col items-center justify-center">
        <div className="h-[1024px] w-[1024px] border">
          <R3FDemo></R3FDemo>
        </div>
      </div>
    </div>
  );
};

export default ReactThreeFiberGame;

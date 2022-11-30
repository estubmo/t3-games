import React from "react";
import Canvas from "../components/Canvas";

const CanvasShooter = () => {
  return (
    <div className="flex h-full w-full justify-center bg-gray-700">
      <div className="container flex min-h-screen flex-col items-center justify-center">
        <div className="border bg-black">
          <Canvas width={1024} height={1024} />
        </div>
      </div>
    </div>
  );
};

export default CanvasShooter;

import TINSGame from "@games/TINSGame";
import React, { useEffect, useRef, useState } from "react";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

const TINS = () => {
  const divRef = useRef<HTMLDivElement>(null);

  type WindowDimensions = {
    width: number;
    height: number;
  };
  const [dimension, setDimensions] = useState<WindowDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof divRef.current !== undefined && divRef.current) {
      setDimensions({
        width:
          divRef.current.clientWidth > MAX_WIDTH
            ? MAX_WIDTH
            : divRef.current.clientWidth,
        height:
          divRef.current.clientHeight > MAX_HEIGHT
            ? MAX_HEIGHT
            : divRef.current.clientHeight,
      });
    }
  }, []);

  return (
    <div
      className="fixed flex min-h-screen w-full items-center justify-center bg-gradient-to-tr from-gray-800 to-gray-900"
      ref={divRef}
    >
      <TINSGame width={dimension.width} height={dimension.height} />
    </div>
  );
};

export default TINS;

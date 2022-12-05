import { useState, useEffect } from "react";

function useHover(ref: React.RefObject<HTMLElement>, timeout = 0) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!ref || !ref.current) return;

    let timeoutId: NodeJS.Timeout;
    const handleMouseEnter = () => {
      if (timeout) clearTimeout(timeoutId);
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      if (timeout) {
        timeoutId = setTimeout(() => setIsHovered(false), timeout);
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [ref, timeout]);

  return isHovered;
}

export default useHover;

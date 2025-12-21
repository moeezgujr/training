import { useState, useEffect } from "react";

/**
 * Hook to determine if the current viewport is mobile-sized.
 * 
 * @param breakpoint The max-width in pixels that's considered mobile. Defaults to 768px.
 * @returns boolean indicating if the viewport is considered mobile
 */
export function useIsMobile(breakpoint: number = 768) {
  // Start with a reasonable default
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Function to update the state based on window width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add event listener
    window.addEventListener("resize", checkMobile);
    
    // Call once on mount to set the initial state
    checkMobile();

    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
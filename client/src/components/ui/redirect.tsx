import { useEffect } from "react";
import { useLocation } from "wouter";

export function Redirect({ to }: { to: string }) {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return null;
}
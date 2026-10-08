import { useEffect, useState } from "react";
import type { PlanLength } from "./bible";

const KEY = "mamutes-plan";
const EVT = "mamutes-plan-change";

export function usePlanLength(): [PlanLength, (v: PlanLength) => void] {
  const [len, setLen] = useState<PlanLength>(180);
  useEffect(() => {
    const read = () => {
      const v = Number(localStorage.getItem(KEY));
      if (v === 90 || v === 180 || v === 365) setLen(v);
    };
    read();
    window.addEventListener(EVT, read);
    return () => window.removeEventListener(EVT, read);
  }, []);
  const set = (v: PlanLength) => {
    localStorage.setItem(KEY, String(v));
    setLen(v);
    window.dispatchEvent(new Event(EVT));
  };
  return [len, set];
}

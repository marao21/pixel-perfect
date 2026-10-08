import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "claro" | "escuro" | "sepia" | "azul";
const KEY = "mamutes-theme";

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "escuro",
  setTheme: () => {},
});

function apply(t: Theme) {
  const el = document.documentElement;
  el.classList.toggle("dark", t === "escuro");
  el.classList.toggle("sepia", t === "sepia");
  el.classList.toggle("azul", t === "azul");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "escuro";
    const saved = window.localStorage.getItem(KEY);
    return saved === "claro" || saved === "sepia" || saved === "azul" ? saved : "escuro";
  });

  useEffect(() => apply(theme), [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(KEY, t);
  };

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

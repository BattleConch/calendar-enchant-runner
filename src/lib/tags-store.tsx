import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { NO_TAG_STYLE, type TagStyle } from "./events-store";

export type PaletteKey = "blue" | "red" | "green" | "yellow" | "orange" | "teal" | "purple" | "pink";

export const PALETTE: PaletteKey[] = ["blue", "green", "orange", "yellow", "teal", "pink", "purple", "red"];

export type TagDef = { id: string; label: string; color: PaletteKey };

export const DEFAULT_TAGS: TagDef[] = [
  { id: "blue", label: "Focus", color: "blue" },
  { id: "green", label: "Health", color: "green" },
  { id: "orange", label: "Social", color: "orange" },
  { id: "yellow", label: "Ideas", color: "yellow" },
  { id: "teal", label: "Plan", color: "teal" },
  { id: "pink", label: "Joy", color: "pink" },
  { id: "purple", label: "Study", color: "purple" },
  { id: "red", label: "Urgent", color: "red" },
];

const KEY = "calendry.tags.v1";

export const styleForColor = (color: PaletteKey, label: string): TagStyle => ({
  bg: `var(--tag-${color}-bg)`,
  text: `var(--tag-${color})`,
  dot: `var(--tag-${color})`,
  ring: `color-mix(in srgb, var(--tag-${color}) 38%, transparent)`,
  label,
});

type Ctx = {
  tags: TagDef[];
  add: (label: string, color: PaletteKey) => TagDef;
  update: (id: string, patch: Partial<Omit<TagDef, "id">>) => void;
  remove: (id: string) => void;
  styleOf: (id?: string) => TagStyle;
};

const TagsContext = createContext<Ctx | null>(null);

export function TagsProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<TagDef[]>(DEFAULT_TAGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TagDef[];
        if (Array.isArray(parsed)) setTags(parsed);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(tags)); } catch { /* ignore */ }
  }, [tags, hydrated]);

  const styleOf = useCallback(
    (id?: string): TagStyle => {
      if (!id) return NO_TAG_STYLE;
      const t = tags.find((x) => x.id === id);
      return t ? styleForColor(t.color, t.label) : NO_TAG_STYLE;
    },
    [tags],
  );

  const value = useMemo<Ctx>(() => ({
    tags,
    styleOf,
    add: (label, color) => {
      const tag: TagDef = { id: crypto.randomUUID(), label: label.trim() || "Tag", color };
      setTags((prev) => [...prev, tag]);
      return tag;
    },
    update: (id, patch) => setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    remove: (id) => setTags((prev) => prev.filter((t) => t.id !== id)),
  }), [tags, styleOf]);

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>;
}

export function useTags() {
  const ctx = useContext(TagsContext);
  if (!ctx) throw new Error("useTags must be inside TagsProvider");
  return ctx;
}

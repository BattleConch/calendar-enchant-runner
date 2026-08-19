import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus, Trash2, X, Tags } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { PALETTE, styleForColor, useTags, type PaletteKey } from "@/lib/tags-store";

export function MyTagsButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => { haptic(8); setOpen(true); }}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-clay-soft ${className}`}
        style={{ border: "1px solid var(--hairline)" }}
      >
        <Tags className="h-3.5 w-3.5" /> My Tags
      </button>
      <TagsManager open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function TagsManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tags, add, update, remove } = useTags();
  const [draft, setDraft] = useState("");
  const [draftColor, setDraftColor] = useState<PaletteKey>("blue");

  const create = () => {
    if (!draft.trim()) return;
    haptic(12);
    add(draft, draftColor);
    setDraft("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-clay/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-[28px] bg-surface"
            style={{ border: "1px solid var(--hairline)" }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-clay-soft">My Tags</div>
                <p className="mt-1 text-sm text-clay-soft">Rename, recolor, add or remove.</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full text-clay-soft transition-colors hover:bg-surface-hover"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-6">
              {tags.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="rounded-2xl p-3"
                  style={{ border: "1px solid var(--hairline)", background: styleForColor(t.color, t.label).bg }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `var(--tag-${t.color})` }} />
                    <input
                      value={t.label}
                      onChange={(e) => update(t.id, { label: e.target.value })}
                      aria-label="Tag name"
                      className="min-w-0 flex-1 bg-transparent text-[15px] focus:outline-none"
                      style={{ color: "var(--clay)" }}
                    />
                    <button
                      onClick={() => { haptic(14); remove(t.id); }}
                      aria-label={`Delete ${t.label}`}
                      className="grid h-8 w-8 place-items-center rounded-full text-clay-soft transition-colors hover:bg-surface"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Swatches value={t.color} onChange={(c) => { haptic(8); update(t.id, { color: c }); }} />
                </motion.div>
              ))}

              <div className="rounded-2xl p-3" style={{ border: "1px dashed var(--hairline)" }}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `var(--tag-${draftColor})` }} />
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") create(); }}
                    placeholder="New tag name"
                    className="min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-clay-muted focus:outline-none"
                    style={{ color: "var(--clay)" }}
                  />
                  <button
                    onClick={create}
                    disabled={!draft.trim()}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs disabled:opacity-40"
                    style={{ background: "var(--clay)", color: "var(--ivory)" }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
                <Swatches value={draftColor} onChange={setDraftColor} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Swatches({ value, onChange }: { value: PaletteKey; onChange: (c: PaletteKey) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {PALETTE.map((c) => (
        <motion.button
          key={c}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(c)}
          aria-label={`Color ${c}`}
          aria-pressed={value === c}
          className="h-6 w-6 rounded-full"
          style={{
            background: `var(--tag-${c})`,
            outline: value === c ? "2px solid var(--clay)" : "none",
            outlineOffset: "2px",
          }}
        />
      ))}
    </div>
  );
}

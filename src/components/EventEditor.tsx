import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useEvents, TAG_STYLES, type TagColor } from "@/lib/events-store";
import { ConfirmDelete, DetailActions, PreviewRow, TagBadge } from "./DetailChrome";


const TAGS: TagColor[] = ["blue", "green", "orange", "yellow", "teal", "pink", "purple", "red"];

export function EventEditor({
  open,
  onClose,
  editingId,
  defaultDate,
  defaultStart = "09:00",
  defaultEnd = "10:00",
}: {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  defaultDate: string;
  defaultStart?: string;
  defaultEnd?: string;
}) {
  const { events, add, update, remove } = useEvents();
  const existing = editingId ? events.find((e) => e.id === editingId) : null;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [tag, setTag] = useState<TagColor>("blue");
  const [notes, setNotes] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [mode, setMode] = useState<"preview" | "edit">("edit");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirming(false);
    setMode(existing ? "preview" : "edit");
    if (existing) {
      setTitle(existing.title);
      setDate(existing.date);
      setStart(existing.start);
      setEnd(existing.end);
      setTag(existing.tag);
      setNotes(existing.notes ?? "");
      setAllDay(!!existing.allDay);
    } else {
      setTitle("");
      setDate(defaultDate);
      setStart(defaultStart);
      setEnd(defaultEnd);
      setTag("blue");
      setNotes("");
      setAllDay(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingId, defaultDate, defaultStart, defaultEnd]);



  const save = () => {
    if (!title.trim()) return;
    const times = allDay ? { start: "00:00", end: "23:59" } : { start, end };
    if (existing) update(existing.id, { title, date, ...times, tag, notes, allDay });
    else add({ title, date, ...times, tag, notes, allDay });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-clay/40 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.9 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            dragTransition={{ bounceStiffness: 260, bounceDamping: 32 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onClose(); }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[100dvh] flex-col overflow-hidden rounded-t-[2rem] bg-ivory"
            style={{ boxShadow: "0 -24px 70px -24px rgba(74,63,53,0.45)" }}
          >
            <div className="shrink-0">
              <div className="flex justify-center pt-3">
                <span className="h-1.5 w-10 rounded-full bg-hairline" />
              </div>
              <div className="flex items-center justify-between px-6 pt-3">
                <div className="text-xs uppercase tracking-[0.24em] text-clay-soft">
                  {mode === "preview" ? "Event" : existing ? "Edit" : "New"}
                </div>
                {mode === "preview" && existing ? (
                  <DetailActions
                    onEdit={() => setMode("edit")}
                    onDelete={() => setConfirming(true)}
                    onClose={onClose}
                  />
                ) : (
                  <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-clay-soft transition-colors hover:bg-surface-hover">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

            </div>

            <motion.div layout className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
              <AnimatePresence mode="wait" initial={false}>
              {mode === "preview" && existing ? (
                <motion.div
                  key="preview"
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
                  className="pt-2"
                >
                  <h2 className="font-serif text-3xl leading-tight tracking-tight text-clay">{existing.title}</h2>
                  <div className="mt-4">
                    <TagBadge {...TAG_STYLES[existing.tag]} />
                  </div>
                  <div className="mt-5">
                    <PreviewRow label="Date" value={format(parseISO(existing.date), "EEEE, d MMM yyyy")} />
                    <PreviewRow
                      label="Time"
                      value={existing.allDay ? "All-day" : `${existing.start} – ${existing.end}`}
                    />
                  </div>
                  {existing.notes?.trim() ? (
                    <div className="mt-6">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-clay-soft">Notes</div>
                      <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-surface px-4 py-3 text-[15px] leading-relaxed text-clay"
                        style={{ border: "1px solid var(--hairline)" }}>
                        {existing.notes}
                      </p>
                    </div>
                  ) : null}
                </motion.div>
              ) : (
              <motion.div
                key="edit"
                layout
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
              >


              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on the page?"
                className="mt-2 w-full bg-transparent pb-2 font-serif text-3xl tracking-tight placeholder:text-clay-muted focus:outline-none"
                style={{ borderBottom: "1px solid var(--hairline)", color: "var(--clay)" }}
              />

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </Field>
                <div />
                <AnimatePresence initial={false} mode="popLayout">
                  {!allDay && (
                    <>
                      <motion.div
                        key="starts"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Field label="Starts">
                          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
                        </Field>
                      </motion.div>
                      <motion.div
                        key="ends"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Field label="Ends">
                          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
                        </Field>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setAllDay((v) => !v)}
                className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
                style={{ border: "1px solid var(--hairline)" }}
              >
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-md transition-colors"
                  style={{
                    background: allDay ? "var(--clay)" : "transparent",
                    border: `1.5px solid ${allDay ? "var(--clay)" : "var(--hairline)"}`,
                  }}
                >
                  <AnimatePresence>
                    {allDay && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="h-3.5 w-3.5" strokeWidth={3} style={{ color: "var(--ivory)" }} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span className="text-[15px]">All-day event</span>
              </motion.button>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.24em] text-clay-soft">Tag</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TAGS.map((t) => {
                    const s = TAG_STYLES[t];
                    const active = tag === t;
                    return (
                      <motion.button
                        key={t}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setTag(t)}
                        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          background: active ? s.bg : "transparent",
                          color: active ? s.text : "var(--clay-soft)",
                          border: `1px solid ${active ? s.ring : "var(--hairline)"}`,
                        }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
                        {s.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.24em] text-clay-soft">Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="A thought, a place, a reminder…"
                  className="mt-2 w-full resize-none rounded-2xl bg-surface px-4 py-3 text-[15px] leading-relaxed placeholder:text-clay-muted focus:outline-none focus:ring-1 focus:ring-clay/40"
                  style={{ border: "1px solid var(--hairline)", color: "var(--clay)" }}
                />
              </div>

              <div className="mt-8 flex items-center gap-3 pb-2">
                {existing && (
                  <button
                    onClick={() => setConfirming(true)}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-clay-soft transition-colors hover:bg-surface-hover"
                    style={{ border: "1px solid var(--hairline)" }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={save}
                  disabled={!title.trim()}
                  className="flex-1 rounded-full bg-clay py-4 text-center font-medium text-ivory shadow-sm disabled:opacity-40"
                >
                  {existing ? "Save changes" : "Add to calendar"}
                </motion.button>
              </div>
              </motion.div>
              )}
              </AnimatePresence>
            </motion.div>

          </motion.div>
          <ConfirmDelete
            open={confirming}
            kind="event"
            name={existing?.title ?? ""}
            onCancel={() => setConfirming(false)}
            onConfirm={() => { if (existing) remove(existing.id); setConfirming(false); onClose(); }}
          />

        </>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "w-full rounded-2xl bg-surface px-4 py-3 text-[15px] focus:outline-none focus:ring-1 focus:ring-clay/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.24em] text-clay-soft">{label}</span>
      <span className="[&>input]:w-full [&>input]:rounded-2xl [&>input]:bg-surface [&>input]:px-4 [&>input]:py-3 [&>input]:text-[15px] [&>input]:focus:outline-none [&>input]:focus:ring-1 [&>input]:focus:ring-clay/40" style={{}}>
        <span style={{ display: "block" }}>
          {children}
        </span>
      </span>
    </label>
  );
}

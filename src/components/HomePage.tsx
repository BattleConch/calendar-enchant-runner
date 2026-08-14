import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { format, isSameDay, addDays, startOfWeek, parseISO } from "date-fns";
import { ArrowRight, Plus } from "lucide-react";
import { useEvents, TAG_STYLES, type TagColor } from "@/lib/events-store";
import { useTasks } from "@/lib/tasks-store";
import { useNotes } from "@/lib/notes-store";
import { haptic } from "@/lib/haptics";
import type { Tab } from "./BottomNav";

const iso = (d: Date) => format(d, "yyyy-MM-dd");
const dotOf = (tag?: TagColor) => (tag ? TAG_STYLES[tag].dot : "var(--clay-muted)");

export function HomePage({
  goToTab,
  onNewEvent,
  onNewTask,
  onEditEvent,
  onEditTask,
  onEditNote,
  onSelectDay,
}: {
  goToTab: (t: Tab) => void;
  onNewEvent: () => void;
  onNewTask: () => void;
  onEditEvent: (id: string) => void;
  onEditTask: (id: string) => void;
  onEditNote: (id: string) => void;
  onSelectDay: (d: Date) => void;
}) {
  const { events, byDate } = useEvents();
  const { tasks } = useTasks();
  const { notes } = useNotes();

  const now = new Date();
  const hour = now.getHours();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const greet = !mounted
    ? "Welcome back"
    : hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";


  const todayEvents = byDate(iso(now));
  const nowMin = hour * 60 + now.getMinutes();
  const upcoming = events
    .filter((e) => {
      if (e.date > iso(now)) return true;
      if (e.date < iso(now)) return false;
      const [h, m] = e.start.split(":").map(Number);
      return h * 60 + m > nowMin;
    })
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
    .slice(0, 4);

  const pendingAll = tasks.filter((t) => !t.done);
  const pending = pendingAll.slice(0, 4);
  const recentNotes = notes.slice(0, 4);
  const week = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(now, { weekStartsOn: 0 }), i));

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.05 + i * 0.07, type: "spring" as const, stiffness: 240, damping: 26 },
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 px-4 pb-4"
    >
      <motion.div {...stagger(0)} className="px-2">
        <div className="text-xs uppercase tracking-[0.24em] text-clay-soft">{greet}</div>
        <div className="mt-1 text-sm text-clay-soft">
          {todayEvents.length === 0
            ? "No plans today — a clear page."
            : `${todayEvents.length} ${todayEvents.length === 1 ? "thing" : "things"} on today.`}
          {pendingAll.length > 0 && ` ${pendingAll.length} open ${pendingAll.length === 1 ? "task" : "tasks"}.`}
        </div>
      </motion.div>

      {/* This week */}
      <Widget index={1} title="This week">
        <div className="grid grid-cols-7 gap-1.5">
          {week.map((d) => {
            const count = byDate(iso(d)).length;
            const today = isSameDay(d, now);
            return (
              <motion.button
                key={iso(d)}
                whileTap={{ scale: 0.94 }}
                onClick={() => { haptic(8); onSelectDay(d); goToTab("calendar"); }}
                className="flex flex-col items-center gap-1 rounded-2xl px-1 py-2"
                style={{
                  background: today ? "var(--clay)" : "transparent",
                  color: today ? "var(--ivory)" : "var(--clay)",
                  border: `1px solid ${today ? "var(--clay)" : "var(--hairline)"}`,
                }}
              >
                <span className="text-[9px] uppercase tracking-widest opacity-70">{format(d, "EEEEE")}</span>
                <span className="font-serif text-base leading-none">{format(d, "d")}</span>
                <span className="flex h-1.5 gap-0.5">
                  {Array.from({ length: Math.min(3, count) }).map((_, i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: today ? "var(--ivory)" : "var(--clay-muted)" }} />
                  ))}
                </span>
              </motion.button>
            );
          })}
        </div>
      </Widget>

      {/* Today */}
      <Widget index={2} title="Today" onGo={() => goToTab("calendar")}>
        {todayEvents.length === 0 ? (
          <Empty label="Nothing scheduled." />
        ) : (
          <div className="space-y-1.5">
            {todayEvents.slice(0, 4).map((e) => (
              <Row
                key={e.id}
                color={TAG_STYLES[e.tag].dot}
                title={e.title}
                sub={`${e.start} – ${e.end}`}
                onClick={() => onEditEvent(e.id)}
              />
            ))}
          </div>
        )}
        <DashedBtn label="Add event" onClick={onNewEvent} />
      </Widget>

      {/* Tasks */}
      <Widget index={3} title="Tasks" onGo={() => goToTab("tasks")}>
        {pending.length === 0 ? (
          <Empty label="All caught up." />
        ) : (
          <div className="space-y-1.5">
            {pending.map((t) => (
              <Row
                key={t.id}
                color={dotOf(t.tag)}
                title={t.title}
                sub={t.due ? format(parseISO(t.due), "EEE, MMM d") : undefined}
                onClick={() => onEditTask(t.id)}
                check
              />
            ))}
            {pendingAll.length > pending.length && (
              <button onClick={() => goToTab("tasks")} className="pl-3 pt-1 text-xs text-clay-muted">
                +{pendingAll.length - pending.length} more
              </button>
            )}
          </div>
        )}
        <DashedBtn label="Add task" onClick={onNewTask} />
      </Widget>

      {/* Upcoming */}
      <Widget index={4} title="Upcoming" onGo={() => goToTab("calendar")}>
        {upcoming.length === 0 ? (
          <Empty label="The horizon is clear." />
        ) : (
          <div className="space-y-1.5">
            {upcoming.map((e) => (
              <Row
                key={e.id}
                color={TAG_STYLES[e.tag].dot}
                title={e.title}
                sub={`${format(parseISO(e.date), "EEE, MMM d")} · ${e.start}`}
                onClick={() => onEditEvent(e.id)}
              />
            ))}
          </div>
        )}
      </Widget>

      {/* Notes */}
      <Widget index={5} title="Notes" onGo={() => goToTab("notes")}>
        {recentNotes.length === 0 ? (
          <Empty label="No notes yet." />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {recentNotes.map((n) => (
              <motion.button
                key={n.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onEditNote(n.id)}
                className="relative overflow-hidden rounded-2xl bg-surface-hover p-3 pl-4 text-left"
                style={{ border: "1px solid var(--hairline)" }}
              >
                <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: dotOf(n.tag) }} />
                <div className="truncate font-serif text-base">{n.title || "Untitled"}</div>
                {n.body && <div className="mt-0.5 line-clamp-2 text-[11px] text-clay-soft">{n.body}</div>}
              </motion.button>
            ))}
          </div>
        )}
      </Widget>
    </motion.section>
  );
}

function Widget({
  index,
  title,
  onGo,
  children,
}: {
  index: number;
  title: string;
  onGo?: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.07, type: "spring", stiffness: 240, damping: 26 }}
      className="rounded-3xl bg-surface p-4"
      style={{ border: "1px solid var(--hairline)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-clay-soft">{title}</div>
        {onGo && (
          <button onClick={onGo} className="inline-flex items-center gap-1 text-xs text-clay-muted">
            Open <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function Row({
  color,
  title,
  sub,
  onClick,
  check,
}: {
  color: string;
  title: string;
  sub?: string;
  onClick: () => void;
  check?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-surface-hover"
    >
      {check ? (
        <span className="h-4 w-4 shrink-0 rounded-md" style={{ border: `2px solid ${color}` }} />
      ) : (
        <span className="h-7 w-1 shrink-0 rounded-full" style={{ background: color }} />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px]">{title}</div>
        {sub && <div className="text-[11px] text-clay-soft">{sub}</div>}
      </div>
    </motion.button>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="px-2 py-1 text-sm text-clay-muted">{label}</div>;
}

function DashedBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => { haptic(10); onClick(); }}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm text-clay-soft"
      style={{ border: "1px dashed var(--hairline)" }}
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </motion.button>
  );
}

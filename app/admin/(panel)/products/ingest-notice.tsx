"use client";

import { useSyncExternalStore } from "react";

const KEY = "atelier-ingest-note";
let cached = "";

function readNote() {
  if (cached) return cached;
  const saved = sessionStorage.getItem(KEY) ?? "";
  if (!saved) return "";
  sessionStorage.removeItem(KEY);
  cached = saved;
  return cached;
}

export function IngestNotice() {
  const note = useSyncExternalStore(
    () => () => {},
    readNote,
    () => "",
  );
  if (!note) return null;
  return <p className="rounded-2xl bg-sand px-4 py-3 text-sm text-ink">{note}</p>;
}

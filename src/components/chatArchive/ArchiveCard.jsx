import React from "react";
import { Edit3, Trash2, Link2, User, Calendar, Lightbulb } from "lucide-react";
import moment from "moment";

export default function ArchiveCard({ item, isOwner, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-[0.86rem] font-bold leading-snug" style={{ color: "var(--text)" }}>{item.title}</h3>
        {isOwner && (
          <div className="flex flex-shrink-0 items-center gap-1">
            <button onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--blue)" }}><Edit3 size={13} /></button>
            <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--coral)" }}><Trash2 size={13} /></button>
          </div>
        )}
      </div>

      {item.screenshot_url && (
        <img src={item.screenshot_url} alt="" className="mb-2.5 h-36 w-full rounded-lg border object-cover" style={{ borderColor: "var(--border)" }} />
      )}
      {item.screenshot_link && (
        <a href={item.screenshot_link} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-1.5 text-[0.72rem] hover:underline" style={{ color: "var(--blue)" }}>
          <Link2 size={11} /> Link screenshot
        </a>
      )}
      {item.description && <p className="mb-2 text-[0.74rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{item.description}</p>}
      {item.solution && (
        <div className="mb-2 flex items-start gap-1.5 rounded-lg p-2 text-[0.72rem]" style={{ background: "rgba(16,185,129,0.08)", color: "var(--green)" }}>
          <Lightbulb size={12} className="mt-0.5 flex-shrink-0" /> {item.solution}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-[0.62rem]" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
        <div className="flex items-center gap-1.5"><User size={11} /> {item.creator_name || "—"}</div>
        <div className="flex items-center gap-1.5"><Calendar size={11} /> {moment(item.created_date).format("DD MMM YYYY, HH:mm")}</div>
      </div>
    </div>
  );
}
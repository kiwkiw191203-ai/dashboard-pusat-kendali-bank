import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

/**
 * Expandable/Collapsible tree menu for the "Template Fitur per Role" section.
 * Each feature group is a parent node that expands to reveal its feature toggles.
 * Styled like sidebar navigation with indentation, chevron rotation, and count badges.
 */
export default function RoleTemplateTree({
  groups,
  roleKey,
  isFeatureOn,
  onToggle,
  disabled,
}) {
  // All groups expanded by default for the selected role
  const [expanded, setExpanded] = useState(() => new Set(groups.map((g) => g.key)));

  const toggleGroup = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-1.5">
      {groups.map((group) => {
        const GIcon = group.icon;
        const isOpen = expanded.has(group.key);
        const enabledCount = group.items.filter((f) => isFeatureOn(roleKey, f.key)).length;
        const totalCount = group.items.length;

        return (
          <div key={group.key} className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
            {/* Parent node — clickable header */}
            <button
              onClick={() => toggleGroup(group.key)}
              disabled={disabled}
              className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--hover)] disabled:opacity-50"
            >
              <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0" style={{ color: "var(--text-3)" }}>
                <ChevronRight size={14} />
              </motion.div>
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${group.color}18`, color: group.color, border: `1px solid ${group.color}30` }}>
                <GIcon size={13} />
              </div>
              <span className="flex-1 text-[0.76rem] font-bold tracking-wide" style={{ color: "var(--text)" }}>{group.label}</span>
              {/* Count badge */}
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.55rem] font-bold" style={{ background: enabledCount > 0 ? `${group.color}22` : "var(--hover)", color: enabledCount > 0 ? group.color : "var(--text-3)", border: `1px solid ${enabledCount > 0 ? group.color + "44" : "var(--border)"}` }}>
                {enabledCount}/{totalCount}
              </span>
            </button>

            {/* Children — feature items */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 pb-2 pl-10 pr-3">
                    {group.items.map((f) => {
                      const on = isFeatureOn(roleKey, f.key);
                      return (
                        <FeatureToggleRow
                          key={f.key}
                          label={f.label}
                          desc={f.desc}
                          color={group.color}
                          on={on}
                          disabled={disabled}
                          onClick={() => onToggle(roleKey, f.key)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function FeatureToggleRow({ label, desc, color, on, disabled, onClick }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-all"
      style={{
        background: on ? `${color}0a` : "transparent",
        borderColor: on ? `${color}30` : "var(--border)",
      }}
    >
      {/* Tree branch indicator */}
      <div className="flex-shrink-0 h-3 w-px" style={{ background: "var(--border)" }} />
      <div className="flex-1 min-w-0">
        <div className="text-[0.72rem] font-semibold truncate" style={{ color: on ? "var(--text)" : "var(--text-2)" }}>{label}</div>
        {desc && <div className="text-[0.58rem] truncate" style={{ color: "var(--text-3)" }}>{desc}</div>}
      </div>
      <Toggle on={on} disabled={disabled} onChange={onClick} />
    </div>
  );
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className="relative flex-shrink-0 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50"
      style={{
        width: 38,
        height: 21,
        background: on ? "linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)" : "rgba(90,97,114,0.35)",
        boxShadow: on ? "0 0 10px rgba(220,38,38,0.45), inset 0 1px 1px rgba(0,0,0,0.2)" : "inset 0 1px 1px rgba(0,0,0,0.2)",
        border: `1px solid ${on ? "rgba(220,38,38,0.6)" : "rgba(255,255,255,0.08)"}`,
      }}>
      <motion.span
        animate={{ x: on ? 19 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full"
        style={{ background: on ? "#FFFFFF" : "#D1D5DB", boxShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
      />
    </button>
  );
}
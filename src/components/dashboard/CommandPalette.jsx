import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  FileText, Dices, Calculator, Zap, Ticket, Trophy, Landmark, Receipt, Bot,
  Settings, Home, Search, MessageCircle, LayoutDashboard, StickyNote, Activity,
  Radio, Crown,
} from "lucide-react";

const PAGES = [
  { to: "/", icon: LayoutDashboard, label: "Overview", group: "Dashboard", keywords: "utama beranda home" },
  { to: "/dashboard", icon: Home, label: "Dashboard", group: "Dashboard", keywords: "statistik chart" },
  { to: "/hlxpro", icon: Bot, label: "AI Assistant", group: "AI", keywords: "ai chat bot gpt assistant hl pro" },
  { to: "/notes", icon: StickyNote, label: "Notes", group: "AI", keywords: "catatan note markdown" },
  { to: "/activity", icon: Activity, label: "Activity Log", group: "Tim", keywords: "log aktivitas history" },
  { to: "/online", icon: Radio, label: "Pengguna Online", group: "Tim", keywords: "online user session" },
  { to: "/files", icon: FileText, label: "File Kerja CS", group: "Alat", keywords: "file cs kerja" },
  { to: "/predict", icon: Dices, label: "Prediksi Togel", group: "Alat", keywords: "prediksi togel lottery ai" },
  { to: "/analyzer", icon: Calculator, label: "Hitung Freespin", group: "Alat", keywords: "freespin hitung analyzer" },
  { to: "/shortcut", icon: Zap, label: "Pintasan B.Qris", group: "Alat", keywords: "pintasan shortcut qris bca" },
  { to: "/ticket", icon: Ticket, label: "Kode Tiket", group: "Alat", keywords: "tiket kode ticket" },
  { to: "/win", icon: Trophy, label: "Tangkapan Menang", group: "Alat", keywords: "menang win tangkapan" },
  { to: "/bank", icon: Landmark, label: "Profil Bank", group: "Alat", keywords: "bank profil rekening" },
  { to: "/rrn", icon: Receipt, label: "RRN Qris", group: "Alat", keywords: "rrn qris receipt" },
  { to: "/chat", icon: MessageCircle, label: "Chat Koordinasi", group: "Tim", keywords: "chat koordinasi team" },
  { to: "/settings", icon: Settings, label: "Pengaturan", group: "Sistem", keywords: "settings pengaturan permissions role security" },
];

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const groups = [...new Set(PAGES.map((p) => p.group))];

  const go = (to) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Cari halaman, modul, atau perintah…" />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g} heading={g}>
            {PAGES.filter((p) => p.group === g).map((p) => (
              <CommandItem key={p.to} onSelect={() => go(p.to)} className="gap-2.5" keywords={p.keywords ? p.keywords.split(/\s+/).filter(Boolean) : undefined}>
                <p.icon size={15} style={{ color: "var(--text-3)" }} />
                <span>{p.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
import {
  LayoutDashboard, Bot, StickyNote, Activity, Radio, ShieldCheck, Palette, Zap, Lock,
  Database, Cpu, Globe, Trophy, Ticket, Landmark, Receipt, Dices, Calculator, FileText,
  MessageCircle, Settings, User, Crown, Rocket, Star, Heart, Flame, Gamepad2, Swords,
  Target, TrendingUp, Newspaper, Calendar, Bell, Users, Wallet, Coins, BarChart3, Flag,
  Anchor, Plane, Car, Bike, Award, Medal, FlagTriangleLeft, Dumbbell, Volleyball,
} from "lucide-react";

export const FEATURE_ICONS = {
  LayoutDashboard, Bot, StickyNote, Activity, Radio, ShieldCheck, Palette, Zap, Lock,
  Database, Cpu, Globe, Trophy, Ticket, Landmark, Receipt, Dices, Calculator, FileText,
  MessageCircle, Settings, User, Crown, Rocket, Star, Heart, Flame, Gamepad2, Swords,
  Target, TrendingUp, Newspaper, Calendar, Bell, Users, Wallet, Coins, BarChart3, Flag,
  Anchor, Plane, Car, Bike, Award, Medal, Dumbbell, Volleyball,
};

export const ICON_NAMES = Object.keys(FEATURE_ICONS);
export const getIcon = (name) => FEATURE_ICONS[name] || LayoutDashboard;
import { FileDiff, KeyRound, Database, type LucideIcon } from "lucide-react";

export const ROUTES = {
  dashboard: "/dashboard",
  diff: "/diff",
  jwt: "/jwt",
  generator: "/generator",
  settings: "/settings",
} as const;

export interface ToolDef {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const TOOLS: ToolDef[] = [
  {
    to: ROUTES.diff,
    title: "Text Diff",
    description: "Compare two texts with line-based and word-level highlighting.",
    icon: FileDiff,
  },
  {
    to: ROUTES.jwt,
    title: "JWT Tool",
    description: "Decode, inspect, and create JSON Web Tokens with signature verification.",
    icon: KeyRound,
  },
  {
    to: ROUTES.generator,
    title: "Data Generator",
    description: "Generate fake data records for development and testing.",
    icon: Database,
  },
];

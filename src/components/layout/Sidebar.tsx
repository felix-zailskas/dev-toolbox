import { NavLink } from "react-router";
import { LayoutDashboard, FileDiff, KeyRound, Database } from "lucide-react";
import { ROUTES } from "@/routes";

const links = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.diff, label: "Text Diff", icon: FileDiff },
  { to: ROUTES.jwt, label: "JWT Decoder", icon: KeyRound },
  { to: ROUTES.generator, label: "Data Generator", icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-border flex flex-col gap-1 p-3">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}

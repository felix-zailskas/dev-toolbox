import { NavLink } from "react-router";
import { LayoutDashboard, Settings } from "lucide-react";
import { ROUTES, TOOLS } from "@/routes";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
  }`;

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-border flex flex-col p-3 h-full">
      <div className="flex flex-col gap-1 flex-1">
        <NavLink to={ROUTES.dashboard} className={linkClass}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
        {TOOLS.map(({ to, title, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="h-4 w-4" />
            {title}
          </NavLink>
        ))}
      </div>
      <NavLink to={ROUTES.settings} className={linkClass}>
        <Settings className="h-4 w-4" />
        Settings
      </NavLink>
    </aside>
  );
}

import { Outlet } from "react-router";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import TextDiff from "./pages/TextDiff";
import JwtDecoder from "./pages/JwtDecoder";
import DataGenerator from "./pages/DataGenerator";
import Settings from "./pages/Settings";
import { ROUTES } from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path={ROUTES.dashboard} element={<Dashboard />} />
          <Route path={ROUTES.diff} element={<TextDiff />} />
          <Route path={ROUTES.jwt} element={<JwtDecoder />} />
          <Route path={ROUTES.generator} element={<DataGenerator />} />
          <Route path={ROUTES.settings} element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

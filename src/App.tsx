import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import TextDiff from "./pages/TextDiff";
import JwtDecoder from "./pages/JwtDecoder";
import DataGenerator from "./pages/DataGenerator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diff" element={<TextDiff />} />
          <Route path="/jwt" element={<JwtDecoder />} />
          <Route path="/generator" element={<DataGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

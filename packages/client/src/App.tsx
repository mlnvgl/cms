import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ContentTypes } from "./pages/ContentTypes";
import { Entries } from "./pages/Entries";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="content-types" element={<ContentTypes />} />
        <Route path="entries" element={<Entries />} />
      </Route>
    </Routes>
  );
}

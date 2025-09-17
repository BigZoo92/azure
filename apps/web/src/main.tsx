import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { Auth } from "./pages/auth";
import PollPage from "./pages/polls";
import { RequireAuth, RedirectIfAuth } from "@/pages/routes-guard";
import { AuthProvider } from "./auth/authContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <RedirectIfAuth to="/">
              <Auth />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <PollPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

import { createFileRoute, Navigate } from "@tanstack/react-router";

/** Rota legada — redireciona para o /auth novo. */
export const Route = createFileRoute("/admin/login")({
  component: () => <Navigate to="/auth" search={{ next: "/admin" }} replace />,
});

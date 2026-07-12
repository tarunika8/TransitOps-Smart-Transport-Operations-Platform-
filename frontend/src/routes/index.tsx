import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { ROLE_HOME } from "@/lib/rbac";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { auth } = useStore();
  if (!auth) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[auth.role]} replace />;
}

import { useAppSelector } from "../../store/hooks";
import { OwnerDashboard } from "./OwnerDashboard";
import { TenantDashboard } from "./TenantDashboard";
 
export function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return null;
  const userRole = user?.role?.toUpperCase();
  if (userRole === "OWNER") return <OwnerDashboard />;
  return <TenantDashboard />;
}
 

import { useAuth } from '@/contexts/auth-context';
import { Navigate, Outlet, useLocation } from 'react-router';
import DashboardLayout from './dashboard-layout';

export default function LoggedInLayout({
  allowedRoles,
  isFieldOnly,
}: {
  allowedRoles?: string[];
  isFieldOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  if (isFieldOnly && !user.department.isField) {
    return <Navigate to="/" />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

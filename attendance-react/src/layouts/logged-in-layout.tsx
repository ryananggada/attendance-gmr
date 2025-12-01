import { useAuth } from '@/contexts/auth-context';
import { Navigate, Outlet, useLocation } from 'react-router';
import DashboardLayout from './dashboard-layout';
import { Spinner } from '@/components/ui/spinner';

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
    return <Spinner className="mx-auto mt-6 size-12" />;
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

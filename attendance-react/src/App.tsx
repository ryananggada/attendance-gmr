import { Route, Routes } from 'react-router';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/auth-context';
import HomePage from './pages/home-page';
import LoginPage from './pages/login-page';
import AttendancePage from './pages/attendance-page';
import UsersListPage from './pages/users-list-page';
import AddUserPage from './pages/add-user-page';
import EditUserPage from './pages/edit-user-page';
import DepartmentsListPage from './pages/departments-list-page';
import AddDepartmentPage from './pages/add-department-page';
import AddFieldAttendancePage from './pages/add-field-attendance-page';
import FieldAttendancePage from './pages/field-attendance-page';
import EditDepartmentPage from './pages/edit-department-page';
import LoggedInLayout from './layouts/logged-in-layout';
import NotFoundPage from './pages/not-found-page';
import AttendanceSummaryPage from './pages/attendance-summary-page';
import FieldAttendanceSummaryPage from './pages/field-attendance-summary-page';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<LoggedInLayout />}>
          <Route index element={<HomePage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>

        <Route element={<LoggedInLayout isFieldOnly />}>
          <Route path="field-attendance" element={<FieldAttendancePage />} />
          <Route
            path="field-attendance/create"
            element={<AddFieldAttendancePage />}
          />
        </Route>

        <Route element={<LoggedInLayout allowedRoles={['Admin']} />}>
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/create" element={<AddUserPage />} />
          <Route path="users/:id/edit" element={<EditUserPage />} />
          <Route path="departments" element={<DepartmentsListPage />} />
          <Route path="departments/create" element={<AddDepartmentPage />} />
          <Route path="departments/:id/edit" element={<EditDepartmentPage />} />
          <Route
            path="attendance-summary"
            element={<AttendanceSummaryPage />}
          />
          <Route
            path="field-attendance-summary"
            element={<FieldAttendanceSummaryPage />}
          />
        </Route>

        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster richColors />
    </AuthProvider>
  );
}

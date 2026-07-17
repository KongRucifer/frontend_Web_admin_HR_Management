import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { ApprovalsPage } from '@/pages/ApprovalsPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { BirthdaysPage } from '@/pages/BirthdaysPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DepartmentsPage } from '@/pages/DepartmentsPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage';
import { SchedulesPage } from '@/pages/SchedulesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UsersPage } from '@/pages/UsersPage';
import { OfficeLocationsPage } from '@/pages/OfficeLocationsPage';
import { WifiPage } from '@/pages/WifiPage';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const theme = useThemeStore((s) => s.theme);

  // Re-validate the httpOnly session cookie on load.
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Apply the dark/light class to <html>.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <>
      <Toaster />
      <ConfirmDialog />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/birthdays" element={<BirthdaysPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Schedules + Office locations now live inside Settings, but the
              standalone routes stay reachable by direct URL. */}
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/office-locations" element={<OfficeLocationsPage />} />
          {/* WiFi management kept reachable by URL (still used by the mobile
              app), just removed from the menu in favour of GPS. */}
          <Route path="/wifi" element={<WifiPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile-settings" element={<ProfileSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Guard components
import PrivateRoute from './PrivateRoute';
import RoleGuard from './RoleGuard';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import DoctorsManagement from '../pages/admin/DoctorsManagement';
import PatientsManagement from '../pages/admin/PatientsManagement';
import DepartmentsManagement from '../pages/admin/DepartmentsManagement';
import Reports from '../pages/admin/Reports';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import AvailabilityManagement from '../pages/doctor/AvailabilityManagement';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorPatients from '../pages/doctor/DoctorPatients';
import DoctorProfile from '../pages/doctor/DoctorProfile';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import SearchDoctors from '../pages/patient/SearchDoctors';
import PatientAppointments from '../pages/patient/PatientAppointments';
import PatientProfile from '../pages/patient/PatientProfile';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public/Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Admin Dashboard Panels */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['Admin']}>
              <DashboardLayout />
            </RoleGuard>
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<DoctorsManagement />} />
        <Route path="patients" element={<PatientsManagement />} />
        <Route path="departments" element={<DepartmentsManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Doctor Dashboard Panels */}
      <Route
        path="/doctor"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['Doctor']}>
              <DashboardLayout />
            </RoleGuard>
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="availability" element={<AvailabilityManagement />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Patient Dashboard Panels */}
      <Route
        path="/patient"
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['Patient']}>
              <DashboardLayout />
            </RoleGuard>
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="doctors" element={<SearchDoctors />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

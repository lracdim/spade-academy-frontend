import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthLayout from './components/layout/AuthLayout';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCoursesPage';
import AdminModulesPage from './pages/admin/AdminModulesPage';
import AdminGuards from './pages/admin/AdminGuardsPage';
import AdminUsers from './pages/admin/AdminUsersPage';
import AdminCertificates from './pages/admin/AdminCertificatesPage';
import { AdminSettings } from './pages/admin/AdminModules';
import AdminVideoPlayer from './pages/admin/AdminVideoPlayer';
import AdminModuleLessonsPage from './pages/admin/AdminModuleLessonsPage';

import GuardLayout from './components/layout/GuardLayout';
import GuardDashboard from './pages/guard/GuardDashboard';
import GuardLearningHub from './pages/guard/GuardLearningHub';
import GuardCourseModules from './pages/guard/GuardCourseModules';
import GuardVideoPlayer from './pages/guard/GuardVideoPlayer';
import GuardModuleLessons from './pages/guard/GuardModuleLessons';
import GuardCertificates from './pages/guard/GuardCertificates';
import GuardKnowledgeRecord from './pages/guard/GuardKnowledgeRecord';
import GuardSettings from './pages/guard/GuardSettings';
import GuardQuizReview from './pages/guard/GuardQuizReview';
import VerifyCertificate from './pages/VerifyCertificate';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" richColors theme="dark" />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseId/modules" element={<AdminModulesPage />} />
          <Route path="courses/:courseId/modules/:moduleId/lessons" element={<AdminModuleLessonsPage />} />
          <Route path="courses/:courseId/play" element={<AdminVideoPlayer />} />
          <Route path="guards" element={<AdminGuards />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Guard Protected Routes */}
        <Route path="/guard" element={<GuardLayout />}>
          <Route index element={<GuardDashboard />} />
          <Route path="learning-hub" element={<GuardLearningHub />} />
          <Route path="learning-hub/:courseId" element={<GuardCourseModules />} />
          <Route path="learning-hub/:courseId/modules/:moduleId" element={<GuardModuleLessons />} />
          <Route path="learning-hub/:courseId/play" element={<GuardVideoPlayer />} />
          <Route path="certificates" element={<GuardCertificates />} />
          <Route path="knowledge-record" element={<GuardKnowledgeRecord />} />
          <Route path="knowledge-record/review/:attemptId" element={<GuardQuizReview />} />
          <Route path="settings" element={<GuardSettings />} />
        </Route>

        {/* Public Routes */}
        <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import UploadMaterials from "./pages/teacher/UploadMaterials";
import CreateAssignment from "./pages/teacher/CreateAssignment";
import CreateCAT from "./pages/teacher/CreateCAT";
import GradingInterface from "./pages/teacher/GradingInterface";
import PerformanceTracking from "./pages/teacher/PerformanceTracking";
import TeacherResults from "./pages/teacher/TeacherResults";
import StudentManagement from "./pages/teacher/StudentManagement";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import Subjects from "./pages/teacher/Subjects";
import Books from "./pages/teacher/Books";
import CBCLessons from "./pages/teacher/CBCLessons";
import TeacherLogin from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import Messages from "./pages/teacher/Messages";
// import './App.css'
     
import Home from "./pages/Home";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }   

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/login" element={<TeacherLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
              <Route path="/teacher/upload-materials" element={<ProtectedRoute><UploadMaterials /></ProtectedRoute>} />
              <Route path="/teacher/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path="/teacher/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
              <Route path="/teacher/create-assignment" element={<ProtectedRoute><CreateAssignment /></ProtectedRoute>} />
              <Route path="/teacher/create-cat" element={<ProtectedRoute><CreateCAT /></ProtectedRoute>} />
              <Route path="/teacher/cbc-lessons" element={<ProtectedRoute><CBCLessons /></ProtectedRoute>} />
              <Route path="/teacher/grading" element={<ProtectedRoute><GradingInterface /></ProtectedRoute>} />
              <Route path="/teacher/performance" element={<ProtectedRoute><PerformanceTracking /></ProtectedRoute>} />
              <Route path="/teacher/results" element={<ProtectedRoute><TeacherResults /></ProtectedRoute>} />
              <Route path="/teacher/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
              <Route path="/teacher/notifications" element={<ProtectedRoute><TeacherNotifications /></ProtectedRoute>} />
              <Route path="/teacher/profile" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
              <Route path="/teacher/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App

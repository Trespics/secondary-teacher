import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import PortalSidebar from "./PortalSidebar";
import { Menu, X, Bell, ChevronDown } from "lucide-react";
import "./styles/PortalLayout.css";

interface PortalLayoutProps {
  children: ReactNode;
  type: "student" | "masomo" | "teacher";
}

const PortalLayout = ({ children, type }: PortalLayoutProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-profile')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  if (!isAuthenticated) {
    return <Navigate to={`/login/${type}`} replace />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getRoleTitle = () => {
    switch(type) {
      case 'student': return 'Student Portal';
      case 'teacher': return 'Teacher Dashboard';
      case 'masomo': return 'Learning Portal';
      default: return 'Portal';
    }
  };

  return (
    <div className={`portal-layout ${type}`}>
      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`mobile-overlay ${isSidebarOpen ? "visible" : ""}`} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <PortalSidebar 
        type={type} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className={`portal-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile Header */}
        <header className="mobile-header">
          <button 
            className="menu-toggle" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="mobile-logo-wrapper">
            <span className="mobile-logo">Florante</span>
            <span className="mobile-role-badge">{getRoleTitle()}</span>
          </div>
          <div className="mobile-actions">
            <button className="mobile-notification-btn">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            <div className="mobile-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
              <span className="avatar-initials">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="desktop-header">
          <div className="header-left">
            <div className="greeting-section">
              <h1 className="page-title">
                {getGreeting()}, <span className="user-name-highlight">{user?.name?.split(' ')[0] || 'User'}</span>
              </h1>
              <p className="page-subtitle">
                {type === 'student' ? 'Track your academic progress and stay updated with your courses' : 
                 type === 'teacher' ? 'Manage your classes, assignments, and student performance' : 
                 'Access your learning materials and continue your educational journey'}
              </p>
            </div>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{getRoleTitle()}</span>
              </div>
              <div className="user-avatar">
                <span className="avatar-initials">
                  {user?.name?.charAt(0) || 'U'}
                </span>
                <ChevronDown size={16} className="avatar-chevron" />
              </div>
            </div>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <span className="dropdown-avatar-initials">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="dropdown-info">
                    <span className="dropdown-name">{user?.name || 'User'}</span>
                    <span className="dropdown-email">{user?.email || 'user@Florante.com'}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item">
                  <span>Profile Settings</span>
                </button>
                <button className="dropdown-item">
                  <span>Account Preferences</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item dropdown-logout">
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="content-wrapper">
          <div className="content-container">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  FileText,
  BarChart3,
  LogOut,
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
  ListChecks,
  PieChart,
  Bell,
  GraduationCap,
  Library,

} from "lucide-react";
import "./styles/PortalSidebar.css";

interface SidebarProps {
  type: "student" | "masomo" | "teacher";
  isOpen?: boolean;
  onClose?: () => void;
}

const teacherNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/teacher" },
  { label: "Learning Materials", icon: Library, to: "/teacher/upload-materials" },
  { label: "Subjects", icon: BookOpen, to: "/teacher/subjects" },
  { label: "Assignments", icon: FileText, to: "/teacher/create-assignment" },
  { label: "Assignment Grading", icon: ListChecks, to: "/teacher/grading" },
  { label: "Books", icon: Library, to: "/teacher/books" },
  { label: "Performance", icon: BarChart3, to: "/teacher/performance" },
  { label: "Results", icon: FileText, to: "/teacher/results" },
  // { label: "Reports", icon: PieChart, to: "/teacher/reports" },
  { label: "Notifications", icon: Bell, to: "/teacher/notifications" },
  { label: "Profile", icon: User, to: "/teacher/profile" },
];

const PortalSidebar = ({ type, isOpen: propIsOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const links = teacherNavItems;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen && onClose) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleMobileMenu}
        />
      )}

      <aside 
        className={`portal-sidebar ${type} ${isMobile ? 'mobile' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <GraduationCap className="logo-icon" />
            <span className="logo-text">Florante</span>
          </div>
          <div className="header-badge">
            <span className="role-badge">{type === 'teacher' ? 'Teacher Portal' : type === 'student' ? 'Student Portal' : 'Learning Portal'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}      
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <link.icon className="nav-icon" />
                <span className="nav-label" 
                style={{color:"white", fontSize:"1rem"}}
                >{link.label}</span>
                {isActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            <LogOut className="logout-icon" />
            <span className="logout-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default PortalSidebar;
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  CreditCard,
  FileText,
  BarChart3,
  Activity,
  LogOut,
  BookOpen,
  Bell,
  Grid3X3,
  Home,
  CheckSquare,
  HelpCircle,
  Book,
  Menu,
  X,
  LayoutDashboard,
  ClipboardCheck,
  ListChecks,
  Users,
  PieChart,
  Archive,
  GraduationCap,
  UserCircle,
  Wallet,
  ClipboardList,
  Trophy,
  Layers,
} from "lucide-react";
import "./styles/PortalLayout.css";

interface SidebarProps {
  type: "student" | "masomo" | "teacher";   
  isOpen?: boolean;
  onClose?: () => void;
}

const teacherNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/teacher" },
  { label: "Learning Materials", icon: BookOpen, to: "/teacher/upload-materials" },
  { label: "Subjects", icon: BookOpen, to: "/teacher/subjects" },
  // { label: "CBC Module", icon: Layers, to: "/teacher/cbc-lessons" },
  { label: "Assignments", icon: FileText, to: "/teacher/create-assignment" },
  { label: "CATs / Assessments", icon: ClipboardCheck, to: "/teacher/create-cat" },
  { label: "Grading", icon: ListChecks, to: "/teacher/grading" },
  { label: "Students", icon: Users, to: "/teacher/students" },
  { label: "Performance", icon: BarChart3, to: "/teacher/performance" },
  { label: "Reports", icon: PieChart, to: "/teacher/reports" },
  { label: "Profile", icon: User, to: "/teacher/profile" },
];

const PortalSidebar = ({ type, isOpen: propIsOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const links = teacherNavItems; // Updated to use teacherNavItems

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
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
          <Home className="header-icon" />
          <span className="header-title">TRESPICS</span>
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
                <span className="nav-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="logout-icon" />
          <span className="logout-label">Logout</span>
        </button>
      </aside>
    </>
  );
};

export default PortalSidebar;
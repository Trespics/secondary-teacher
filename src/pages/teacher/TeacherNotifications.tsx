import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Bell, 
  Check, 
  Trash2,
  Calendar,
  AlertCircle,
  MessageSquare,
  FileText,
  Clock,
  Loader2,
  Plus,
  Send,
  Inbox,
  Megaphone,
  Users
} from "lucide-react";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import "../styles/Notifications.css";

type NotificationType = "submission" | "message" | "system" | "reminder" | "general";
type FilterType = "all" | "submission" | "system" | "message" | "reminder";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "general"
  });

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get("/teacher/notifications");
      setNotifications(data || []);
    } catch (err) {
      console.error("Fetch notifs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.title || !newNotification.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/teacher/notifications", newNotification);
      toast.success("Notification sent successfully!");
      setIsComposeOpen(false);
      setNewNotification({ title: "", message: "", type: "general" });
      fetchNotifs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send notification");
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      toast.success("Notification marked as read");
      await api.patch(`/teacher/notifications/${id}/read`);
    } catch (err) {
      console.log(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
      await api.patch("/teacher/notifications/mark-all-read");
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification deleted");
      await api.delete(`/teacher/notifications/${id}`);
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'submission': return <FileText size={18} className="type-icon submission-icon" />;
      case 'message': return <MessageSquare size={18} className="type-icon message-icon" />;
      case 'system': return <AlertCircle size={18} className="type-icon system-icon" />;
      case 'reminder': return <Calendar size={18} className="type-icon reminder-icon" />;
      default: return <Bell size={18} className="type-icon general-icon" />;
    }
  };

  const getFilteredNotifications = () => {
    if (activeFilter === "all") return notifications;
    return notifications.filter(n => n.type === activeFilter);
  };

  const getTypeCount = (type: NotificationType | "all") => {
    if (type === "all") return notifications.length;
    return notifications.filter(n => n.type === type).length;
  };

  const getUnreadCount = (type?: NotificationType) => {
    if (type) {
      return notifications.filter(n => !n.is_read && n.type === type).length;
    }
    return notifications.filter(n => !n.is_read).length;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  const filterOptions = [
    { id: "all" as FilterType, label: "All Alerts", icon: Bell, color: "blue" },
    { id: "submission" as FilterType, label: "Submissions", icon: FileText, color: "green" },
    { id: "system" as FilterType, label: "System Updates", icon: AlertCircle, color: "purple" },
    { id: "message" as FilterType, label: "Direct Messages", icon: MessageSquare, color: "orange" },
    { id: "reminder" as FilterType, label: "Reminders", icon: Calendar, color: "amber" },
  ];

  if (loading) {
    return (
      <PortalLayout type="teacher">
        <div className="teacher-loading">
          <Loader2 className="loading-spinner" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout type="teacher">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="teacher-notifications-container"
      >
        {/* Header Section */}
        <div className="notifications-header">
          <div className="header-content">
            <h1 className="page-title">
              <Bell className="title-icon" />
              Notifications
            </h1>
            <p className="page-subtitle">
              Manage and broadcast important updates to your students
            </p>
          </div>
          <div className="header-actions">
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogTrigger asChild>
                <Button className="compose-button">
                  <Plus size={18} />
                  Compose
                </Button>
              </DialogTrigger>
              <DialogContent className="compose-dialog">
                <DialogHeader>
                  <DialogTitle className="dialog-title">Send Notification</DialogTitle>
                  <DialogDescription className="dialog-description">
                    Broadcast a message to your students or school members
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateNotification} className="compose-form">
                  <div className="form-field">
                    <Label htmlFor="title">Headline</Label>
                    <Input 
                      id="title" 
                      placeholder="Summary of the notice..." 
                      value={newNotification.title} 
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })} 
                      className="form-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="type">Category</Label>
                    <Select value={newNotification.type} onValueChange={(v) => setNewNotification({ ...newNotification, type: v })}>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Alert</SelectItem>
                        <SelectItem value="reminder">Assignment Reminder</SelectItem>
                        <SelectItem value="system">Class Update</SelectItem>
                        <SelectItem value="message">Direct Message</SelectItem>
                        <SelectItem value="submission">Submission Related</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-field">
                    <Label htmlFor="message">Full Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Detailed instructions or information..." 
                      className="form-textarea" 
                      value={newNotification.message} 
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })} 
                    />
                  </div>
                  <DialogFooter className="dialog-footer">
                    <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)} className="cancel-button">
                      Cancel
                    </Button>
                    <Button type="submit" className="send-button" disabled={submitting}>
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {submitting ? "Sending..." : "Send Notification"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="mark-all-button" onClick={markAllAsRead}>
              <Check size={16} />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="notifications-grid">
          {/* Sidebar Navigation */}
          <div className="sidebar-nav">
            <nav className="nav-menu">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeFilter === option.id;
                const count = getTypeCount(option.id);
                const unread = getUnreadCount(option.id === "all" ? undefined : option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setActiveFilter(option.id)}
                    className={`nav-item ${isActive ? `nav-item-active nav-item-active-${option.color}` : ""}`}
                  >
                    <div className="nav-item-content">
                      <Icon size={18} className={`nav-icon ${isActive ? `nav-icon-active-${option.color}` : ""}`} />
                      <span className="nav-label">{option.label}</span>
                    </div>
                    {count > 0 && (
                      <div className="nav-badge-group">
                        <Badge className={`nav-badge ${isActive ? `nav-badge-active-${option.color}` : "nav-badge-default"}`}>
                          {count}
                        </Badge>
                        {unread > 0 && (
                          <span className="nav-unread-dot" title={`${unread} unread`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* Stats Card */}
            <div className="stats-card">
              <div className="stats-header">
                <Inbox size={16} />
                <span>Summary</span>
              </div>
              <div className="stats-content">
                <div className="stat-item">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{notifications.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unread</span>
                  <span className="stat-value stat-unread">{unreadCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Read</span>
                  <span className="stat-value">{notifications.length - unreadCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list-area">
            {filteredNotifications.length === 0 ? (
              <Card className="empty-state-card">
                <div className="empty-state-content">
                  <Bell size={48} className="empty-state-icon" />
                  <h3 className="empty-state-title">All caught up!</h3>
                  <p className="empty-state-description">
                    {activeFilter === "all" 
                      ? "No notifications to display right now." 
                      : `No ${activeFilter} notifications at the moment.`}
                  </p>
                </div>
              </Card>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="notifications-list">
                  {filteredNotifications.map((notif, i) => (
                    <motion.div
                      key={notif.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="notification-item-wrapper"
                    >
                      <Card className={`notification-card ${!notif.is_read ? "notification-unread" : "notification-read"}`}>
                        <CardContent className="notification-card-content">
                          <div className={`notification-icon-wrapper ${!notif.is_read ? "icon-wrapper-unread" : ""}`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="notification-details">
                            <div className="notification-header-details">
                              <h4 className={`notification-title ${!notif.is_read ? "title-unread" : ""}`}>
                                {notif.title}
                              </h4>
                              <span className="notification-time">
                                <Clock size={12} />
                                {new Date(notif.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                            <p className={`notification-message ${!notif.is_read ? "message-unread" : ""}`}>
                              {notif.message}
                            </p>
                            
                            {!notif.is_read && (
                              <div className="notification-actions">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="action-button-read"
                                  onClick={() => markAsRead(notif.id)}
                                >
                                  Mark Read
                                </Button>
                                {notif.type === 'submission' && (
                                  <Button 
                                    size="sm" 
                                    className="action-button-view"
                                  >
                                    View Submission
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          {notif.is_read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="delete-button"
                              onClick={() => deleteNotification(notif.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default TeacherNotifications;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Bell, 
  Check, 
  Settings, 
  Trash2,
  Calendar,
  AlertCircle,
  MessageSquare,
  FileText,
  Clock,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const markAsRead = async (id: string) => {
    try {
      // In a real app we'd have a PUT endpoint to mark read
      // For now we just filter it out of the UI or call the backend
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      toast.success("Notification marked as read");
    } catch (err) {
        console.log(err)
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'submission': return <FileText size={18} className="text-blue-500" />;
        case 'message': return <MessageSquare size={18} className="text-green-500" />;
        case 'system': return <AlertCircle size={18} className="text-purple-500" />;
        case 'reminder': return <Calendar size={18} className="text-orange-500" />;
        default: return <Bell size={18} className="text-slate-500" />;
    }
  };

  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white';
    switch (type) {
        case 'submission': return 'bg-blue-50/50';
        case 'message': return 'bg-green-50/50';
        case 'system': return 'bg-purple-50/50';
        case 'reminder': return 'bg-orange-50/50';
        default: return 'bg-slate-50';
    }
  };

  if (loading) {
    return (
      <PortalLayout type="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </PortalLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <PortalLayout type="teacher">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="teacher-container p-6 max-w-5xl mx-auto"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
                <p className="text-muted-foreground">Stay updated on student submissions, system alerts, and messages.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="gap-2 h-10 border-slate-200">
                    <Check size={16} /> Mark all read
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
                    <Settings size={18} />
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 border-r border-slate-100 pr-4">
                <nav className="space-y-1">
                    <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700">
                        <span>All Alerts</span>
                        {unreadCount > 0 && <Badge className="bg-indigo-600 border-none">{unreadCount}</Badge>}
                    </button>
                    <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <span>Submissions</span>
                        <span className="text-xs text-slate-400">12</span>
                    </button>
                    <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <span>System Updates</span>
                        <span className="text-xs text-slate-400">2</span>
                    </button>
                    <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <span>Direct Messages</span>
                    </button>
                </nav>
            </div>

            <div className="lg:col-span-3 space-y-4">
               {notifications.length === 0 ? (
                   <Card className="border-dashed bg-slate-50/50 shadow-none border-2 p-12 text-center text-slate-500">
                       <Bell size={48} className="mx-auto mb-4 opacity-20" />
                       <h3 className="text-lg font-bold text-slate-700 mb-1">You're all caught up!</h3>
                       <p className="text-sm">No new notifications to display right now.</p>
                   </Card>
               ) : (
                   <AnimatePresence mode="popLayout">
                       {notifications.map((notif, i) => (
                           <motion.div
                               key={notif.id || i}
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, x: -20 }}
                               transition={{ duration: 0.2 }}
                           >
                               <Card className={`overflow-hidden transition-all ${notif.is_read ? 'opacity-70 shadow-none border-transparent bg-slate-50/50' : `shadow-sm border-l-4 ${notif.type === 'submission' ? 'border-l-blue-500' : notif.type === 'system' ? 'border-l-purple-500' : 'border-l-slate-400'} ${getBgColor(notif.type, notif.is_read)}`}`}>
                                   <CardContent className="p-0">
                                       <div className="flex items-start gap-4 p-5">
                                           <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${notif.is_read ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                                                {getIcon(notif.type)}
                                           </div>
                                           <div className="flex-1 min-w-0">
                                               <div className="flex items-start justify-between gap-4 mb-1">
                                                   <h4 className={`font-semibold text-sm ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                                                   <span className="text-xs font-medium text-slate-400 flex items-center gap-1 shrink-0">
                                                       <Clock size={12} /> {new Date(notif.created_at).toLocaleDateString()}
                                                   </span>
                                               </div>
                                               <p className={`text-sm mb-3 ${notif.is_read ? 'text-slate-500' : 'text-slate-600'}`}>{notif.message}</p>
                                               
                                               {!notif.is_read && (
                                                   <div className="flex gap-2">
                                                       <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => markAsRead(notif.id)}>Mark Read</Button>
                                                       {notif.type === 'submission' && (
                                                           <Button size="sm" className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700">View Submission</Button>
                                                       )}
                                                   </div>
                                               )}
                                           </div>
                                           {notif.is_read && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                                    <Trash2 size={16} />
                                                </Button>
                                           )}
                                       </div>
                                   </CardContent>
                               </Card>
                           </motion.div>
                       ))}
                   </AnimatePresence>
               )}
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};
import { toast } from "sonner";

export default TeacherNotifications;

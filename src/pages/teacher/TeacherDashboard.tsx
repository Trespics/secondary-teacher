import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  BookMarked,
  Bell,
  Loader2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ classesAssigned: 0, totalStudents: 0, pendingGrading: 0, classes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/teacher/dashboard/stats");
        setStats(data);
      } catch (err) {
        console.error("Fetch teacher stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const topStats = [
    { title: "Classes Assigned", value: stats.classesAssigned, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Students", value: stats.totalStudents, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Pending Grading", value: stats.pendingGrading, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Overall Performance", value: "85%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" }
  ];

  if (loading) {
    return (
      <PortalLayout type="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout type="teacher">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="teacher-container p-6"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Mwalimu {user?.name?.split(' ')[0]}</h1>
                <p className="text-muted-foreground">Here is an overview of your classes and tasks for today.</p>
            </div>
            <div className="flex gap-2">
                <Link to="/teacher/create-assignment">
                    <Button variant="outline" className="gap-2"><BookMarked size={16}/> New Assignment</Button>
                </Link>
                <Link to="/teacher/upload-materials">
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"><ArrowRight size={16}/> Upload Material</Button>
                </Link>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {topStats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="border-none shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-2xl font-bold">{stat.value}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4 font-medium">{stat.title}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-8">
                {/* My Classes */}
                <Card className="shadow-sm border-indigo-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-dashed border-indigo-100 mb-4">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <BookOpen className="text-indigo-500" size={20} /> My Classes
                            </CardTitle>
                            <CardDescription>Courses and subjects you are currently teaching</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600">
                            <Link to="/teacher/students">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.classes.length === 0 ? (
                           <div className="text-sm text-muted-foreground py-4 text-center">No classes assigned yet.</div> 
                        ) : (
                          stats.classes.slice(0, 3).map((cls: any, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border hover:border-indigo-200 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                        {cls.classes?.name?.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{cls.classes?.name} - {cls.subjects?.name}</h3>
                                        <p className="text-sm text-muted-foreground">Class Representative: TBD</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-white border text-xs">Mon, Wed, Fri</Badge>
                                    <Badge variant="secondary" className="bg-white border text-xs">80 Students</Badge>
                                </div>
                            </div>
                          ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                {/* Quick Actions */}
                <Card className="shadow-sm bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Award size={20} /> Quick Links
                        </CardTitle>
                        <CardDescription className="text-indigo-100">Frequently used teacher tools</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Link to="/teacher/create-cat" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-center gap-2 group">
                            <Calendar size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Schedule CAT</span>
                        </Link>
                        <Link to="/teacher/grading" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-center gap-2 group">
                            <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Grade Work</span>
                        </Link>
                        <Link to="/teacher/performance" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-center gap-2 group col-span-2">
                            <TrendingUp size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold">Performance Reports</span>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default TeacherDashboard;

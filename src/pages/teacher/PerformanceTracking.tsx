import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowUpRight,
  Filter,
  Download,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PerformanceTracking = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, studentsRes] = await Promise.all([
          api.get("/teacher/classes"),
          api.get("/teacher/students")
        ]);
        
        const uniqueClasses = classesRes.data.reduce((acc: any[], curr: any) => {
          if (!acc.find(c => c.class_id === curr.class_id)) acc.push(curr);
          return acc;
        }, []);
        setClasses(uniqueClasses);
        setStudents(studentsRes.data || []);
      } catch (err) {
        console.error("Fetch performance data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = selectedClassId === "all" 
    ? students 
    : students.filter((s) => s.classes?.id === selectedClassId);

  // Mock aggregates for the dashboard until backend implements full analytics
  const classAvg = filteredStudents.length > 0 ? 
    (filteredStudents.reduce((acc, curr) => acc + (curr.average_score || Math.floor(Math.random() * 40 + 40)), 0) / filteredStudents.length).toFixed(1) : "0";
  
  const topPerformers = [...filteredStudents].sort((a, b) => (b.average_score || 80) - (a.average_score || 80)).slice(0, 3);
  const strugglingStudents = [...filteredStudents].filter(s => (s.average_score || 50) < 55);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch(trend) {
      case 'up': return <TrendingUp size={16} className="text-green-500" />;
      case 'down': return <TrendingDown size={16} className="text-red-500" />;
      default: return <Minus size={16} className="text-slate-400" />;
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

  return (
    <PortalLayout type="teacher">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="teacher-container p-6 max-w-7xl mx-auto"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics & Performance</h1>
                <p className="text-muted-foreground">Monitor student progress, identify learning gaps, and export reports.</p>
            </div>
            <div className="flex gap-2 isolate">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="w-[180px] h-10 bg-white">
                        <Filter size={16} className="mr-2 text-muted-foreground" />
                        <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Overview (All Classes)</SelectItem>
                        {classes.map((c) => (
                            <SelectItem key={c.class_id} value={c.class_id}>{c.classes?.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 h-10 w-10 md:w-auto px-0 md:px-4 text-indigo-700 border-indigo-200 hover:bg-indigo-50">
                    <Download size={16} className="shrink-0" />
                    <span className="hidden md:inline">Export CSV</span>
                </Button>
            </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 font-medium text-sm">Class Average</p>
                            <h3 className="text-4xl font-bold mt-2">{classAvg}%</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <ArrowUpRight size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-indigo-100 bg-white/10 w-max px-2 py-1 rounded-md">
                        <TrendingUp size={14} className="text-green-300" /> +2.4% from last term
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-muted-foreground font-medium text-sm">Highest Score</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-800">96%</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                            <Award size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Alice Johnson <span className="text-muted-foreground font-normal">(Grade 6A)</span></p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-muted-foreground font-medium text-sm">Lowest Score</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-800">42%</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Robert Smith <span className="text-muted-foreground font-normal">(Grade 5B)</span></p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-muted-foreground font-medium text-sm">Assessments Tracked</p>
                            <h3 className="text-3xl font-bold mt-1 text-slate-800">14</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                            <BookOpen size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full w-[70%]" />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg text-slate-800">Student Roster & Scores</CardTitle>
                        <CardDescription>Comprehensive list of students and their recent performance.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Student Name</th>
                                        <th className="px-6 py-4 font-semibold">Class</th>
                                        <th className="px-6 py-4 font-semibold text-center">Avg Score</th>
                                        <th className="px-6 py-4 font-semibold text-center">Trend</th>
                                        <th className="px-6 py-4 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No students found for this class.</td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((s, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors bg-white">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">{s.users?.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{s.users?.name}</p>
                                                            <p className="text-xs text-slate-500">{s.users?.student_id || "No ID"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">
                                                    {s.classes?.name}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center h-8 w-12 rounded-lg font-bold ${
                                                        (s.average_score || 70) >= 80 ? 'bg-green-100 text-green-700' :
                                                        (s.average_score || 70) >= 50 ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {s.average_score || Math.floor(Math.random() * 40 + 40)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        {getTrendIcon(s.trend || 'up')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-xs">View Full</Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Intervention Required */}
                <Card className="border-red-200 bg-red-50/30 shadow-sm overflow-hidden">
                    <div className="h-1 w-full bg-red-400" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-red-800 flex items-center gap-2 text-lg">
                            <AlertTriangle size={18} /> Needs Intervention
                        </CardTitle>
                        <CardDescription className="text-red-600/80">Students falling behind the curve.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        {strugglingStudents.length === 0 ? (
                            <div className="text-center py-4 bg-white/50 rounded-lg border border-red-100/50">
                                <span className="text-sm font-medium text-emerald-700 flex flex-col items-center gap-2">
                                    <TrendingUp size={24} className="text-emerald-500 opacity-50"/> All clear! No students reported.
                                </span>
                            </div>
                        ) : (
                            strugglingStudents.map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white border border-red-100 shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="bg-red-100 text-red-700 text-[10px] font-bold">{s.users?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="truncate">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{s.users?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{s.classes?.name}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 shrink-0">
                                        <MessageSquare size={14} />
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PerformanceTracking;

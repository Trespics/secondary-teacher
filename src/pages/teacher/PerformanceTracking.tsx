import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award,
  BookOpen,
  ArrowUpRight,
  Filter,
  Download,
  Loader2,
  Users,
  GraduationCap,
  BarChart2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PerformanceTracking = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [data, setData] = useState<any>({ students: [], subjects: [], classes: [] });
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await api.get("/teacher/performance");
        setData(response.data);
      } catch (err) {
        console.error("Fetch performance error:", err);
        toast.error("Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const getCBCLevel = (score: string | number | null) => {
    if (score === null || score === undefined) return { level: "-", color: "bg-gray-100 text-gray-400" };
    const s = typeof score === 'string' ? parseFloat(score) : score;
    if (s >= 80) return { level: "EE", color: "bg-green-100 text-green-700" };
    if (s >= 60) return { level: "ME", color: "bg-blue-100 text-blue-700" };
    if (s >= 40) return { level: "AE", color: "bg-yellow-100 text-yellow-700" };
    return { level: "BE", color: "bg-red-100 text-red-700" };
  };

  const filteredStudents = selectedClassId === "all" 
    ? data.students 
    : data.students.filter((s: any) => s.class_name === data.classes.find((c: any) => c.class_id === selectedClassId)?.class_name);

  const filteredSubjects = selectedClassId === "all"
    ? data.subjects
    : data.subjects.filter((s: any) => s.class_name === data.classes.find((c: any) => c.class_id === selectedClassId)?.class_name);

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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Academic Performance</h1>
            <p className="text-muted-foreground">Monitor and analyze performance across students, subjects, and classes.</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[200px] h-10 bg-white shadow-sm border-indigo-100">
                <Filter size={16} className="mr-2 text-indigo-500" />
                <SelectValue placeholder="All My Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Overview (All My Classes)</SelectItem>
                {data.classes.map((c: any) => (
                  <SelectItem key={c.class_id} value={c.class_id}>{c.class_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 h-10 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm" onClick={() => window.print()}>
              <Download size={16} />
              <span className="hidden md:inline">Print Report</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 border shadow-sm h-12 w-full md:w-auto overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="students" className="px-6 h-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users size={16} className="mr-2" /> Student Grades
            </TabsTrigger>
            <TabsTrigger value="subjects" className="px-6 h-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BookOpen size={16} className="mr-2" /> Subject Performance
            </TabsTrigger>
            <TabsTrigger value="classes" className="px-6 h-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BarChart2 size={16} className="mr-2" /> Class Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-indigo-50/30 border-b">
                <CardTitle className="text-lg">Students Performance List</CardTitle>
                <CardDescription>View grades for all students across CAT 1, CAT 2, and End Term.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4 text-center">CAT 1 (%)</th>
                        <th className="px-6 py-4 text-center">CAT 2 (%)</th>
                        <th className="px-6 py-4 text-center">End Term (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No student data available.</td></tr>
                      ) : (
                        filteredStudents.map((s: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{s.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-slate-900">{s.name}</p>
                                  <p className="text-xs text-slate-500">{s.admission_no}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{s.class_name}</td>
                            <td className="px-6 py-4 text-center text-slate-600">{s.grades['CAT 1'] || "-"}</td>
                            <td className="px-6 py-4 text-center text-slate-600">{s.grades['CAT 2'] || "-"}</td>
                            <td className="px-6 py-4 text-center font-bold text-slate-900">{s.grades['End Term'] || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-white rounded-xl border border-dashed">
                <p>No subject performance data available for the selected filter.</p>
              </div>
            ) : (
              filteredSubjects.map((sub: any, i: number) => (
                <Card key={i} className="hover:shadow-md transition-all border-none shadow-sm overflow-hidden group">
                  <div className="h-1.5 w-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">{sub.subject_name}</CardTitle>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                        {sub.class_name}
                      </Badge>
                    </div>
                    <CardDescription>Academic performance breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 py-4 border-y border-indigo-50">
                      {['CAT 1', 'CAT 2', 'End Term'].map(type => {
                        const perf = sub.performance[type];
                        const level = getCBCLevel(perf?.average);
                        return (
                          <div key={type} className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{type}</p>
                            <p className="text-lg font-bold text-slate-900">{perf?.average || "-"}</p>
                            <Badge className={`mt-1 text-[10px] px-1.5 py-0 ${level.color}`}>{level.level}</Badge>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        Overall Avg: <span className="text-indigo-600 font-bold">{sub.performance['End Term']?.average || "N/A"}%</span>
                      </p>
                      {sub.performance['End Term']?.average && parseFloat(sub.performance['End Term'].average) >= 60 ? (
                        <TrendingUp size={18} className="text-green-500" />
                      ) : (
                        <TrendingDown size={18} className="text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.classes.map((cls: any, i: number) => {
                const endTermPerf = cls.performance['End Term'];
                const level = getCBCLevel(endTermPerf?.average);
                
                return (
                  <Card key={i} className="border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {cls.class_name?.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{cls.class_name}</CardTitle>
                            <CardDescription>Overall Class Analytics</CardDescription>
                          </div>
                        </div>
                        <Badge className={`${level.color} px-3 py-1 text-sm font-bold shadow-sm`}>{level.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600 uppercase tracking-tighter">Current Mean Score</span>
                            <span className="text-lg font-bold text-indigo-700">{endTermPerf?.average || "0"}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${endTermPerf?.average || 0}%` }}
                              className="bg-indigo-600 h-full rounded-full" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">CAT 1 Mean</p>
                            <p className="text-xl font-bold text-slate-800">{cls.performance['CAT 1']?.average || "-"}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">CAT 2 Mean</p>
                            <p className="text-xl font-bold text-slate-800">{cls.performance['CAT 2']?.average || "-"}</p>
                          </div>
                        </div>

                        <Button className="w-full gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 border shadow-none font-bold py-5">
                          Detailed Class Report <ArrowUpRight size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </PortalLayout>
  );
};

export default PerformanceTracking;

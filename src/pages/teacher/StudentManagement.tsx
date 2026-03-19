import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail,
  MoreVertical,
  BookOpen,
  Filter,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StudentManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, classesRes] = await Promise.all([
          api.get("/teacher/students"),
          api.get("/teacher/classes")
        ]);
        
        const uniqueClasses = classesRes.data.reduce((acc: any[], curr: any) => {
          if (!acc.find(c => c.class_id === curr.class_id)) acc.push(curr);
          return acc;
        }, []);

        setStudents(studentsRes.data || []);
        setClasses(uniqueClasses);
      } catch (err) {
        console.error("Fetch students error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch = s.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.users?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || s.classes?.id === filterClass;
    return matchesSearch && matchesClass;
  });

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
                <h1 className="text-3xl font-bold tracking-tight mb-2">My Students</h1>
                <p className="text-muted-foreground">Directory of all students enrolled in your assigned classes.</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl flex items-center justify-center gap-3 shadow-sm font-semibold max-w-max">
                <Users size={20} />
                <span className="text-lg">{filtered.length} Students</span>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                    placeholder="Search by name or admission number..." 
                    className="pl-10 h-11 bg-slate-50 border-transparent focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-100 transition-all text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-[200px] h-11 font-medium bg-slate-50 border-transparent">
                    <Filter size={16} className="mr-2 text-slate-500" />
                    <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((c) => (
                        <SelectItem key={c.class_id} value={c.class_id}>{c.classes?.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <Users size={48} className="text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-1">No students found</h3>
                <p className="text-slate-500">Try adjusting your search terms or filters.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="hover:shadow-md transition-all hover:border-indigo-200 bg-white border h-full flex flex-col group overflow-hidden">
                            <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-600 w-full absolute top-0 left-0 rounded-t-xl opacity-20 transition-opacity group-hover:opacity-40" />
                            <CardContent className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MessageSquare size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-full">
                                        <MoreVertical size={16} />
                                    </Button>
                                </div>

                                <Avatar className="h-24 w-24 border-4 border-white shadow-sm mb-4 bg-white mt-2">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold text-2xl">
                                        {s.users?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{s.users?.name}</h3>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Admn: {s.users?.student_id || "PENDING"}</p>

                                <div className="w-full space-y-3 mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <BookOpen size={16} className="text-slate-400 shrink-0" />
                                        <span className="font-medium truncate">{s.classes?.name}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 gap-3">
                                        <Mail size={16} className="text-slate-400 shrink-0" />
                                        <span className="truncate" title={s.users?.email}>{s.users?.email}</span>
                                    </div>
                                    {s.users?.parent_phone && (
                                        <div className="flex items-center text-sm text-slate-600 gap-3">
                                            <Phone size={16} className="text-slate-400 shrink-0" />
                                            <span>{s.users.parent_phone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <div className="bg-slate-50 p-3 border-t text-center text-xs text-slate-500 font-medium hover:bg-slate-100 transition-colors cursor-pointer group-hover:text-indigo-600">
                                View Academic Profile →
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        )}
      </motion.div>
    </PortalLayout>
  );
};
import { MessageSquare } from "lucide-react";

export default StudentManagement;

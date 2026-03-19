import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Map, 
  FileText, 
  CheckCircle2, 
  Target,
  LifeBuoy,
  PlusCircle,
  Loader2,
  ChevronRight,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CBCLessons = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("lessons");
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [newLesson, setNewLesson] = useState({
    class_id: "",
    subject_id: "",
    title: "",
    lesson_date: new Date().toISOString().split('T')[0],
    strand_id: null,
    sub_strand_id: null,
    learning_outcome_id: null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, classesRes] = await Promise.all([
        api.get("/cbc/lessons"),
        api.get("/teacher/classes")
      ]);
      setLessons(lessonsRes.data || []);
      setClasses(classesRes.data || []);
      
      const uniqueSubjects = classesRes.data.reduce((acc: any[], curr: any) => {
        if (!acc.find(s => s.subject_id === curr.subject_id)) acc.push(curr.subjects);
        return acc;
      }, []);
      setSubjects(uniqueSubjects);
    } catch (err) {
      toast.error("Failed to load CBC data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlanLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.title || !newLesson.class_id || !newLesson.subject_id) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      await api.post("/cbc/lessons", newLesson);
      toast.success("Lesson planned successfully");
      setIsPlanning(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to plan lesson");
    }
  };

  return (
    <PortalLayout type="teacher">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CBC Learning Module</h1>
            <p className="text-muted-foreground">Manage strands, sub-strands, and competency-based lessons.</p>
          </div>
          <Button 
            onClick={() => setIsPlanning(true)}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm font-semibold h-11 px-6 rounded-xl"
          >
            <PlusCircle size={20} /> Plan New Lesson
          </Button>
        </div>

        {isPlanning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-indigo-100 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Plan CBC Lesson</CardTitle>
                  <CardDescription>Link your lesson to curriculum strands and learning outcomes.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsPlanning(false)} className="rounded-full"><X size={20} /></Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlanLesson} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Lesson Title <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g. Introduction to Local Environment" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} className="h-11 bg-slate-50"/>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Class <span className="text-red-500">*</span></Label>
                    <Select value={newLesson.class_id} onValueChange={val => setNewLesson({...newLesson, class_id: val})}>
                      <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.class_id} value={c.class_id}>{c.classes.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Subject <span className="text-red-500">*</span></Label>
                    <Select value={newLesson.subject_id} onValueChange={val => setNewLesson({...newLesson, subject_id: val})}>
                      <SelectTrigger className="h-11 bg-slate-50"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Lesson Date</Label>
                    <Input type="date" value={newLesson.lesson_date} onChange={e => setNewLesson({...newLesson, lesson_date: e.target.value})} className="h-11 bg-slate-50"/>
                  </div>
                  <div className="lg:col-span-2 flex items-end">
                    <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md gap-2 rounded-xl">
                      <Target size={18} /> Plan This Lesson
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="lessons" className="gap-2">
              <BookOpen size={16} /> Lessons
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="gap-2">
              <Map size={16} /> Curriculum Map
            </TabsTrigger>
            <TabsTrigger value="assessments" className="gap-2">
              <CheckCircle2 size={16} /> Assessments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="md:col-span-1 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => (
                          <SelectItem key={c.class_id} value={c.class_id}>{c.classes.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                         {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-3 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600" />
                  </div>
                ) : lessons.length === 0 ? (
                  <Card className="border-dashed py-20 text-center">
                    <Map size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold">No Lessons Planned</h3>
                    <p className="text-muted-foreground text-sm">Start by creating a lesson plan linked to CBC strands.</p>
                    <Button variant="outline" className="mt-4 border-indigo-200 text-indigo-600">Plan a Lesson</Button>
                  </Card>
                ) : (
                  lessons.map(lesson => (
                    <Card key={lesson.id} className="overflow-hidden hover:border-indigo-200 transition-colors cursor-pointer">
                      <CardContent className="p-0 flex">
                        <div className="w-2 bg-indigo-500" />
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-[10px]">{lesson.strands?.name}</Badge>
                                <span className="text-xs text-muted-foreground">{new Date(lesson.lesson_date).toLocaleDateString()}</span>
                              </div>
                              <h3 className="font-bold text-lg">{lesson.title}</h3>
                            </div>
                            <Button variant="ghost" size="icon"><ChevronRight size={18} /></Button>
                          </div>
                          <div className="flex gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Target size={14} className="text-indigo-400" />
                              <span>Outcome: {lesson.learning_outcome_id ? "Linked" : "Not Linked"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <LifeBuoy size={14} className="text-indigo-400" />
                              <span>Activities: {lesson.lesson_activities?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="curriculum">
             <Card>
               <CardHeader>
                 <CardTitle>Curriculum Framework</CardTitle>
                 <CardDescription>Browse the CBC hierarchy for your subjects.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    Select a subject to view its strands and learning outcomes.
                  </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="assessments">
             <Card>
               <CardHeader>
                 <CardTitle>Competency Tracking</CardTitle>
                 <CardDescription>Monitor student progress against learning outcomes.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    Formative assessment tools will appear here once lessons are delivered.
                  </div>
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default CBCLessons;

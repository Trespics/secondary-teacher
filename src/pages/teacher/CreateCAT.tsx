import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Settings, 
  AlertCircle,
  Save,
  Timer,
  BookOpen,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";

const CreateCAT = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    class_id: "",
    lesson_id: "",
    date: new Date(),
    startTime: "08:00",
    duration: "60", // minutes
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/teacher/classes");
        const uniqueClasses = data.reduce((acc: any[], curr: any) => {
          if (!acc.find(c => c.class_id === curr.class_id)) acc.push(curr);
          return acc;
        }, []);
        setClasses(uniqueClasses);
      } catch (err) {
        console.error("Fetch classes error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!form.class_id) {
        setLessons([]);
        return;
      }
      try {
        const selectedClass = classes.find(c => c.class_id === form.class_id);
        const { data } = await api.get(`/cbc/lessons`, { 
          params: { class_id: form.class_id, subject_id: selectedClass?.subject_id } 
        });
        setLessons(data || []);
      } catch (err) {
        console.error("Fetch lessons error:", err);
      }
    };
    fetchLessons();
  }, [form.class_id, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.class_id || !form.date || !form.startTime || !form.duration) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedClass = classes.find(c => c.class_id === form.class_id);
      
      // Construct start_time and end_time timestamps
      const [hours, minutes] = form.startTime.split(':');
      const startDateTime = new Date(form.date);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endDateTime = new Date(startDateTime.getTime() + parseInt(form.duration) * 60000);

      await api.post("/teacher/cats", {
        title: form.title,
        class_id: form.class_id,
        subject_id: selectedClass?.subject_id,
        time_limit_minutes: parseInt(form.duration),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      
      toast.success("CAT scheduled successfully!");
      setForm({ ...form, title: "", duration: "60" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to schedule CAT");
    } finally {
      setSubmitting(false);
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
        className="teacher-container p-6 max-w-5xl mx-auto"
      >
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Schedule CAT</h1>
                <p className="text-muted-foreground">Configure Continuous Assessment Tests for your classes.</p>
            </div>
            <div className="hidden md:flex h-16 w-16 bg-purple-50 rounded-2xl items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                <Timer size={32} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="shadow-sm border-none bg-card">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                                <Settings size={20} className="text-purple-600"/> Exam Configuration
                            </CardTitle>
                            <CardDescription>Set up the rules, timing, and target audience for this test.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-bold text-slate-700">Exam Title <span className="text-red-500">*</span></Label>
                                    <Input id="title" placeholder="e.g. Mid-Term Math CAT" className="h-11 bg-slate-50 border-slate-200" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="class" className="text-sm font-bold text-slate-700">Select Class <span className="text-red-500">*</span></Label>
                                    <Select value={form.class_id} onValueChange={(val) => setForm({...form, class_id: val})}>
                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Target Audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.length === 0 ? (
                                                <SelectItem value="none" disabled>No classes assigned</SelectItem>
                                            ) : (
                                                classes.map((c) => (
                                                    <SelectItem key={c.class_id} value={c.class_id}>{c.classes?.name} - {c.subjects?.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="lesson" className="text-sm font-bold text-slate-700">Link to CBC Lesson (Optional)</Label>
                                    <Select value={form.lesson_id} onValueChange={(val) => setForm({...form, lesson_id: val})}>
                                        <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Select a lesson" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lessons.length === 0 ? (
                                                <SelectItem value="none" disabled>No lessons found</SelectItem>
                                            ) : (
                                                lessons.map((l) => (
                                                    <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Date <span className="text-red-500">*</span></Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={`w-full h-11 justify-start text-left font-normal bg-slate-50 border-slate-200 ${!form.date && "text-muted-foreground"}`}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.date ? format(form.date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={form.date} onSelect={(d) => d && setForm({...form, date: d})} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Start Time <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input type="time" className="pl-10 h-11 bg-slate-50 border-slate-200" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Duration (Minutes) <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Timer size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input type="number" min="15" max="180" className="pl-10 h-11 bg-slate-50 border-slate-200" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
                            <Button type="submit" disabled={submitting} className="px-8 h-11 bg-purple-600 hover:bg-purple-700 gap-2 shadow-sm font-semibold text-white">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {submitting ? "Scheduling..." : "Schedule CAT"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-purple-50 border-none shadow-sm pb-4">
                    <CardHeader>
                        <CardTitle className="text-purple-900 flex items-center gap-2 text-lg"><AlertCircle size={18}/> Proctoring Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-purple-800">
                        <p>When students take this CAT, the portal will enforce strict rules to ensure academic integrity:</p>
                        <ul className="space-y-3 pl-2">
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500"/> Countdown timer visible at all times</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500"/> Auto-submit when time expires</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500"/> Warning recorded if user switches tabs</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500"/> One attempt permitted per student</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default CreateCAT;

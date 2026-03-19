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
  CheckCircle2,
  PlusCircle,
  Plus,
  Trash2,
  HelpCircle,
  AlignLeft,
  List,
  Loader2
} from "lucide-react";
import { Badge as UIBadge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    class_id: null as string | null,
    subject_id: null as string | null,
    lesson_id: null as string | null,
    date: new Date(),
    startTime: "08:00",
    duration: "60", // minutes
    is_mcq: false,
    questions: [
      { question: "", options: ["", "", "", ""], correct_answer: 0 }
    ],
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/teacher/classes");
        setClasses(data || []);
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
      if (!form.class_id || !form.subject_id) {
        setLessons([]);
        return;
      }
      try {
        const { data } = await api.get(`/cbc/lessons`, { 
          params: { class_id: form.class_id, subject_id: form.subject_id } 
        });
        setLessons(data || []);
      } catch (err) {
        console.error("Fetch lessons error:", err);
      }
    };
    fetchLessons();
  }, [form.class_id, form.subject_id]);

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", "", "", ""], correct_answer: 0 }]
    }));
  };

  const removeQuestion = (index: number) => {
    if (form.questions.length <= 1) return;
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...form.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setForm(prev => ({ ...prev, questions: newQuestions }));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...form.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setForm(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.title) newErrors.title = "Title is required";
    if (!form.class_id) newErrors.class_id = "Please select a class and subject";
    if (!form.date) newErrors.date = "Test date is required";
    if (!form.startTime) newErrors.startTime = "Start time is required";
    if (!form.duration) newErrors.duration = "Duration is required";

    if (form.is_mcq) {
      if (!form.questions || form.questions.length === 0) {
        newErrors.questions = "At least one question is required for MCQ";
      } else {
        const invalid = form.questions.some(q => !q.question || q.options.some(o => !o));
        if (invalid) newErrors.questions = "Please fill in all questions and options";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the errors before scheduling.");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      // Construct start_time and end_time timestamps
      const [hours, minutes] = form.startTime.split(':');
      const startDateTime = new Date(form.date);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endDateTime = new Date(startDateTime.getTime() + parseInt(form.duration) * 60000);

      const payload = {
        title: form.title,
        class_id: form.class_id,
        subject_id: form.subject_id,
        lesson_id: form.lesson_id || null,
        is_mcq: form.is_mcq,
        questions: form.is_mcq ? form.questions : [],
        time_limit_minutes: parseInt(form.duration),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      };

      await api.post("/teacher/cats", payload);
      
      toast.success("CAT scheduled successfully!");
      setForm({ 
        ...form, 
        title: "", 
        duration: "60",
        is_mcq: false,
        questions: [{ question: "", options: ["", "", "", ""], correct_answer: 0 }]
      });
    } catch (err: any) {
      const backendError = err.response?.data?.error || "Failed to schedule CAT";
      toast.error(backendError);
      setErrors({ backend: backendError });
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

        {errors.backend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3"
          >
            <div className="h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">!</div>
            <div>
              <p className="font-bold text-sm">Action Failed</p>
              <p className="text-sm opacity-90">{errors.backend}</p>
            </div>
          </motion.div>
        )}

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
                                    <Input id="title" placeholder="e.g. Mid-Term Math CAT" className={`h-11 bg-slate-50 border-slate-200 ${errors.title ? "border-red-500" : ""}`} value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                                    {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="class" className="text-sm font-bold text-slate-700">Select Class & Subject <span className="text-red-500">*</span></Label>
                                    <Select 
                                        value={classes.find(c => c.class_id === form.class_id && c.subject_id === form.subject_id)?.id || ""} 
                                        onValueChange={(val) => {
                                            const selected = classes.find(c => c.id === val);
                                            if (selected) {
                                                setForm({
                                                    ...form, 
                                                    class_id: selected.class_id, 
                                                    subject_id: selected.subject_id,
                                                    lesson_id: null
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className={`h-11 bg-slate-50 border-slate-200 ${errors.class_id ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Target Audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.length === 0 ? (
                                                <SelectItem value="none" disabled>No classes assigned</SelectItem>
                                            ) : (
                                                classes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.classes?.name} - {c.subjects?.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.class_id && <p className="text-xs text-red-500 font-medium">{errors.class_id}</p>}
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="lesson" className="text-sm font-bold text-slate-700">Link to CBC Lesson (Optional)</Label>
                                    <Select value={form.lesson_id || ""} onValueChange={(val) => setForm({...form, lesson_id: val})}>
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

                                <div className="space-y-4">
                                    <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-semibold text-slate-700">Multiple Choice (MCQ)</Label>
                                            <p className="text-xs text-muted-foreground">Enable auto-grading for this CAT</p>
                                        </div>
                                        <Switch checked={form.is_mcq} onCheckedChange={(c) => setForm({...form, is_mcq: c})} />
                                    </div>
                                </div>
                            </div>

                            {/* MCQ Builder */}
                            {form.is_mcq && (
                              <div className="space-y-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between gap-2 pb-2 text-indigo-900 border-b">
                                    <div className="flex items-center gap-2">
                                      <List size={18} /> <h3 className="font-semibold text-lg text-purple-900">Question Builder</h3>
                                    </div>
                                    {errors.questions && <p className="text-xs text-red-500 font-bold">{errors.questions}</p>}
                                    <Button type="button" onClick={addQuestion} variant="outline" size="sm" className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50">
                                      <PlusCircle size={16} /> Add Question
                                    </Button>
                                </div>

                                <div className="space-y-8">
                                  {form.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm relative group">
                                      <div className="absolute -left-3 top-6 h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                        {qIndex + 1}
                                      </div>
                                      
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => removeQuestion(qIndex)}
                                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                                      >
                                        <Trash2 size={16} />
                                      </Button>

                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label className="text-sm font-bold text-slate-700 ml-6">Question Text</Label>
                                          <Input 
                                            placeholder="Enter your question here..." 
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                                            className="ml-6 w-[calc(100%-24px)] border-slate-200 focus:border-purple-500"
                                          />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                          {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-3">
                                              <div 
                                                onClick={() => updateQuestion(qIndex, "correct_answer", oIndex)}
                                                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                                  q.correct_answer === oIndex 
                                                  ? "bg-green-500 border-green-500 text-white" 
                                                  : "border-slate-300 hover:border-purple-500"
                                                }`}
                                              >
                                                {String.fromCharCode(65 + oIndex)}
                                              </div>
                                              <Input 
                                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                value={opt}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                className={`border-slate-200 focus:border-purple-400 ${q.correct_answer === oIndex ? "bg-green-50/30 border-green-200" : ""}`}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="ml-6 pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                          <HelpCircle size={14} className="text-purple-400" />
                                          <span>Click the letter (A, B, C, D) to mark it as the correct answer.</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex justify-center pt-4">
                                  <Button type="button" onClick={addQuestion} variant="ghost" className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full py-6 border-2 border-dashed border-purple-100 rounded-2xl">
                                    <PlusCircle size={20} /> Add Another Question
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Date <span className="text-red-500">*</span></Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={`w-full h-11 justify-start text-left font-normal bg-slate-50 ${errors.date ? "border-red-500" : "border-slate-200"} ${!form.date && "text-muted-foreground"}`}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.date ? format(form.date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={form.date} onSelect={(d) => d && setForm({...form, date: d})} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Start Time <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input type="time" className={`pl-10 h-11 bg-slate-50 ${errors.startTime ? "border-red-500" : "border-slate-200"}`} value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} />
                                    </div>
                                    {errors.startTime && <p className="text-xs text-red-500 font-medium">{errors.startTime}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Duration (Minutes) <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Timer size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input type="number" min="15" max="180" className={`pl-10 h-11 bg-slate-50 ${errors.duration ? "border-red-500" : "border-slate-200"}`} value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} />
                                    </div>
                                    {errors.duration && <p className="text-xs text-red-500 font-medium">{errors.duration}</p>}
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

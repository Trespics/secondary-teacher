import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  FileEdit, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  FileText,
  Upload,
  AlignLeft,
  List,
  Save,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { toast } from "sonner";

const CreateAssignment = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    class_id: "",
    subject_id: "",
    strand_id: "",
    sub_strand_id: "",
    learning_outcome_id: "",
    instructions: "",
    due_date: new Date(),
    is_mcq: false,
    file_url: "", // Optional
  });

  const location = useLocation();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/teacher/classes");
        // Deduplicate classes for select dropdown
        const uniqueClasses = data.reduce((acc: any[], curr: any) => {
          if (!acc.find(c => c.class_id === curr.class_id)) acc.push(curr);
          return acc;
        }, []);
        setClasses(uniqueClasses);
        
        if (location.state) {
          setForm(prev => ({
            ...prev,
            class_id: location.state.classId || prev.class_id,
            subject_id: location.state.subjectId || prev.subject_id,
            strand_id: location.state.strandId || prev.strand_id,
            sub_strand_id: location.state.subStrandId || prev.sub_strand_id
          }));
          toast.info("CBC context auto-selected from subjects view.");
        }
      } catch (err) {
        console.error("Fetch classes error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [location.state]);

  const [strands, setStrands] = useState<any[]>([]);
  const [subStrands, setSubStrands] = useState<any[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<any[]>([]);

  useEffect(() => {
    const fetchStrands = async () => {
      if (!form.subject_id) return;
      try {
        const { data } = await api.get("/cbc/strands", { params: { subject_id: form.subject_id } });
        setStrands(data || []);
      } catch (err) { console.error(err); }
    };
    fetchStrands();
  }, [form.subject_id]);

  useEffect(() => {
    const fetchSubStrands = async () => {
      if (!form.strand_id) return;
      try {
        const { data } = await api.get("/cbc/sub-strands", { params: { strand_id: form.strand_id } });
        setSubStrands(data || []);
      } catch (err) { console.error(err); }
    };
    fetchSubStrands();
  }, [form.strand_id]);

  useEffect(() => {
    const fetchLOs = async () => {
      if (!form.sub_strand_id) return;
      try {
        const { data } = await api.get("/cbc/learning-outcomes", { params: { sub_strand_id: form.sub_strand_id } });
        setLearningOutcomes(data || []);
      } catch (err) { console.error(err); }
    };
    fetchLOs();
  }, [form.sub_strand_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.class_id || !form.instructions || !form.due_date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/teacher/assignments", {
        ...form,
        due_date: form.due_date.toISOString(),
      });
      
      toast.success("Assignment created successfully!");
      setForm({
        ...form,
        title: "",
        instructions: "",
        is_mcq: false,
        file_url: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create assignment");
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
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create Assignment</h1>
                <p className="text-muted-foreground">Design and distribute homework, projects, or quizzes to your classes.</p>
            </div>
            <div className="hidden md:flex h-16 w-16 bg-indigo-50 rounded-2xl items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <FileEdit size={32} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="shadow-sm border-none bg-card">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-8 space-y-8">
                            {/* Basic Details */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b text-indigo-900">
                                    <FileText size={18} /> <h3 className="font-semibold text-lg">Assignment Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-bold text-slate-700">Assignment Title <span className="text-red-500">*</span></Label>
                                        <Input id="title" placeholder="e.g. Chapter 4 Essay" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="h-11 bg-slate-50 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="class" className="text-sm font-bold text-slate-700">Target Class <span className="text-red-500">*</span></Label>
                                        <Select value={form.class_id} onValueChange={(val) => {
                                            const selected = classes.find(c => c.class_id === val);
                                            setForm({...form, class_id: val, subject_id: selected?.subject_id || ""});
                                        }}>
                                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select a class" />
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

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-700">Strand</Label>
                                        <Select value={form.strand_id} onValueChange={(val) => setForm({...form, strand_id: val})}>
                                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select Strand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {strands.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-700">Sub-strand</Label>
                                        <Select value={form.sub_strand_id} onValueChange={(val) => setForm({...form, sub_strand_id: val})}>
                                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select Sub-strand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subStrands.map((ss) => (
                                                    <SelectItem key={ss.id} value={ss.id}>{ss.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-700">Learning Outcome</Label>
                                        <Select value={form.learning_outcome_id} onValueChange={(val) => setForm({...form, learning_outcome_id: val})}>
                                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select Outcome" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {learningOutcomes.map((lo) => (
                                                    <SelectItem key={lo.id} value={lo.id}>{lo.description.substring(0, 50)}...</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instructions" className="text-sm font-bold text-slate-700">Instructions / Prompt <span className="text-red-500">*</span></Label>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent transition-all">
                                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1">
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><AlignLeft size={16}/></Button>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><List size={16}/></Button>
                                        </div>
                                        <Textarea 
                                            id="instructions" 
                                            placeholder="Write detailed instructions here..." 
                                            className="min-h-[150px] border-none focus-visible:ring-0 rounded-none bg-white resize-y" 
                                            value={form.instructions}
                                            onChange={(e) => setForm({...form, instructions: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-2 pb-2 border-b text-indigo-900">
                                    <CheckSquare size={18} /> <h3 className="font-semibold text-lg">Settings & Attachments</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-slate-700">Due Date <span className="text-red-500">*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={`w-full h-11 justify-start text-left font-normal bg-slate-50 border-slate-200 ${!form.due_date && "text-muted-foreground"}`}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {form.due_date ? format(form.due_date, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={form.due_date} onSelect={(d) => d && setForm({...form, due_date: d})} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50">
                                            <div className="space-y-0.5">
                                                <Label className="text-base font-semibold text-slate-700">Multiple Choice (MCQ)</Label>
                                                <p className="text-xs text-muted-foreground">Enable auto-grading for this assignment</p>
                                            </div>
                                            <Switch checked={form.is_mcq} onCheckedChange={(c) => setForm({...form, is_mcq: c})} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Supporting Material (Optional)</Label>
                                    <div 
                                      onClick={() => document.getElementById('assign-file-upload')?.click()}
                                      className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 relative"
                                    >
                                        <input 
                                          type="file" 
                                          id="assign-file-upload" 
                                          className="hidden" 
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            // PDF restriction
                                            if (file.type !== 'application/pdf') {
                                              toast.error("Assignments must be uploaded as PDF files");
                                              return;
                                            }
                                            
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            
                                            setSubmitting(true);
                                            try {
                                              const res = await api.post('/upload', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                              });
                                              setForm({ ...form, file_url: res.data.url });
                                              toast.success("File uploaded successfully!");
                                            } catch (err) {
                                              toast.error("File upload failed");
                                            } finally {
                                              setSubmitting(false);
                                            }
                                          }}
                                          accept=".pdf"
                                        />
                                        <Upload size={24} className="text-indigo-400" />
                                        <p className="text-sm font-medium">
                                          {form.file_url ? "File Uploaded ✅" : "Click to upload a reference file"}
                                        </p>
                                        <p className="text-xs truncate max-w-xs">
                                          {form.file_url || "PDF, Word, or Images up to 10MB"}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                        
                        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
                            <Button type="button" variant="outline" className="px-6 h-11">Save Draft</Button>
                            <Button type="submit" disabled={submitting} className="px-8 h-11 bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm font-semibold text-white">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {submitting ? "Assigning..." : "Publish Assignment"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-indigo-50 border-none shadow-sm pb-4">
                    <CardHeader>
                        <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg"><CheckSquare size={18}/> Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-indigo-800">
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 shrink-0 text-xs">1</div>
                            <p>Give clear, concise instructions. Bullet points work best for multi-step tasks.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 shrink-0 text-xs">2</div>
                            <p>Set reasonable deadlines. Allow at least 48 hours for standard homework.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 shrink-0 text-xs">3</div>
                            <p>Attach grading rubrics early so students understand expectations.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default CreateAssignment;

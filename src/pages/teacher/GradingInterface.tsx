import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  FileText, 
  AlertCircle,
  Save,
  MessageSquare,
  History,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const GradingInterface = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get("/teacher/submissions");
      setSubmissions(data || []);
    } catch (err) {
      console.error("Fetch submissions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marks || isNaN(Number(marks))) {
      toast.error("Please enter a valid numeric score.");
      return;
    }

    setIsGrading(true);
    try {
      await api.patch(`/teacher/submissions/${selectedSub.id}/grade`, {
        marks_obtained: Number(marks),
        feedback,
      });
      toast.success("Grade submitted successfully!");
      setSelectedSub(null);
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit grade");
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'graded') {
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Graded</Badge>;
    }
    if (status === 'late') {
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Late Submission</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Needs Grading</Badge>;
  };

  const filtered = submissions.filter(sub => 
    sub.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.assignments?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = submissions.filter(s => s.status !== 'graded').length;

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
        className="teacher-container p-6 max-w-6xl mx-auto"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Grading Center</h1>
                <p className="text-muted-foreground">Review assignments, grade submissions, and provide feedback.</p>
            </div>
            
            <div className="flex bg-card border rounded-lg p-1 shadow-sm w-max">
                <div className="px-4 py-2 rounded-md bg-amber-50 text-amber-700 font-medium text-sm border border-amber-200/50">
                    <span className="text-xl font-bold block leading-none mb-1">{pendingCount}</span>
                    <span className="text-[10px] uppercase tracking-wider">To Grade</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input 
                        placeholder="Search student or task..." 
                        className="pl-9 h-11 bg-card shadow-sm border-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <Card className="border-none shadow-sm bg-indigo-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                            <History size={16} /> Grading Queue
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 pb-4">
                        {filtered.length === 0 ? (
                           <p className="text-xs text-center text-muted-foreground py-4">No submissions found in the queue.</p>
                        ) : (
                          filtered.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => {
                                  setSelectedSub(sub);
                                  setMarks(sub.marks_obtained ? String(sub.marks_obtained) : "");
                                  setFeedback(sub.feedback || "");
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${
                                    selectedSub?.id === sub.id 
                                    ? 'bg-white border-indigo-300 shadow-md ring-1 ring-indigo-100' 
                                    : 'bg-white border-transparent hover:border-indigo-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-sm truncate pr-2 text-slate-800">{sub.users?.name}</h4>
                                    {sub.status === 'graded' ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <Clock size={14} className="text-amber-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-medium">{sub.assignments?.title}</p>
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                    {sub.marks_obtained !== null && <span className="text-xs font-bold text-indigo-700">{sub.marks_obtained} pts</span>}
                                </div>
                            </button>
                          ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                    {selectedSub ? (
                        <motion.div
                            key="grading-panel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="shadow-sm border-none bg-white min-h-[600px] flex flex-col">
                                <CardHeader className="border-b bg-slate-50/50 flex flex-row items-start justify-between pb-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-lg">
                                                {selectedSub.users?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <CardTitle className="text-xl text-slate-800">{selectedSub.users?.name}</CardTitle>
                                                {getStatusBadge(selectedSub.status)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span><span className="font-semibold text-slate-600">ID:</span> {selectedSub.users?.student_id || "N/A"}</span>
                                                <span className="text-slate-300">•</span>
                                                <span><span className="font-semibold text-slate-600">Task:</span> {selectedSub.assignments?.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-100 rounded-full" onClick={() => setSelectedSub(null)}>
                                        <X size={20} />
                                    </Button>
                                </CardHeader>
                                
                                <CardContent className="p-0 flex-1 flex flex-col">
                                    <div className="p-6 bg-slate-50 border-b flex-1">
                                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <FileText size={16} className="text-slate-400"/> Student Submission
                                        </h3>
                                        
                                        {selectedSub.file_url ? (
                                            <div className="bg-white border rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[250px] shadow-sm">
                                                <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500 border border-indigo-100">
                                                    <FileText size={32} />
                                                </div>
                                                <h4 className="font-semibold text-lg text-slate-800 mb-2">Assignment File Attached</h4>
                                                <p className="text-sm text-slate-500 mb-6 max-w-sm">The student has uploaded a document for this assignment. Click below to view or download it.</p>
                                                <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold" asChild>
                                                    <a href={selectedSub.file_url} target="_blank" rel="noopener noreferrer">View Document</a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[250px]">
                                                <AlertCircle size={32} className="text-slate-300 mb-4" />
                                                <p className="text-slate-500 font-medium">No file attached to this submission.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-white">
                                        <form onSubmit={handleGrade} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="col-span-1 space-y-2">
                                                    <Label className="text-sm font-bold text-slate-700">Score <span className="text-red-500">*</span></Label>
                                                    <div className="relative">
                                                        <Input 
                                                            type="number" 
                                                            min="0" 
                                                            max="100" 
                                                            className="pl-4 h-12 text-lg font-bold bg-slate-50 border-slate-200" 
                                                            value={marks}
                                                            onChange={(e) => setMarks(e.target.value)}
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">/ 100</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-3 space-y-2">
                                                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                        <MessageSquare size={16} className="text-slate-400" /> Feedback (Optional)
                                                    </Label>
                                                    <Textarea 
                                                        placeholder="Provide constructive feedback for the student..." 
                                                        className="min-h-[120px] bg-slate-50 border-slate-200 resize-none font-medium leading-relaxed"
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" disabled={isGrading} className="px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-md">
                                                    {isGrading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                    {isGrading ? "Saving..." : (selectedSub.status === 'graded' ? "Update Grade" : "Submit Grade")}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full min-h-[600px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50"
                        >
                            <div className="text-center max-w-sm">
                                <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100">
                                    <CheckCircle2 size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Grade</h3>
                                <p className="text-slate-500">Select a student submission from the queue on the left to review their work and assign a grade.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default GradingInterface;

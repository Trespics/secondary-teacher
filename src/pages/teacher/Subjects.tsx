import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { 
  BookOpen, 
  Loader2, 
  ArrowRight,
  GraduationCap,
  Users,
  Layers,
  ChevronRight,
  ChevronLeft,
  FileText,
  Video,
  Plus,
  ExternalLink,  
  Target,
  FileCheck,
  Upload
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";   
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AssignedSubject {
  id: string;
  class_id: string;
  subject_id: string;
  school_id: string;
  teacher_id: string;
  classes: {
    id: string;
    name: string;
  };
  subjects: {
    id: string;
    name: string;
    code: string;
    image_url: string;
    description: string;
  };
}

interface Strand {
  id: string;
  name: string;
  description: string;
}

interface SubStrand {
  id: string;
  name: string;
  description: string;
}

interface LearningOutcome {
  id: string;
  description: string;
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  file_url: string;
  content_link: string;
  created_at: string;
}

const Subjects = () => {
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigationStack, setNavigationStack] = useState<any[]>([]); // { type, name }
  const [currentLevel, setCurrentLevel] = useState<"grades" | "subjects" | "strands" | "sub-strands" | "content">("grades");
  const [openingId, setOpeningId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const [selection, setSelection] = useState({
    grade: null as any,
    subject: null as any,
    strand: null as any,
    subStrand: null as any
  });

  const [data, setData] = useState({
    strands: [] as Strand[],
    subStrands: [] as SubStrand[],
    learningOutcomes: [] as LearningOutcome[],
    materials: [] as Material[]
  });

  const fetchAssignedSubjects = async () => {
    try {
      const { data } = await api.get("/teacher/classes");
      setAssignedSubjects(data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      toast.error("Failed to load your assigned subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  // Drill down logic
  const selectGrade = (grade: any) => {
    setSelection(prev => ({ ...prev, grade }));
    setCurrentLevel("subjects");
    setNavigationStack([...navigationStack, { type: "grade", name: grade.name }]);
  };

  const selectSubject = async (subject: any) => {
    setSelection(prev => ({ ...prev, subject }));
    setOpeningId(subject.id);
    try {
      const { data: strands } = await api.get("/cbc/strands", { params: { subject_id: subject.id } });
      setData(prev => ({ ...prev, strands }));
      setCurrentLevel("strands");
      setNavigationStack([...navigationStack, { type: "subject", name: subject.name }]);
    } catch (err) {
      toast.error("Failed to load strands");
    } finally {
      setOpeningId(null);
    }
  };

  const selectStrand = async (strand: any) => {
    setSelection(prev => ({ ...prev, strand }));
    setOpeningId(strand.id);
    try {
      const { data: subStrands } = await api.get("/cbc/sub-strands", { params: { strand_id: strand.id } });
      setData(prev => ({ ...prev, subStrands }));
      setCurrentLevel("sub-strands");
      setNavigationStack([...navigationStack, { type: "strand", name: strand.name }]);
    } catch (err) {
      toast.error("Failed to load sub-strands");
    } finally {
      setOpeningId(null);
    }
  };

  const selectSubStrand = async (subStrand: any) => {
    setSelection(prev => ({ ...prev, subStrand }));
    setOpeningId(subStrand.id);
    try {
      const [loRes, matRes] = await Promise.all([
        api.get("/cbc/learning-outcomes", { params: { sub_strand_id: subStrand.id } }),
        api.get("/teacher/materials", { params: { sub_strand_id: subStrand.id } })
      ]);
      setData(prev => ({ ...prev, learningOutcomes: loRes.data, materials: matRes.data }));
      setCurrentLevel("content");
      setNavigationStack([...navigationStack, { type: "subStrand", name: subStrand.name }]);
    } catch (err) {
      toast.error("Failed to load sub-strand content");
    } finally {
      setOpeningId(null);
    }
  };

  const goBack = () => {
    const newStack = [...navigationStack];
    newStack.pop();
    setNavigationStack(newStack);

    if (currentLevel === "content") setCurrentLevel("sub-strands");
    else if (currentLevel === "sub-strands") setCurrentLevel("strands");
    else if (currentLevel === "strands") setCurrentLevel("subjects");
    else if (currentLevel === "subjects") setCurrentLevel("grades");
  };

  // Group assigned subjects by class
  const grades = Array.from(new Set(assignedSubjects.map(s => s.classes?.id)))
    .filter(id => id)
    .map(id => {
      const cs = assignedSubjects.find(s => s.classes?.id === id);
      return { id, name: cs?.classes?.name };
    });

  const subjectsInGrade = assignedSubjects
    .filter(as => as.classes?.id === selection.grade?.id && as.subjects)
    .map(as => as.subjects);

  if (loading && currentLevel === "grades") {
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
        className="p-6 max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="hover:text-primary cursor-pointer" onClick={() => {
              setCurrentLevel("grades");
              setNavigationStack([]);
            }}>My Portal</span>
            {navigationStack.map((step, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={14} />
                <span className="font-medium text-slate-900">{step.name}</span>
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {currentLevel === "grades" ? "My Grades" : 
                 currentLevel === "subjects" ? `${selection.grade?.name} Subjects` :
                 currentLevel === "strands" ? `${selection.subject?.name} Strands` :
                 currentLevel === "sub-strands" ? `${selection.strand?.name} Sub-strands` :
                 selection.subStrand?.name}
              </h1>
              <p className="text-muted-foreground">
                {currentLevel === "content" ? "Upload and manage materials for this sub-strand." : "Drill down to manage curriculum content."}
              </p>
            </div>
            {currentLevel !== "grades" && (
              <Button variant="outline" onClick={goBack} className="gap-2">
                <ChevronLeft size={16} /> Back
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentLevel === "grades" && (
            <motion.div 
              key="grades"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {grades.map((grade) => (
                <Card key={grade.id} className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-indigo-100/50" onClick={() => selectGrade(grade)}>
                  <CardHeader className="bg-indigo-50/50 p-6">
                    <div className="flex justify-between items-center">
                      <GraduationCap className="text-indigo-600" size={32} />
                      <Badge variant="outline" className="bg-white">{assignedSubjects.filter(s => s.classes?.id === grade.id).length} Subjects</Badge>
                    </div>
                    <CardTitle className="text-2xl mt-4">{grade.name}</CardTitle>
                    <CardDescription>Click to view assigned subjects for this grade.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex justify-end items-center text-indigo-600 font-medium">
                    View Subjects <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              ))}
              {grades.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl">
                  <GraduationCap size={64} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold">No Grades Assigned</h3>
                  <p className="text-slate-500 mt-2">You haven't been assigned to any classes yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {currentLevel === "subjects" && (
            <motion.div 
              key="subjects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {subjectsInGrade.map((subject: any) => (
                <Card key={subject.id} className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-indigo-100/50" onClick={() => selectSubject(subject)}>
                  <div className="h-32 bg-gradient-to-br from-indigo-100 to-white relative flex items-center justify-center overflow-hidden">
                    {subject.image_url ? (
                      <img src={subject.image_url} alt={subject.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                    ) : (
                      <BookOpen size={48} className="text-indigo-300" />
                    )}
                  </div>
                  <CardHeader className="p-5">
                    <CardTitle className="text-xl">{subject.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{subject.description || "No description provided."}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex justify-between items-center">
                    <Badge variant="secondary">{subject.code || "CBC"}</Badge>
                    <span className="text-indigo-600 font-medium flex items-center">
                      {openingId === subject.id ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : "View Strands"}
                      <ArrowRight size={16} className="ml-1" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {currentLevel === "strands" && (
            <motion.div 
              key="strands"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {data.strands.length > 0 ? data.strands.map((strand) => (
                <Card key={strand.id} className="hover:border-indigo-400 cursor-pointer transition-colors" onClick={() => selectStrand(strand)}>
                  <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">{strand.name}</CardTitle>
                      <CardDescription>{strand.description || "No description available for this strand."}</CardDescription>
                    </div>
                    {openingId === strand.id ? (
                      <div className="flex items-center gap-2 text-indigo-600">
                        <span className="text-xs font-medium">Opening...</span>
                        <Loader2 className="animate-spin h-5 w-5" />
                      </div>
                    ) : (
                      <ChevronRight className="text-slate-400" />
                    )}
                  </CardHeader>
                </Card>
              )) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
                  <Layers className="mx-auto text-slate-300 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-slate-600">No Strands Found</h3>
                  <p className="text-slate-400">Strands haven't been configured for this subject yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {currentLevel === "sub-strands" && (
            <motion.div 
              key="sub-strands"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {data.subStrands.length > 0 ? data.subStrands.map((ss) => (
                <Card key={ss.id} className="hover:border-indigo-400 cursor-pointer transition-colors" onClick={() => selectSubStrand(ss)}>
                  <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">{ss.name}</CardTitle>
                      <CardDescription>{ss.description || "No description available for this sub-strand."}</CardDescription>
                    </div>
                    {openingId === ss.id ? (
                      <div className="flex items-center gap-2 text-indigo-600">
                        <span className="text-xs font-medium">Opening...</span>
                        <Loader2 className="animate-spin h-5 w-5" />
                      </div>
                    ) : (
                      <ChevronRight className="text-slate-400" />
                    )}
                  </CardHeader>
                </Card>
              )) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
                  <Layers className="mx-auto text-slate-300 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-slate-600">No Sub-strands Found</h3>
                  <p className="text-slate-400">Sub-strands haven't been configured for this strand yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {currentLevel === "content" && (
            <motion.div 
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Target className="text-indigo-600" size={20} /> Learning Outcomes
                    </h3>
                    <div className="space-y-3">
                      {data.learningOutcomes.length > 0 ? data.learningOutcomes.map((lo) => (
                        <div key={lo.id} className="flex gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <FileCheck className="text-indigo-600 shrink-0" size={20} />
                          <p className="text-sm text-indigo-900">{lo.description}</p>
                        </div>
                      )) : (
                        <p className="text-slate-400 text-sm italic">No specific learning outcomes assigned yet.</p>
                      )}
                    </div>
                  </section>

                  <section>
                    <Tabs defaultValue="materials" className="w-full">
                      <div className="flex justify-between items-center mb-4">
                        <TabsList>
                          <TabsTrigger value="materials">Materials</TabsTrigger>
                          <TabsTrigger value="assignments">Assignments</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="materials" className="space-y-4">
                        {data.materials.map((m) => (
                           <Card key={m.id} className="group hover:shadow-md transition-all">
                             <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {m.type === 'Video' ? <Video size={24} /> : <FileText size={24} />}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{m.title}</h4>
                                    <p className="text-xs text-slate-500">{m.type} • {new Date(m.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {(m.file_url || m.content_link) && (
                                    <Button variant="ghost" size="icon" asChild>
                                      <a href={m.file_url || m.content_link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink size={18} />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                             </CardContent>
                           </Card>
                        ))}
                        {data.materials.length === 0 && (
                          <div className="text-center py-12 border-2 border-dashed rounded-xl text-slate-400">
                             No materials uploaded for this sub-strand.
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="assignments">
                        <div className="text-center py-12 border-2 border-dashed rounded-xl text-slate-400">
                           No assignments created for this sub-strand.
                        </div>
                      </TabsContent>
                    </Tabs>
                  </section>
                </div>

                <div className="space-y-6">
                  <Card className="border-indigo-100 shadow-sm sticky top-6">
                    <CardHeader className="bg-indigo-50/50 border-b">
                      <CardTitle className="text-lg">Quick Access</CardTitle>
                      <CardDescription>Actions for this sub-strand.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-6 gap-2"
                        onClick={() => {
                          navigate("/teacher/upload-materials", { 
                            state: { 
                              classId: selection.grade?.id,
                              subjectId: selection.subject?.id,
                              strandId: selection.strand?.id,
                              subStrandId: selection.subStrand?.id
                            } 
                          });
                        }}
                      >
                        <Upload size={20} /> Upload Materials
                      </Button>
                      <Button variant="outline" className="w-full py-6 gap-2 border-indigo-200 text-indigo-700">
                        <Plus size={20} /> Create Assignment
                      </Button>
                      
                      <div className="pt-4 border-t">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Details</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Grade:</span>
                            <span className="font-medium">{selection.grade?.name}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Subject:</span>
                            <span className="font-medium">{selection.subject?.name}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PortalLayout>
  );
};

export default Subjects;

import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, UploadCloud, X, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";
import { useUploadLogic } from "@/hooks/useUploadLogic";

interface NotesUploadProps {
  classes: any[];
  onSuccess: () => void;
  editingMaterial?: any;
}

const NotesUpload: React.FC<NotesUploadProps> = ({ classes, onSuccess, editingMaterial }) => {
  const {
    uploading,
    uploadProgress,
    uploadedFiles,
    setUploadedFiles,
    isSubmitting,
    setIsSubmitting,
    handleFileUpload,
  } = useUploadLogic();

  const [form, setForm] = useState({
    title: "",
    description: "",
    class_id: "",
    subject_id: "",
    strand_id: "",
    sub_strand_id: "",
    learning_outcome_id: "",
    type: "Notes" as const,
    file_url: "",
    content_link: "",
    is_public: false,
    tags: "",
  });

  const [strands, setStrands] = useState<any[]>([]);
  const [subStrands, setSubStrands] = useState<any[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<any[]>([]);

  useEffect(() => {
    if (editingMaterial) {
      setForm({
        ...editingMaterial,
        tags: editingMaterial.tags?.join(", ") || "",
      });
      if (editingMaterial.file_url) {
          setUploadedFiles([{ name: "Existing File", url: editingMaterial.file_url }]);
      }
    }
  }, [editingMaterial]);

  // CBC Data Fetching
  useEffect(() => {
    if (form.subject_id) {
      api.get("/cbc/strands", { params: { subject_id: form.subject_id } })
        .then(res => setStrands(res.data || []))
        .catch(console.error);
    }
  }, [form.subject_id]);

  useEffect(() => {
    if (form.strand_id) {
      api.get("/cbc/sub-strands", { params: { strand_id: form.strand_id } })
        .then(res => setSubStrands(res.data || []))
        .catch(console.error);
    }
  }, [form.strand_id]);

  useEffect(() => {
    if (form.sub_strand_id) {
      api.get("/cbc/learning-outcomes", { params: { sub_strand_id: form.sub_strand_id } })
        .then(res => setLearningOutcomes(res.data || []))
        .catch(console.error);
    }
  }, [form.sub_strand_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.class_id) {
        toast.error("Title and class are required");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        file_url: uploadedFiles.length > 0 ? uploadedFiles[0].url : form.file_url
      };

      if (editingMaterial) {
        await api.put(`/teacher/materials/${editingMaterial.id}`, payload);
        toast.success("Notes updated successfully");
      } else {
        await api.post("/teacher/materials", { materials: [payload] });
        toast.success("Notes published successfully");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save notes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = await handleFileUpload(e, "Notes");
    if (newFiles && newFiles.length > 0 && !form.title) {
        setForm(prev => ({ ...prev, title: newFiles[0].name.split('.')[0] }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes Details</CardTitle>
              <CardDescription>Provide basic information about the notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  placeholder="e.g., Introduction to Algebra" 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Detailed description..." 
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class & Subject</Label>
                  <Select 
                    value={form.class_id + '-' + form.subject_id} 
                    onValueChange={(val) => {
                      const [cId, sId] = val.split('-');
                      setForm({...form, class_id: cId, subject_id: sId});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class/Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.class_id + '-' + c.subject_id} value={c.class_id + '-' + c.subject_id}>
                          {c.classes.name} - {c.subjects.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input 
                    placeholder="algebra, math, prep" 
                    value={form.tags}
                    onChange={e => setForm({...form, tags: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CBC Alignment</CardTitle>
              <CardDescription>Tag your content with CBC strands and outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Strand</Label>
                  <Select value={form.strand_id} onValueChange={v => setForm({...form, strand_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Strand" /></SelectTrigger>
                    <SelectContent>
                      {strands.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub-Strand</Label>
                  <Select value={form.sub_strand_id} onValueChange={v => setForm({...form, sub_strand_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Sub-Strand" /></SelectTrigger>
                    <SelectContent>
                      {subStrands.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Learning Outcome</Label>
                  <Select value={form.learning_outcome_id} onValueChange={v => setForm({...form, learning_outcome_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Outcome" /></SelectTrigger>
                    <SelectContent>
                      {learningOutcomes.map(lo => <SelectItem key={lo.id} value={lo.id}>{lo.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div
                  onClick={() => document.getElementById('notes-file')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors relative ${uploading ? 'bg-primary/5 border-primary' : 'hover:bg-slate-50 border-slate-200'}`}
                >
                  <input type="file" id="notes-file" className="hidden" onChange={onFileChange} accept=".pdf,.doc,.docx" />
                  {uploading ? (
                    <div className="space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  ) : uploadedFiles.length > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="text-sm font-medium">{uploadedFiles[0].name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-medium">Click to upload PDF/Doc</p>
                    </div>
                  )}
                </div>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">OR</span></div>
                </div>

                <div className="space-y-2">
                  <Label>External Link</Label>
                  <Input 
                    placeholder="https://drive.google.com/..." 
                    value={form.content_link}
                    onChange={e => setForm({...form, content_link: e.target.value})}
                  />
                </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Publishing</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center justify-between">
                  <Label>Make Public</Label>
                  <Switch checked={form.is_public} onCheckedChange={v => setForm({...form, is_public: v})} />
                </div>
             </CardContent>
             <CardFooter>
                <Button className="w-full" type="submit" disabled={isSubmitting || uploading}>
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                  {editingMaterial ? "Update Notes" : "Publish Notes"}
                </Button>
             </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default NotesUpload;

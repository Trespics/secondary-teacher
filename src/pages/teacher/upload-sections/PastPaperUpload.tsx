import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, UploadCloud, CheckCircle2, File } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";
import { useUploadLogic } from "@/hooks/useUploadLogic";

interface PastPaperUploadProps {
  classes: any[];
  onSuccess: () => void;
  editingMaterial?: any;
}

const PastPaperUpload: React.FC<PastPaperUploadProps> = ({ classes, onSuccess, editingMaterial }) => {
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
    class_id: "",
    subject_id: "",
    type: "Past Paper" as const,
    file_url: "",
    is_public: true,
  });

  useEffect(() => {
    if (editingMaterial) {
      setForm({
        ...editingMaterial,
      });
      if (editingMaterial.file_url) {
        setUploadedFiles([{ name: "Existing Past Paper", url: editingMaterial.file_url }]);
      }
    }
  }, [editingMaterial]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = await handleFileUpload(e, "Past Paper");
    if (newFiles && newFiles.length > 0 && !form.title) {
        // Automatic title extraction from filename
        const fileName = newFiles[0].name.split('.')[0];
        setForm(prev => ({ ...prev, title: fileName }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.class_id || (uploadedFiles.length === 0 && !form.file_url)) {
        toast.error("Please provide a title, class, and upload a file");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        file_url: uploadedFiles.length > 0 ? uploadedFiles[0].url : form.file_url
      };

      if (editingMaterial) {
        await api.put(`/teacher/past-papers/${editingMaterial.id}`, payload);
        toast.success("Past paper updated successfully");
      } else {
        await api.post("/teacher/past-papers", payload);
        toast.success("Past paper published successfully");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save past paper");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Paper Info</CardTitle>
              <CardDescription>Upload past exam papers for student practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Paper Title (Auto-fill from file if empty)</Label>
                <Input 
                  placeholder="e.g., 2023 KCSE Mathematics Paper 1" 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>
              
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                  onClick={() => document.getElementById('past-paper-file')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors relative ${uploading ? 'bg-primary/5 border-primary' : 'hover:bg-slate-50 border-slate-200'}`}
                >
                  <input type="file" id="past-paper-file" className="hidden" onChange={onFileChange} accept=".pdf" />
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
                      <p className="text-sm font-medium">Click to upload PDF Past Paper</p>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
             <CardHeader>
                <CardTitle>Settings</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center justify-between">
                  <Label>Public Access</Label>
                  <Switch checked={form.is_public} onCheckedChange={v => setForm({...form, is_public: v})} />
                </div>
             </CardContent>
             <CardFooter>
                <Button className="w-full" type="submit" disabled={isSubmitting || uploading}>
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <File className="w-4 h-4 mr-2" />}
                  {editingMaterial ? "Update Paper" : "Publish Paper"}
                </Button>
             </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default PastPaperUpload;

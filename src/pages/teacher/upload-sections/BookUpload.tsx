import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";
import { useUploadLogic } from "@/hooks/useUploadLogic";

interface BookUploadProps {
  classes: any[];
  onSuccess: () => void;
  editingMaterial?: any;
}

const BookUpload: React.FC<BookUploadProps> = ({ classes, onSuccess, editingMaterial }) => {
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
    type: "Book" as const,
    file_url: "",
    content_link: "",
    is_public: false,
    tags: "",
  });

  useEffect(() => {
    if (editingMaterial) {
      setForm({
        ...editingMaterial,
        tags: editingMaterial.tags?.join(", ") || "",
      });
      if (editingMaterial.file_url) {
        setUploadedFiles([{ name: "Existing Book", url: editingMaterial.file_url }]);
      }
    }
  }, [editingMaterial]);

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
        toast.success("Book updated successfully");
      } else {
        await api.post("/teacher/materials", { materials: [payload] });
        toast.success("Book published successfully");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save book");
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
              <CardTitle>Book Details</CardTitle>
              <CardDescription>Upload textbooks, reference books, or literature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Book Title</Label>
                <Input 
                  placeholder="e.g., Secondary Mathematics Form 1" 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Author / Description</Label>
                <Input 
                  placeholder="Author or brief overview" 
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
                  <Label>Keywords</Label>
                  <Input 
                    placeholder="textbook, reference, core" 
                    value={form.tags}
                    onChange={e => setForm({...form, tags: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Book File</CardTitle>
              <CardDescription>Upload a PDF of the book</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                  onClick={() => document.getElementById('book-file')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors relative ${uploading ? 'bg-primary/5 border-primary' : 'hover:bg-slate-50 border-slate-200'}`}
                >
                  <input type="file" id="book-file" className="hidden" onChange={(e) => handleFileUpload(e, "Book")} accept=".pdf" />
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
                      <p className="text-sm font-medium">Click to upload PDF Book</p>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
             <CardHeader>
                <CardTitle>Availability</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center justify-between">
                  <Label>Public Library</Label>
                  <Switch checked={form.is_public} onCheckedChange={v => setForm({...form, is_public: v})} />
                </div>
             </CardContent>
             <CardFooter>
                <Button className="w-full" type="submit" disabled={isSubmitting || uploading}>
                  {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
                  {editingMaterial ? "Update Book" : "Publish Book"}
                </Button>
             </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default BookUpload;

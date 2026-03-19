import React from "react";
import { useUploadLogic } from "./useUploadLogic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Book as BookIcon, BookMarked, UploadCloud, CheckCircle2, Loader2, X, File } from "lucide-react";

interface BookUploadProps {
  classes: any[];
  onSuccess: () => void;
  editingMaterial?: any;
  onCancel?: () => void;
}

export const BookUpload: React.FC<BookUploadProps> = ({ classes, onSuccess, editingMaterial, onCancel }) => {
  const {
    form,
    setForm,
    uploadedFiles,
    removeFile,
    uploading,
    uploadProgress,
    isSubmitting,
    strands,
    subStrands,
    learningOutcomes,
    handleFileUpload,
    handleSubmit,
  } = useUploadLogic("Book", editingMaterial, onSuccess, onCancel);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookIcon className="w-5 h-5 text-green-600" />
                  Book Information
                </CardTitle>
                <CardDescription>Enter the core details of the textbook or ebook</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title {uploadedFiles.length <= 1 && <span className="text-red-500">*</span>}</Label>
                    <Input
                      placeholder={uploadedFiles.length > 1 ? "Will use filenames as titles" : "e.g., Secondary Physics Form 1"}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      disabled={uploadedFiles.length > 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Class / Subject <span className="text-red-500">*</span></Label>
                    <Select
                      value={form.class_id && form.subject_id ? `${form.class_id}|${form.subject_id}` : ""}
                      onValueChange={(val) => {
                        const [cId, sId] = val.split("|");
                        setForm({ ...form, class_id: cId, subject_id: sId });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={`${c.class_id}|${c.subject_id}`} value={`${c.class_id}|${c.subject_id}`}>
                            {c.classes?.name} - {c.subjects?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description {uploadedFiles.length <= 1 && <span className="text-red-500">*</span>}</Label>
                  <Textarea
                    placeholder="Describe what this book covers..."
                    className="min-h-[100px]"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="physics, textbook, kcse"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-green-600" />
                  CBC Alignment (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!form.class_id ? (
                    <div className="text-center py-4 text-slate-400 italic text-sm">Select a class first to see curriculum alignment</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Strand</Label>
                      <Select value={form.strand_id} onValueChange={(val) => setForm({ ...form, strand_id: val })}>
                        <SelectTrigger><SelectValue placeholder="Select strand" /></SelectTrigger>
                        <SelectContent>
                          {strands.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sub-strand</Label>
                      <Select value={form.sub_strand_id} onValueChange={(val) => setForm({ ...form, sub_strand_id: val })} disabled={!form.strand_id}>
                        <SelectTrigger><SelectValue placeholder="Select sub-strand" /></SelectTrigger>
                        <SelectContent>
                          {subStrands.map(ss => <SelectItem key={ss.id} value={ss.id}>{ss.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-100 shadow-sm overflow-hidden">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg">Resource Files</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="space-y-3">
                  <div 
                    onClick={() => document.getElementById("book-file")?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-slate-50 ${uploading ? 'bg-green-50 border-green-200' : 'border-slate-200'}`}
                  >
                    <input type="file" id="book-file" className="hidden" accept=".pdf,.epub" multiple onChange={handleFileUpload} />
                    {uploading ? (
                      <div className="space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                        <Progress value={uploadProgress} className="h-1" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-medium">Click to upload Book(s)</p>
                      </div>
                    )}
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Uploaded Books ({uploadedFiles.length})</Label>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/50 group">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <File className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs font-medium truncate">{file.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            type="button"
                            className="h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            onClick={() => removeFile(idx)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><Separator /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white px-2">OR</span></div>
                </div>

                <div className="space-y-2">
                  <Label>E-book Link</Label>
                  <Input 
                    placeholder="https://google.com/books?..." 
                    value={form.content_link}
                    onChange={(e) => setForm({ ...form, content_link: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Make Public</Label>
                  <Switch checked={form.is_public} onCheckedChange={(checked) => setForm({ ...form, is_public: checked })} />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-6">
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-bold" disabled={isSubmitting || uploading || (uploadedFiles.length === 0 && !form.content_link)}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Publishing...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4 mr-2" /> {uploadedFiles.length > 1 ? `Publish ${uploadedFiles.length} Books` : "Publish Book"}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

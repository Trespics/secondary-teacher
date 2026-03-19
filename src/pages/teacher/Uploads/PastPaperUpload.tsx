import React from "react";
import { useUploadLogic } from "./useUploadLogic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { File, UploadCloud, CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";

interface PastPaperUploadProps {
  classes: any[];
  onSuccess: () => void;
  editingMaterial?: any;
  onCancel?: () => void;
}

export const PastPaperUpload: React.FC<PastPaperUploadProps> = ({ classes, onSuccess, editingMaterial, onCancel }) => {
  const {
    form,
    setForm,
    uploadedFiles,
    removeFile,
    uploading,
    uploadProgress,
    isSubmitting,
    handleFileUpload,
    handleSubmit,
  } = useUploadLogic("Past Paper", editingMaterial, onSuccess, onCancel);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <File className="w-5 h-5 text-amber-600" />
                  Past Paper Information
                </CardTitle>
                <CardDescription>Select the class for these practice papers</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Class / Grade <span className="text-red-500">*</span></Label>
                    <Select
                      value={form.class_id && form.subject_id ? `${form.class_id}|${form.subject_id}` : ""}
                      onValueChange={(val) => {
                        const [cId, sId] = val.split("|");
                        setForm({ ...form, class_id: cId, subject_id: sId });
                      }}
                    >
                      <SelectTrigger className="h-11 border-slate-200">
                        <SelectValue placeholder="Which class are these papers for?" />
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
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  Upload Files
                </CardTitle>
                <CardDescription>You can upload multiple PDF papers at once</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="space-y-3">
                  <div 
                    onClick={() => document.getElementById("paper-file")?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-slate-50 ${uploading ? 'bg-amber-50 border-amber-200' : 'border-slate-200'}`}
                  >
                    <input type="file" id="paper-file" className="hidden" accept=".pdf" multiple onChange={handleFileUpload} />
                    {uploading ? (
                      <div className="space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Uploading...</p>
                          <Progress value={uploadProgress} className="h-2 w-full max-w-xs mx-auto" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
                          <UploadCloud className="w-6 h-6 text-amber-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Click to select files</p>
                        <p className="text-xs text-slate-400">PDF files only. Max 50MB per file.</p>
                      </div>
                    )}
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Papers ({uploadedFiles.length})</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 group hover:border-amber-200 hover:bg-white transition-all">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                               <File className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            type="button"
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-100 shadow-sm overflow-hidden sticky top-6">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg">Publish Options</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Make Public</Label>
                    <p className="text-[10px] text-slate-500">Visible to all students</p>
                  </div>
                  <Switch checked={form.is_public} onCheckedChange={(checked) => setForm({ ...form, is_public: checked })} />
                </div>

                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Papers will be automatically named after their filenames. You can rename them later in the Library tab.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-6">
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700 h-11 text-sm font-bold shadow-md shadow-amber-100" 
                  disabled={isSubmitting || uploading || uploadedFiles.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Publishing {uploadedFiles.length} Papers...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Publish {uploadedFiles.length} Papers
                    </>
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

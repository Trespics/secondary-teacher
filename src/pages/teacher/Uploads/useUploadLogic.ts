import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface UploadForm {
  title: string;
  description: string;
  type: string;
  class_id: string;
  subject_id: string;
  strand_id: string;
  sub_strand_id: string;
  learning_outcome_id: string;
  file_url: string;
  content_link: string;
  tags: string;
  is_public: boolean;
}

export const useUploadLogic = (initialType: string, editingMaterial: any, onSuccess: () => void, onCancel?: () => void) => {
  const [form, setForm] = useState<UploadForm>({
    title: "",
    description: "",
    type: initialType,
    class_id: "",
    subject_id: "",
    strand_id: "",
    sub_strand_id: "",
    learning_outcome_id: "",
    file_url: "",
    content_link: "",
    tags: "",
    is_public: true,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strands, setStrands] = useState<any[]>([]);
  const [subStrands, setSubStrands] = useState<any[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<any[]>([]);

  useEffect(() => {
    if (editingMaterial) {
      setForm({
        title: editingMaterial.title || "",
        description: editingMaterial.description || "",
        type: editingMaterial.type || initialType,
        class_id: editingMaterial.class_id || "",
        subject_id: editingMaterial.subject_id || "",
        strand_id: editingMaterial.strand_id || "",
        sub_strand_id: editingMaterial.sub_strand_id || "",
        learning_outcome_id: editingMaterial.learning_outcome_id || "",
        file_url: editingMaterial.file_url || "",
        content_link: editingMaterial.content_link || "",
        tags: editingMaterial.tags?.join(", ") || "",
        is_public: editingMaterial.is_public ?? true,
      });
      if (editingMaterial.file_url) {
        setUploadedFiles([{ url: editingMaterial.file_url, name: editingMaterial.title || "Existing File" }]);
      }
    }
  }, [editingMaterial, initialType]);

  useEffect(() => {
    if (form.class_id && form.subject_id) {
      fetchStrands();
    }
  }, [form.class_id, form.subject_id]);

  useEffect(() => {
    if (form.strand_id) {
      fetchSubStrands();
    }
  }, [form.strand_id]);

  useEffect(() => {
    if (form.sub_strand_id) {
      fetchLearningOutcomes();
    }
  }, [form.sub_strand_id]);

  const fetchStrands = async () => {
    try {
      const res = await api.get(`/cbc/strands?class_id=${form.class_id}&subject_id=${form.subject_id}`);
      setStrands(res.data);
    } catch (err) {
      console.error("Failed to fetch strands");
    }
  };

  const fetchSubStrands = async () => {
    try {
      const res = await api.get(`/cbc/sub-strands?strand_id=${form.strand_id}`);
      setSubStrands(res.data);
    } catch (err) {
      console.error("Failed to fetch sub-strands");
    }
  };

  const fetchLearningOutcomes = async () => {
    try {
      const res = await api.get(`/cbc/learning-outcomes?sub_strand_id=${form.sub_strand_id}`);
      setLearningOutcomes(res.data);
    } catch (err) {
      console.error("Failed to fetch learning outcomes");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    
    // Validation
    for (const file of filesArray) {
      if (form.type !== "Video" && form.type !== "Audio" && file.type !== "application/pdf") {
        toast.error(`File "${file.name}" is not a PDF.`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    const newUploadedFiles = [...uploadedFiles];

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const fd = new FormData();
        fd.append("file", file);

        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          },
        });

        newUploadedFiles.push({ url: res.data.url, name: file.name });
        setUploadedFiles([...newUploadedFiles]);
        
        // Auto-set first file's name as title if title is empty
        if (i === 0 && !form.title) {
          setForm(prev => ({ ...prev, title: file.name.split(".")[0], file_url: res.data.url }));
        }
      }
      toast.success(`${filesArray.length} file(s) uploaded successfully.`);
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setForm(prev => ({ ...prev, file_url: "" }));
    } else {
      setForm(prev => ({ ...prev, file_url: newFiles[0].url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isPastPaper = form.type === "Past Paper";
    const requiredTitle = isPastPaper ? (form.title || (uploadedFiles.length > 0 ? uploadedFiles[0].name.split(".")[0] : "")) : form.title;
    const requiredDesc = isPastPaper ? (form.description || `Past paper for ${requiredTitle}`) : form.description;

    if (!requiredTitle || !form.class_id || !form.subject_id || (!isPastPaper && !requiredDesc)) {
      toast.error("Please fill in all required fields (Title, Class, Subject, and Description).");
      return;
    }

    if (uploadedFiles.length === 0 && !form.content_link) {
      toast.error("Please upload a file or provide a link.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = form.tags.split(",").map((s) => s.trim()).filter((s) => s);

      // Sanitize helper to convert empty strings to null for UUID/Foreign Key fields
      const sanitize = (data: any) => {
        const sanitized = { ...data };
        ['strand_id', 'sub_strand_id', 'learning_outcome_id'].forEach(key => {
          if (sanitized[key] === "") sanitized[key] = null;
        });
        return sanitized;
      };

      if (editingMaterial) {
        const payload = sanitize({ ...form, title: requiredTitle, description: requiredDesc, tags: tagsArray, file_url: uploadedFiles[0]?.url || "" });
        const table = editingMaterial._table || (editingMaterial.type === 'Past Paper' ? 'past_papers' : 'materials');
        const endpoint = table === 'past_papers' ? `/teacher/past-papers/${editingMaterial.id}` : `/teacher/materials/${editingMaterial.id}`;
        
        console.log("Updating material payload:", payload);
        await api.put(endpoint, payload);
        toast.success("Updated successfully.");
      } else {
        if (isPastPaper) {
          // Bulk past paper upload
          const pastPapers = uploadedFiles.map(file => sanitize({
            ...form,
            title: file.name.split(".")[0],
            file_url: file.url
          }));
          console.log("Publishing past papers:", pastPapers);
          await api.post("/teacher/past-papers", { pastPapers });
        } else {
          // Bulk material upload (Notes, Video, Audio, Book)
          const materials = uploadedFiles.map(file => sanitize({
            ...form,
            title: file.name.split(".")[0],
            description: requiredDesc,
            tags: tagsArray,
            file_url: file.url
          }));
          
          if (uploadedFiles.length > 1) {
            console.log("Publishing bulk materials:", materials);
            await api.post("/teacher/materials", { materials });
          } else {
             const payload = sanitize({ ...form, title: requiredTitle, description: requiredDesc, tags: tagsArray, file_url: uploadedFiles[0]?.url || "" });
             console.log("Publishing single material:", payload);
             await api.post("/teacher/materials", payload);
          }
        }
        toast.success("Published successfully.");
      }
      onSuccess();
      if (onCancel) onCancel();
    } catch (err: any) {
      console.error("Upload error details:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to save.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  UploadCloud,
  FileText,
  PlayCircle,
  Headphones,
  FolderPlus,
  Database,
  Lock,
  Globe,
  Loader2,
  Trash2,
  Clock,
  Edit2,
  X,
  Link as LinkIcon,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Grid3x3,
  List,
  Eye,
  Download,
  Share2,
  MoreVertical,
  BookMarked,
  Video,
  Mic,
  File,
} from "lucide-react";
import { NotesUpload } from "./Uploads/NotesUpload";
import { VideoUpload } from "./Uploads/VideoUpload";
import { AudioUpload } from "./Uploads/AudioUpload";
import { PastPaperUpload } from "./Uploads/PastPaperUpload";
import { BookUpload } from "./Uploads/BookUpload";
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
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UploadMaterials = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadType, setUploadType] = useState<string>("Notes");
  const [reports, setReports] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  // Form states are now handled in sub-components

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, materialsRes, pastPapersRes, reportsRes] = await Promise.all([
        api.get("/teacher/classes"),
        api.get("/teacher/materials"),
        api.get("/teacher/past-papers"),
        api.get("/teacher/material-reports")
      ]);

      setClasses(classesRes.data || []);
      // Merge materials and past papers for the library view if needed, 
      // or handle them separately. The user wants them in a different table.
      // We'll tag them so we know which is which for delete/edit.
      const mats = (materialsRes.data || []).map((m: any) => ({ ...m, _table: 'materials' }));
      const papers = (pastPapersRes.data || []).map((p: any) => ({ ...p, _table: 'past_papers', type: 'Past Paper' }));
      
      setMaterials([...mats, ...papers]);
      setReports(reportsRes.data || []);
    } catch (err) {
      console.error("Fetch data error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const location = useLocation();

  // Context pre-filling now handled in sub-components if needed

  // Fetch CBC hierarchy
  // CBC data fetching and selected class logic now handled in sub-components

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setUploadType(material.type);
    setActiveTab("upload");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingMaterial(null);
  };

  const confirmDelete = (id: string) => {
    setMaterialToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;

    try {
      const item = materials.find(m => m.id === materialToDelete);
      const table = item?._table || (item?.type === 'Past Paper' ? 'past_papers' : 'materials');
      const endpoint = table === 'past_papers' ? `/teacher/past-papers/${materialToDelete}` : `/teacher/materials/${materialToDelete}`;
      
      await api.delete(endpoint);
      toast.success("Content deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete content");
    } finally {
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await api.put(`/teacher/material-reports/${reportId}/resolve`);
      toast.success("Report resolved");
      fetchData();
    } catch (err) {
      toast.error("Failed to resolve report");
    }
  };

  const getTypeIcon = (type: string, className = "w-4 h-4") => {
    const icons = {
      'Notes': <FileText className={`${className} text-blue-500`} />,
      'Video': <PlayCircle className={`${className} text-red-500`} />,
      'Audio': <Headphones className={`${className} text-purple-500`} />,
      'Book': <BookOpen className={`${className} text-orange-500`} />,
      'Past Paper': <FileText className={`${className} text-green-500`} />,
    };
    return icons[type as keyof typeof icons] || <File className={`${className} text-gray-500`} />;
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Published
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" /> Pending Review
      </Badge>
    );
  };

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || material.type === filterType;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "published" && material.is_public) ||
      (filterStatus === "pending" && !material.is_public);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: materials.length,
    published: materials.filter(m => m.is_public).length,
    pending: materials.filter(m => !m.is_public).length,
    notes: materials.filter(m => m.type === 'Notes').length,
    videos: materials.filter(m => m.type === 'Video').length,
  };

  if (loading) {
    return (
      <PortalLayout type="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your content studio...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout type="teacher">
      <div className="min-h-screen bg-slate-50/50">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Studio</h1>
                <p className="text-muted-foreground mt-1">
                  Create and manage your teaching resources
                </p>
              </div>
              {editingMaterial && (
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel Editing
                </Button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Resources</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-indigo-600">+12</p>
                  </div>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <UploadCloud className="w-5 h-5 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-[450px] grid-cols-3">
                <TabsTrigger value="upload" className="gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="library" className="gap-2">
                  <Database className="w-4 h-4" />
                  Library
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-2 relative">
                  <AlertCircle className="w-4 h-4" />
                  Reports
                  {reports.filter(r => r.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {reports.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {activeTab === "library" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-accent" : ""}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-accent" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="upload" className="space-y-6 min-h-[600px]">
              {!editingMaterial ? (
                <div className="mb-8">
                  <div className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-2xl font-bold text-slate-900">What would you like to publish?</h2>
                    <p className="text-slate-500">Select a category to start uploading your teaching resources</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                      { id: "Notes", icon: FileText, label: "Notes", color: "blue", bg: "bg-blue-50", text: "text-blue-600", desc: "PDF lesson materials" },
                      { id: "Video", icon: Video, label: "Video", color: "purple", bg: "bg-purple-50", text: "text-purple-600", desc: "Lecture & tutorial videos" },
                      { id: "Audio", icon: Headphones, label: "Audio", color: "pink", bg: "bg-pink-50", text: "text-pink-600", desc: "Podcasts & recordings" },
                      { id: "Book", icon: BookOpen, label: "Book", color: "green", bg: "bg-green-50", text: "text-green-600", desc: "Reference & text books" },
                      { id: "Past Paper", icon: File, label: "Past Paper", color: "amber", bg: "bg-amber-50", text: "text-amber-600", desc: "Exam practice papers" },
                    ].map((type) => (
                      <Card 
                        key={type.id}
                        onClick={() => setUploadType(type.id)}
                        className={`group relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 border-2 ${
                          uploadType === type.id 
                            ? "border-primary ring-2 ring-primary/10 bg-white" 
                            : "border-slate-100 bg-white/50 hover:bg-white"
                        }`}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${type.bg} ${type.text}`}>
                            <type.icon className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{type.label}</h3>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{type.desc}</p>
                          </div>
                          {uploadType === type.id && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-primary text-white p-1 rounded-full shadow-lg">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Edit2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Editing {editingMaterial.type}</h2>
                      <p className="text-sm text-slate-500">Modifying "{editingMaterial.title}"</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={cancelEdit} className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <X className="w-4 h-4 mr-2" />
                    Cancel Editing
                  </Button>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={uploadType + (editingMaterial?.id || 'new')}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full"
                >
                  <div className="max-w-4xl mx-auto">
                    {uploadType === "Notes" && <NotesUpload classes={classes} onSuccess={fetchData} editingMaterial={editingMaterial} onCancel={cancelEdit} />}
                    {uploadType === "Video" && <VideoUpload classes={classes} onSuccess={fetchData} editingMaterial={editingMaterial} onCancel={cancelEdit} />}
                    {uploadType === "Audio" && <AudioUpload classes={classes} onSuccess={fetchData} editingMaterial={editingMaterial} onCancel={cancelEdit} />}
                    {uploadType === "Book" && <BookUpload classes={classes} onSuccess={fetchData} editingMaterial={editingMaterial} onCancel={cancelEdit} />}
                    {uploadType === "Past Paper" && <PastPaperUpload classes={classes} onSuccess={fetchData} editingMaterial={editingMaterial} onCancel={cancelEdit} />}
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="library" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search materials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[150px]">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Notes">Notes</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Book">Book</SelectItem>
                          <SelectItem value="Past Paper">Past Paper</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="pending">Pending Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Materials Grid/List */}
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No materials found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {searchQuery || filterType !== "all" || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Start by uploading your first teaching resource"}
                  </p>
                  {searchQuery || filterType !== "all" || filterStatus !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterType("all");
                        setFilterStatus("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => setActiveTab("upload")} className="gap-2">
                      <UploadCloud className="w-4 h-4" />
                      Upload Resource
                    </Button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMaterials.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="relative h-32 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                          <div className="absolute top-3 right-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/50 backdrop-blur-sm hover:bg-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => confirmDelete(item.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                              {getTypeIcon(item.type, "w-6 h-6")}
                            </div>
                            <div>
                              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                                {item.type}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(item.is_public)}
                            <Badge variant="outline" className="bg-slate-50">
                              {item.classes?.name}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </div>
                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="text-left p-4 font-medium">Title</th>
                          <th className="text-left p-4 font-medium">Type</th>
                          <th className="text-left p-4 font-medium">Class</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-slate-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {getTypeIcon(item.type)}
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">{item.type}</td>
                            <td className="p-4">{item.classes?.name}</td>
                            <td className="p-4">{getStatusBadge(item.is_public)}</td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirmDelete(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {item.file_url && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4" />
                                          </a>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Open</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Student Reports
                  </CardTitle>
                  <CardDescription>
                    Review materials reported as inappropriate by students.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                      <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600">No reports found</h3>
                      <p className="text-sm text-slate-400">All materials look good for now.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b bg-slate-50/50">
                            <th className="p-4 font-semibold text-sm">Material</th>
                            <th className="p-4 font-semibold text-sm">Student</th>
                            <th className="p-4 font-semibold text-sm">Reason</th>
                            <th className="p-4 font-semibold text-sm">Status</th>
                            <th className="p-4 font-semibold text-sm text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report) => (
                            <tr key={report.id} className="border-b hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-sm">{report.materials?.title}</p>
                                  <p className="text-xs text-muted-foreground">{report.materials?.type}</p>
                                </div>
                              </td>
                              <td className="p-4 text-sm">{report.users?.name || "Student"}</td>
                              <td className="p-4 text-sm max-w-[200px] truncate">{report.reason}</td>
                              <td className="p-4">
                                <Badge variant="outline" className={report.status === 'pending' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}>
                                  {report.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                {report.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleResolveReport(report.id)}
                                  >
                                    Resolve
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this material? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PortalLayout>
  );
};

export default UploadMaterials;
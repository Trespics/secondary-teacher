import React, { useState } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import { 
  FileDown, 
  FileText, 
  Table as TableIcon, 
  Download, 
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const reportTemplates = [
  { id: 1, title: "Term 1 Class Performance Report", type: "PDF", category: "Academic", size: "1.2 MB" },
  { id: 2, title: "Monthly Attendance Summary", type: "Excel", category: "Attendance", size: "450 KB" },
  { id: 3, title: "Assignment Completion Audit", type: "PDF", category: "Activity", size: "890 KB" },
];

const ReportsExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
        setIsGenerating(false);
        toast.success("Report generated successfully!");
    }, 2000);
  };

  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="masomo-container p-6"
      >
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
            <p className="text-muted-foreground">Generate comprehensive reports for your classes and students.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generator Form */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-sm border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-lg">Generate New Report</CardTitle>
                        <CardDescription>Select filters to customize your export.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Report Type</label>
                            <Select defaultValue="performance">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="performance">Class Performance</SelectItem>
                                    <SelectItem value="attendance">Student Attendance</SelectItem>
                                    <SelectItem value="engagement">Portal Engagement</SelectItem>
                                    <SelectItem value="individual">Individual Student Progress</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Secondary Filter</label>
                            <Select defaultValue="grade4">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="grade4">Grade 4 (All)</SelectItem>
                                    <SelectItem value="grade7">Grade 7 North</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Template / Format</label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="justify-start gap-2 h-10 px-3">
                                    <FileText size={16} className="text-red-500" /> PDF
                                </Button>
                                <Button variant="outline" className="justify-start gap-2 h-10 px-3 border-primary/30 bg-primary/5">
                                    <TableIcon size={16} className="text-green-600" /> Excel
                                </Button>
                            </div>
                        </div>

                        <Button 
                            className="w-full mt-4 gap-2" 
                            size="lg" 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? "Generating..." : "Generate Report"}
                            {!isGenerating && <ArrowRight size={18} />}
                        </Button>
                    </CardContent>
                </Card>

                <div className="bg-muted/30 rounded-xl p-6 flex items-start gap-4">
                    <Calendar className="text-muted-foreground shrink-0 mt-1" size={20} />
                    <div className="text-xs space-y-2">
                        <p className="font-semibold text-foreground">Scheduled Exports</p>
                        <p className="text-muted-foreground leading-relaxed">
                            Monthly term reports are automatically generated on the 28th of every month. You can find them in the recent reports section.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Reports Table */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Recently Generated</h3>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">Clear History</Button>
                </div>

                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 divide-y">
                        {reportTemplates.map((report) => (
                            <div key={report.id} className="p-4 hover:bg-muted/20 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${report.type === 'PDF' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                                        {report.type === 'PDF' ? <FileText size={24} /> : <TableIcon size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-medium group-hover:text-primary transition-colors">{report.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge variant="outline" className="text-[10px] py-0 h-4">{report.category}</Badge>
                                            <span className="text-[10px] text-muted-foreground uppercase">{report.size}</span>
                                            <span className="text-[10px] text-muted-foreground">• Oct 24, 2024</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download size={18} />
                                    </Button>
                                    <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
                                        Download <FileDown size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automation Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-card border rounded-xl shadow-sm space-y-3">
                         <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-bold">Auto-Sync Enabled</span>
                         </div>
                         <p className="text-xs text-muted-foreground">
                            Reports are synced with current teacher logs and student submissions.
                         </p>
                    </div>
                    <div className="p-5 bg-card border rounded-xl shadow-sm space-y-3">
                         <div className="flex items-center gap-2 text-primary">
                            <Clock size={18} />
                            <span className="text-sm font-bold">Data Freshness</span>
                         </div>
                         <p className="text-xs text-muted-foreground">
                            Reports generated reflect data valid as of 5 minutes ago.
                         </p>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default ReportsExport;

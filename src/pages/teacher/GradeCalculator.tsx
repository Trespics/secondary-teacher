import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import { 
  Calculator, 
  Info, 
  RotateCcw, 
  Save,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GradeCalculator = () => {
  const [marks, setMarks] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calculateGrade = (val: string) => {
    const score = parseFloat(val);
    if (isNaN(score)) return null;

    let grade = "";
    let color = "";
    let description = "";

    if (score >= 80) {
      grade = "EE";
      color = "bg-green-500 text-white";
      description = "Exceeding Expectation";
    } else if (score >= 60) {
      grade = "ME";
      color = "bg-blue-500 text-white";
      description = "Meeting Expectation";
    } else if (score >= 40) {
      grade = "AE";
      color = "bg-orange-500 text-white";
      description = "Approaching Expectation";
    } else {
      grade = "BE";
      color = "bg-red-500 text-white";
      description = "Below Expectation";
    }

    return { grade, color, description, score };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateGrade(marks);
    setResult(res);
  };

  const reset = () => {
    setMarks("");
    setResult(null);
  };

  return (
    <PortalLayout type="masomo">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="masomo-container p-6"
      >
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Grade Calculator</h1>
            <p className="text-muted-foreground">Quickly convert raw marks to CBC grade indicators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator size={20} className="text-primary" />
                        Calculator
                    </CardTitle>
                    <CardDescription>Enter the raw score to see the performance level.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCalculate} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="marks">Raw Score (0 - 100)</Label>
                            <div className="relative">
                                <Input 
                                    id="marks" 
                                    type="number" 
                                    placeholder="e.g., 75" 
                                    className="text-lg h-12"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">%</div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" size="lg" className="flex-1">Calculate Grade</Button>
                            <Button type="button" variant="outline" size="lg" onClick={reset}>
                                <RotateCcw size={18} />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <Card className="shadow-md border-primary/20 bg-primary/5 overflow-hidden">
                            <CardHeader className="text-center pb-2">
                                <CardDescription>Performance Level</CardDescription>
                                <CardTitle className="text-5xl font-black mt-2">{result.grade}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center space-y-4">
                                <Badge className={`text-sm px-4 py-1 pointer-events-none ${result.color}`}>
                                    {result.description}
                                </Badge>
                                <p className="text-muted-foreground text-sm">
                                    The score of <strong>{result.score}%</strong> indicates the student is {result.description.toLowerCase()}.
                                </p>
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                    <Info size={14} /> Criteria
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px] text-xs">
                                                EE: 80%+, ME: 60-79%, AE: 40-59%, BE: Below 40%
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Button variant="ghost" size="sm" className="text-primary text-xs gap-1">
                                        <Save size={14} /> Record Grade
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {!result && (
                <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/20 text-muted-foreground">
                    <Calculator size={48} className="mb-4 opacity-20" />
                    <p className="text-sm">Enter a score to see the calculation results.</p>
                </div>
            )}
        </div>

        {/* Legend */}
        <div className="mt-12">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <HelpCircle size={18} className="text-primary" />
                CBC Grading Rubric
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { l: 'EE', n: 'Exceeding Expectation', r: '80 - 100', c: 'bg-green-500' },
                    { l: 'ME', n: 'Meeting Expectation', r: '60 - 79', c: 'bg-blue-500' },
                    { l: 'AE', n: 'Approaching Expectation', r: '40 - 59', c: 'bg-orange-500' },
                    { l: 'BE', n: 'Below Expectation', r: '0 - 39', c: 'bg-red-500' },
                ].map((item) => (
                    <div key={item.l} className="bg-card border rounded-lg p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold ${item.c}`}>
                            {item.l}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{item.n}</p>
                            <p className="text-xs text-muted-foreground">{item.r}% Score Range</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default GradeCalculator;

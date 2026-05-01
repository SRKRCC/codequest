import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  Code, BookOpen, FileCode, Check, Copy,
  Clock, AlertCircle, Lightbulb,
  Database, Award, GitBranch, Star, Tag,
  ArrowUpRight, TerminalSquare,
  ArrowLeft
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
interface SolutionData {
  title: string;
  description: string;
  category: string[];
  problemLink: string;
  solved?: boolean;
  codeSnippets: {
    explanation: string;
    python: string;
    cpp: string;
    java: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
}

// CopyButton component for the code editor UI
const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className={cn(
              "h-8 w-8 p-0 rounded-full transition-all duration-300",
              copied ? "bg-green-500/20" : "hover:bg-primary/10"
            )}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="copied"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? "Copied!" : "Copy code"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Code syntax highlighting component with improved responsiveness
const SyntaxHighlighter: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  // This is a simplified implementation. Consider using a library like Prism.js or highlight.js
  return (
    <pre className={`language-${language} text-sm overflow-x-auto font-mono w-full max-w-full`}>
      <code className="whitespace-pre-wrap break-all sm:break-words md:whitespace-pre">{code}</code>
    </pre>
  );
};

// Section header component
// const SectionHeader: React.FC<{ 
//   icon: React.ReactNode; 
//   title: string; 
//   color: string;
// }> = ({ icon, title, color }) => {
//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: -10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="flex items-center gap-2 mb-2"
//     >
//       <div className={`p-2 rounded-lg ${color}`}>
//         {icon}
//       </div>
//       <h3 className="text-lg font-medium">{title}</h3>
//     </motion.div>
//   );
// };
// const SectionHeader: React.FC<{ 
//   icon: React.ReactNode; 
//   title: string; 
//   color: string;
// }> = ({ icon, title, color }) => {
//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: -10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="flex items-center gap-2 mb-2"
//     >
//       <div className={`p-2 rounded-lg ${color}`}>
//         {icon}
//       </div>
//       <h3 className="text-lg font-medium">{title}</h3>
//     </motion.div>
//   );
// };

// New Category Pill component
const CategoryPill: React.FC<{ category: string; index: number }> = ({ category, index }) => {
  const icons = [<GitBranch className="h-4 w-4" />, <Award className="h-4 w-4" />, <Star className="h-4 w-4" />];
  const colors = [
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors[index % 3]} border`}
    >
      {icons[index % 3]}
      <span className="text-xs font-medium whitespace-nowrap">{category}</span>
    </motion.div>
  );
};

// Solved Status Badge component
const SolvedBadge: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20"
    >
      <Check className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">Solved</span>
    </motion.div>
  );
};

const SolutionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth()
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  //const codeContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [isHeaderSticky, setIsHeaderSticky] = useState<boolean>(false);

  const { problemId } = location.state as { problemId: string };

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 10);
      console.log(isHeaderSticky, activeTab);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, isHeaderSticky]);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!problemId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/solution/${problemId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`
            },
            withCredentials: true
          }
        );
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SolutionData = response.data;
        if (data) {
          setSolution(data);
        } else {
          throw new Error('No solution data found.');
        }

      } catch (err) {
        console.error('Error fetching solution:', err);
        setError((err as Error).message);
      }

      setIsLoading(false);
    };

    fetchSolution();
  }, [problemId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  const openProblemLink = (url?: string) => url && window.open(url, "_blank");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Back Button */}
      <div className="max-w-[calc(100%-2rem)] md:max-w-[calc(100%-120px)] mx-auto my-4 flex items-center">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      {/* Header - modified to align with container width */}
      <div className="border rounded-lg w-full max-w-[calc(100%-2rem)] md:max-w-[calc(100%-120px)] mx-auto container mt-7">
        <div className="w-full">
          {solution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="py-4"
            >
              <div className="px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Title Section */}
                <motion.div
                  className="flex items-center gap-2 sm:gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 dark:bg-primary/20 shadow-inner border border-primary/10">
                    <TerminalSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                        {solution.title}
                      </h1>
                      {solution.solved && <SolvedBadge />}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Solution Explorer</p>
                  </div>
                </motion.div>

                {/* Solve Challenge button */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex justify-end"
                >
                  <Button
                    size="sm"
                    className="gap-1.5 text-sm group bg-primary hover:bg-primary/90  border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => openProblemLink(solution?.problemLink)}
                  >
                    <span>Solve Challenge</span>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>





      {/* Main Content */}
      <div className="container m-auto py-2 w-full max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] md:max-w-[calc(100%-120px)]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-t-primary border-primary/30 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Code className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3 text-red-500 p-6"
          >
            <div className="p-4 bg-red-500/10 rounded-full">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="font-medium">Login to view solution</p>
            <Button
              variant="outline"
              className="mt-4 border-red-500/20 text-red-500 hover:bg-red-500/10"
              onClick={() => navigate(-1)}
            >
              Return to Challenges
            </Button>
          </motion.div>
        ) : solution ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {/* Top Section - Description/Explanation and Code Solution Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-3">
              {/* Description and Explanation Section */}
              <motion.div variants={itemVariants}>
                <Card className="border shadow-md bg-card/95 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-3 h-full">
                    <Tabs defaultValue="description" onValueChange={setActiveTab} className="w-full h-full">
                      <TabsList className="grid grid-cols-2 bg-muted/30 p-1 rounded-sm">
                        <TabsTrigger
                          value="description"
                          className="text-sm font-medium transition-all data-[state=active]:shadow-sm data-[state=active]:bg-background/80"
                        >
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span>Description</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="explanation"
                          className="text-sm font-medium transition-all data-[state=active]:shadow-sm data-[state=active]:bg-background/80"
                        >
                          <div className="flex items-center gap-1.5">
                            <Lightbulb className="h-4 w-4" />
                            <span>Explanation</span>
                          </div>
                        </TabsTrigger>
                      </TabsList>

                      <div className="p-3 h-[calc(100%-48px)]">
                        <TabsContent value="description" className="m-0 h-full">
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <p className="text-muted-foreground leading-relaxed">
                                  {solution.description}
                                </p>
                              </motion.div>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="explanation" className="m-0 h-full">
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <p className="text-muted-foreground leading-relaxed">
                                  {solution.codeSnippets.explanation}
                                </p>
                              </motion.div>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Code Solution Section */}
              <motion.div variants={itemVariants} className="pt-0">
                <Card className="border shadow-md bg-card/95 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-0 h-full">
                    <Tabs
                      defaultValue="java"
                      className="w-full h-full"
                      onValueChange={setSelectedLanguage}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-b">
                        <div className="flex items-center gap-1.5 mb-2 sm:mb-0">
                          <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500">
                            <FileCode className="h-4 w-4" />
                          </div>
                          <h3 className="text-base font-medium">Solution Code</h3>
                        </div>
                        <div className="flex-1 flex justify-center mb-2 sm:mb-0">
                          <TabsList className="bg-background/80 light:bg-white-800/50  rounded-md border border-border/50">
                            {['java', 'python', 'cpp'].map((lang) => (
                              <TabsTrigger
                                key={lang}
                                value={lang}
                                className="px-3 py-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground/80 data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 rounded-md transition-all duration-300 light:font-black"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Code className="h-3.5 w-3.5" />
                                  {lang === 'python' ? 'Python' : lang === 'cpp' ? 'C++' : 'Java'}
                                </div>
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </div>
                        <CopyButton code={solution.codeSnippets[selectedLanguage as keyof SolutionData['codeSnippets']]} />
                      </div>

                      <div className="bg-gray-900 dark:bg-[#FEFAE0] w-full overflow-hidden">
                        {['java', 'python', 'cpp'].map((language) => (
                          <TabsContent key={language} value={language} className="m-0 h-full w-full">
                            <ScrollArea className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
                              <div className="flex w-full">
                                <div className="w-8 sm:w-10 text-right mr-1 sm:mr-2 text-black-500 select-none bg-white-800/30 dark:bg-gray-800/30 flex-shrink-0">
                                  {Array.from({
                                    length: solution.codeSnippets[language as keyof SolutionData['codeSnippets']].split('\n').length
                                  }, (_, i) => (
                                    <div key={i} className="py-0.5 px-1 sm:px-2 text-xs">{i + 1}</div>
                                  ))}
                                </div>
                                <motion.div
                                  key={language}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="font-mono flex-1 text-gray-200 dark:text-gray-800 pr-2 overflow-x-auto"
                                >
                                  <SyntaxHighlighter
                                    code={solution.codeSnippets[language as keyof SolutionData['codeSnippets']]}
                                    language={language}
                                  />
                                </motion.div>
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        ))}
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Bottom Section - Complexity and Categories */}
            <motion.div variants={itemVariants}>
              <Card className="border shadow-md bg-card/95 overflow-hidden hover:shadow-lg transition-all duration-300 mb-7">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Complexity Analysis */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-medium">Complexity Analysis</h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2.5 bg-purple-500/5 rounded-lg border border-purple-500/10 transition-all duration-300 hover:border-purple-500/20">
                          <div className="p-1.5 bg-purple-500/10 rounded-full">
                            <Clock className="h-4 w-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Time Complexity</p>
                            <p className="font-mono text-sm font-medium">{solution.codeSnippets.timeComplexity}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-2.5 bg-purple-500/5 rounded-lg border border-purple-500/10 transition-all duration-300 hover:border-purple-500/20">
                          <div className="p-1.5 bg-purple-500/10 rounded-full">
                            <Database className="h-4 w-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Space Complexity</p>
                            <p className="font-mono text-sm font-medium">{solution.codeSnippets.spaceComplexity}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problem Categories */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Tag className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-medium">Problem Categories</h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {solution.category?.map((category, index) => (
                          <CategoryPill key={index} category={category} index={index} />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default SolutionPage;
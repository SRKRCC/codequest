import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  X,
  Calendar,
  Link2,
  Award,
  BarChart3,
  Tag,
  PenLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/Admin/datepicker";
import toast from 'react-hot-toast'


const difficultyOptions = ["Easy", "Medium", "Hard"];
const platformOptions = ["LeetCode", "GeeksforGeeks", "CodeChef", "Codeforces"];

export default function Admin() {
  const currentDate = new Date();
  const location = useLocation();
  const isFromAdmin = location.state?.fromAdmin || false;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: [] as string[],
    difficulty: "Easy",
    points: 5,
    problemLink: "",
    createdAt: currentDate,
    platform: "",
    solutions: {
      explanation: "",
      cpp: "",
      java: "",
      python: "",
      timeComplexity: "",
      spaceComplexity: ""
    },

  });
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [formProgress, setFormProgress] = useState(0);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    // Fetch categories on component mount
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setCategoryOptions(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (isFromAdmin) {
      // If opened from Admin, fetch today's challenge from backend
      const fetchTodayChallenge = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/admin/getPotd`,
            { withCredentials: true }
          );
          const challenge = res.data.challenge;
          if (!challenge) return;

          setFormData({
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            difficulty: challenge.difficulty,
            points: challenge.points,
            problemLink: challenge.problemLink,
            platform: challenge.platform,
            createdAt: new Date(challenge.createdAt),
            solutions: {
              explanation: challenge.solution?.explanation || "",
              cpp: challenge.solution?.cpp || "",
              java: challenge.solution?.java || "",
              python: challenge.solution?.python || "",
              timeComplexity: challenge.solution?.timeComplexity || "",
              spaceComplexity: challenge.solution?.spaceComplexity || "",
            },
          });

          setChallengeId(challenge._id);
        } catch (error) {
          console.log("No challenge for today — creating new one.");
        }
      };

      fetchTodayChallenge();
    }
  }, [isFromAdmin]);


  // Calculate form completion progress
  useEffect(() => {
    let completed = 0;
    const totalFields = 7; // Total number of required fields (excluding solutions)

    if (formData.title) completed++;
    if (formData.description) completed++;
    if (formData.category.length > 0) completed++;
    if (formData.difficulty) completed++;
    if (formData.points > 0) completed++;
    if (formData.platform) completed++;
    if (formData.problemLink) completed++;

    setFormProgress(Math.round((completed / totalFields) * 100));
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSolutionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    language: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      solutions: { ...prev.solutions, [language]: e.target.value },
    }));
  };

  // const handleDifficultyChange = (value: string) => {
  //   setFormData((prev) => ({ ...prev, difficulty: value }));
  // };
  const handleDifficultyChange = (value: string) => {
    const points = calculatePoints(value);
    setFormData((prev) => ({
      ...prev,
      difficulty: value,
      points: points
    }));
  };

  const handlePlatformChange = (value: string) => {
    setFormData((prev) => ({ ...prev, platform: value }));
  };

  const addCategory = (category: string) => {
    if (!formData.category.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, category],
      }));
    }
    setShowCategories(false);
  };

  const addCustomCategory = () => {
    if (newCategory && !formData.category.includes(newCategory)) {
      setFormData((prev) => ({
        ...prev,
        category: [...prev.category, newCategory],
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.filter((c) => c !== category),
    }));
  };

  // const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const date = new Date(e.target.value);
  //   if (!isNaN(date.getTime())) {
  //     setFormData((prev) => ({ ...prev, createdAt: date }));
  //   }
  // };

  // const formatDateForInput = (date: Date) => {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      challengeId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      points: formData.points,
      problemLink: formData.problemLink,
      platform: formData.platform,
      createdAt: formData.createdAt,
      solution: formData.solutions,
    };

    try {
      const endpoint = challengeId
        ? `${import.meta.env.VITE_API_BASE_URL}/api/admin/update-challenge`
        : `${import.meta.env.VITE_API_BASE_URL}/api/admin/add-challenges`;

      const response = challengeId ?
        await axios.put(endpoint, payload, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        })
        : await axios.post(endpoint, payload, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

      toast.success(
        challengeId
          ? `Challenge "${formData.title}" updated successfully!`
          : `Challenge "${formData.title}" created successfully!`
      );

      console.log("Challenge saved:", response.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred while creating the challenge.");
      } else {
        toast.error("An error occurred while creating the challenge.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Easy") return "text-emerald-500 border-emerald-500";
    if (difficulty === "Medium") return "text-amber-500 border-amber-500";
    return "text-rose-500 border-rose-500";
  };

  const calculatePoints = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 5;
      case 'Medium':
        return 10;
      case 'Hard':
        return 15;
      default:
        return 0;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto max-w-4xl px-4 py-8"
    >
      <Card className="overflow-hidden border shadow-xl bg-gradient-to-br from-card to-card/80">
        <CardHeader className="pb-4 pt-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle className="text-3xl font-bold text-foreground">
              Create New Challenge
            </CardTitle>
            {formProgress > 0 && (
              <div className="mt-4 flex flex-col items-center">
                <div className="mb-2 w-full max-w-sm rounded-full bg-secondary">
                  <motion.div
                    className="h-2 rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${formProgress}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{formProgress}% completed</p>
              </div>
            )}
          </motion.div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Details
              </TabsTrigger>
              <TabsTrigger value="categorization" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Categorization
              </TabsTrigger>
              <TabsTrigger value="Solutions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Solutions
              </TabsTrigger>
              <TabsTrigger value="publish" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Publish
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <TabsContent value="details">
                <motion.div className="space-y-6" variants={containerVariants}>
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="flex items-center text-lg font-medium text-foreground"
                    >
                      <PenLine className="mr-2 h-5 w-5" />
                      Challenge Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter a descriptive title"
                      className="border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="flex items-center text-lg font-medium text-foreground"
                    >
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Provide a detailed description of the challenge"
                      className="min-h-[150px] border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    />
                  </motion.div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("categorization")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="categorization">
                <motion.div className="space-y-6" variants={containerVariants}>
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label className="flex items-center text-lg font-medium text-foreground">
                      <Tag className="mr-2 h-5 w-5" />
                      Categories
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {formData.category.map((cat) => (
                          <motion.div
                            key={cat}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground"
                          >
                            {cat}
                            <button
                              type="button"
                              onClick={() => removeCategory(cat)}
                              className="ml-1 rounded-full p-1 text-primary hover:bg-muted hover:text-primary"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="relative mt-3">
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCategories(!showCategories)}
                                className="flex w-full items-center justify-between border-gray-600 bg-card text-foreground hover:bg-muted hover:text-foreground"
                              >
                                {formData.category.length > 0
                                  ? `${formData.category.length} Categories Selected`
                                  : "Select Categories"}
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${showCategories ? "rotate-180" : ""}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Click to select from predefined categories
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <AnimatePresence>
                        {showCategories && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-600 bg-popover p-2 shadow-lg"
                          >
                            <div className="grid grid-cols-2 gap-1">
                              {isLoadingCategories ? (
                                <div className="col-span-2 text-center py-4">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                                  <p className="text-sm text-muted-foreground mt-2">Loading categories...</p>
                                </div>
                              ) : categoryOptions.length > 0 ? (
                                categoryOptions.map((category) => (
                                  <Button
                                    key={category}
                                    type="button"
                                    variant="ghost"
                                    onClick={() => addCategory(category)}
                                    className={`justify-start text-left text-sm ${formData.category.includes(category)
                                      ? "bg-primary/20 text-foreground"
                                      : "text-muted-foreground hover:bg-muted"
                                      }`}
                                  >
                                    {category}
                                  </Button>
                                ))
                              ) : (
                                <div className="col-span-2 text-center py-4">
                                  <p className="text-sm text-muted-foreground">No categories available</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Add custom category"
                                className="h-8 border-gray-600 text-sm bg-card text-foreground"
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={addCustomCategory}
                                disabled={!newCategory}
                                className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label className="flex items-center text-lg font-medium text-foreground">
                      <Award className="mr-2 h-5 w-5" />
                      Difficulty
                    </Label>
                    <div className="mt-2">
                      <RadioGroup
                        value={formData.difficulty}
                        onValueChange={handleDifficultyChange}
                        className="flex gap-4"
                      >
                        {difficultyOptions.map((difficulty) => (
                          <div key={difficulty} className="flex items-center">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 transition-all ${formData.difficulty === difficulty
                                ? getDifficultyColor(difficulty) + " bg-secondary/20"
                                : "border-gray-600 hover:border-gray-500"
                                }`}
                            >
                              <RadioGroupItem
                                value={difficulty}
                                id={`difficulty-${difficulty.toLowerCase()}`}
                                className={getDifficultyColor(difficulty)}
                              />
                              <Label
                                htmlFor={`difficulty-${difficulty.toLowerCase()}`}
                                className={`cursor-pointer font-medium ${formData.difficulty === difficulty
                                  ? getDifficultyColor(difficulty)
                                  : "text-foreground"
                                  }`}
                              >
                                {difficulty}
                              </Label>
                            </motion.div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </motion.div>



                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="points"
                      className="flex items-center text-lg font-medium text-foreground"
                    >
                      <Award className="mr-2 h-5 w-5" />
                      Points (Auto-calculated)
                    </Label>
                    <Input
                      id="points"
                      name="points"
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={handleChange}
                      disabled
                      className="border-gray-600 bg-muted text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary opacity-75"
                    />
                    <p className="text-sm text-muted-foreground">
                      Points are automatically set based on difficulty: Easy (5), Medium (10), Hard (15)
                    </p>
                  </motion.div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                      className="border-gray-600 bg-card"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("Solutions")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="Solutions">
                <motion.div className="space-y-6" variants={containerVariants}>
                  <motion.div variants={itemVariants} className="space-y-4">

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label
                        htmlFor="explanation"
                        className="flex items-center text-lg font-medium text-foreground"
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Explanation
                      </Label>
                      <Textarea
                        id="explanation"
                        name="explanation"
                        value={formData.solutions.explanation}
                        onChange={(e) => handleSolutionChange(e, "explanation")}
                        required
                        placeholder="Provide a Explanation Of the Problem"
                        className="min-h-[150px] border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label
                        htmlFor="cpp-solution"
                        className="flex items-center text-lg font-medium text-foreground"
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        C++ Solution
                      </Label>
                      <Textarea
                        id="cpp-solution"
                        name="cpp-solution"
                        value={formData.solutions.cpp}
                        onChange={(e) => handleSolutionChange(e, "cpp")}
                        required
                        placeholder="Provide a solution in C++"
                        className="min-h-[150px] border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label
                        htmlFor="java-solution"
                        className="flex items-center text-lg font-medium text-foreground"
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Java Solution
                      </Label>
                      <Textarea
                        id="java-solution"
                        name="java-solution"
                        value={formData.solutions.java}
                        onChange={(e) => handleSolutionChange(e, "java")}
                        required
                        placeholder="Provide a solution in Java"
                        className="min-h-[150px] border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label
                        htmlFor="python-solution"
                        className="flex items-center text-lg font-medium text-foreground"
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Python Solution
                      </Label>
                      <Textarea
                        id="python-solution"
                        name="python-solution"
                        value={formData.solutions.python}
                        onChange={(e) => handleSolutionChange(e, "python")}
                        required
                        placeholder="Provide a solution in Python"
                        className="min-h-[150px] border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label
                        htmlFor="timeComplexity"
                        className="flex items-center text-lg font-medium text-foreground"
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Time Complexity
                      </Label>
                      <input
                        type="text"
                        id="timeComplexity"
                        name="timeComplexity"
                        value={formData.solutions.timeComplexity}
                        onChange={(e) => handleSolutionChange(e, "timeComplexity")}
                        required
                        placeholder="Enter time complexity (e.g., O(n))"
                        className="w-full px-3 py-2 h-10 rounded-md border border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label
                        htmlFor="spaceComplexity"
                        className="flex items-center text-lg font-medium text-foreground"
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Space Complexity
                      </Label>
                      <input
                        type="text"
                        id="spaceComplexity"
                        name="spaceComplexity"
                        value={formData.solutions.spaceComplexity}
                        onChange={(e) => handleSolutionChange(e, "spaceComplexity")}
                        required
                        placeholder="Enter space complexity (e.g., O(n))"
                        className="w-full px-3 py-2 h-10 rounded-md border border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </motion.div>
                  </motion.div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("publish")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="publish">
                <motion.div className="space-y-6" variants={containerVariants}>
                  <motion.div variants={itemVariants} className="space-y-2">
                    <DatePicker
                      id="createdAt"
                      label="Creation Date"
                      selectedDate={formData.createdAt}
                      onChange={(date) => setFormData((prev) => ({ ...prev, createdAt: date }))}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="platform"
                      className="flex items-center text-lg font-medium text-foreground"
                    >
                      <Tag className="mr-2 h-5 w-5" />
                      Platform
                    </Label>
                    <Select
                      onValueChange={handlePlatformChange}
                      value={formData.platform}
                      required
                    >
                      <SelectTrigger className="border-gray-600 bg-card text-foreground focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-gray-600">
                        {platformOptions.map((platform) => (
                          <SelectItem
                            key={platform}
                            value={platform}
                            className="text-foreground hover:bg-muted"
                          >
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label
                      htmlFor="problemLink"
                      className="flex items-center text-lg font-medium text-foreground"
                    >
                      <Link2 className="mr-2 h-5 w-5" />
                      Problem Link
                    </Label>
                    <Input
                      id="problemLink"
                      name="problemLink"
                      type="url"
                      value={formData.problemLink}
                      onChange={handleChange}
                      required
                      placeholder="https://example.com/problem"
                      className="border-gray-600 bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                    />
                  </motion.div>

                  <div className="flex flex-col gap-4 pt-6">
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-lg bg-card/20 p-4 shadow"
                    >
                      <h3 className="mb-2 text-lg font-semibold">Challenge Summary</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <PenLine className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Title: {formData.title}</span>
                        </div>
                        {/* <div>{formData.title || "Not set"}</div> */}

                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Difficulty: {formData.difficulty}</span>

                        </div>
                        {/* <div className={getDifficultyColor(formData.difficulty).split(" ")[0]}>
                          {formData.difficulty}
                        </div> */}

                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Categories: {formData.category.length ? formData.category.join(", ") : "None"}</span>
                        </div>
                        {/* <div>{formData.category.length ? formData.category.join(", ") : "None"}</div> */}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Date:{formData.createdAt.toLocaleDateString()}</span>
                        </div>
                        {/* <div>{formData.createdAt.toLocaleDateString()}</div> */}
                      </div>
                    </motion.div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("Solutions")}
                        className="border-gray-600 bg-card"
                      >
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-32 bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-lg disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                            <span>{challengeId ? "Updating..." : "Creating..."}</span>
                          </div>
                        ) : (
                          <span>{challengeId ? "Update" : "Publish"}</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
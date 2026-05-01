"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, CheckCircle, User, Mail, Hash, BookOpen, Building, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function CodingClubForm() {
  const [image, setImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300 } },
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background"></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl z-10"
      >
        <Card className="border border-border/50 shadow-lg backdrop-blur-sm bg-card/80">
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Coding Club Registration
                </h1>
                <p className="text-muted-foreground mt-2">Join our community of passionate coders</p>
              </motion.div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* User Image Upload */}
                <motion.div variants={item} className="md:col-span-2 flex flex-col items-center justify-center">
                  <div
                    className="relative w-32 h-32 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary transition-colors duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {image ? (
                      <img src={image || "/placeholder.svg"} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-10 h-10 mx-auto text-primary group-hover:scale-110 transition-transform duration-300" />
                        <p className="text-xs mt-2 text-muted-foreground">Upload Photo</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div variants={item} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className="bg-background/50 border-input focus:border-primary transition-colors duration-300 pl-3"
                      />
                      <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-primary transition-all duration-300"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="Choose a username"
                      className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                    />
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register" className="flex items-center gap-2">
                      <Hash className="w-4 h-4" /> Register Number
                    </Label>
                    <Input
                      id="register"
                      placeholder="Enter your register number"
                      className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Branch
                    </Label>
                    <Input
                      id="branch"
                      placeholder="Enter your branch"
                      className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college" className="flex items-center gap-2">
                      <Building className="w-4 h-4" /> College
                    </Label>
                    <Input
                      id="college"
                      placeholder="Enter your college name"
                      className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                    />
                  </div>
                </motion.div>

                {/* Coding Profiles */}
                <motion.div variants={item} className="md:col-span-2">
                  <div className="bg-secondary/20 rounded-lg p-4 border border-border/50">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-primary" /> Coding Profiles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leetcode">LeetCode</Label>
                        <Input
                          id="leetcode"
                          placeholder="Your LeetCode username"
                          className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="codeforces">CodeForces</Label>
                        <Input
                          id="codeforces"
                          placeholder="Your CodeForces username"
                          className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="geeksforgeeks">GeeksForGeeks</Label>
                        <Input
                          id="geeksforgeeks"
                          placeholder="Your GeeksForGeeks username"
                          className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="codechef">CodeChef</Label>
                        <Input
                          id="codechef"
                          placeholder="Your CodeChef username"
                          className="bg-background/50 border-input focus:border-primary transition-colors duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Checkbox and Submit */}
                <motion.div variants={item} className="md:col-span-2 space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="affiliate" />
                    <Label
                      htmlFor="affiliate"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Are you an SRKR CODING CLUB Affiliate?
                    </Label>
                  </div>

                  <motion.div className="flex justify-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full md:w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden"
                      size="lg"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 group-hover:animate-pulse" />
                        Save Registration
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
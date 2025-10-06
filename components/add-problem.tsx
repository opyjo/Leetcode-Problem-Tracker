"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  PATTERNS,
  DIFFICULTIES,
  calculateNextReview,
  getTargetTime,
} from "@/lib/types";
import { PythonPlayground } from "@/components/python-playground";
import { TypeScriptEditor } from "@/components/typescript-playground";
import { MarkdownEditor } from "@/components/markdown-editor";
import { FullscreenPlayground } from "@/components/fullscreen-playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export function AddProblem() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullscreenPlayground, setShowFullscreenPlayground] =
    useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pattern: "",
    difficulty: "",
    keyClue: "",
    approach: "",
    notes: "",
    solution: "",
    solutionTypeScript: "",
    leetcodeUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.pattern ||
      !formData.difficulty ||
      !formData.keyClue
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const difficulty = formData.difficulty as "Easy" | "Medium" | "Hard";

      const { error } = await supabase.from("problems").insert({
        name: formData.name,
        pattern: formData.pattern,
        difficulty,
        key_clue: formData.keyClue,
        approach: formData.approach || "",
        date_solved: now,
        confidence: 3,
        last_reviewed: now,
        next_review: calculateNextReview(3, 0).toISOString(),
        review_count: 0,
        attempts: [],
        target_time: getTargetTime(difficulty),
        notes: formData.notes || "",
        solution: formData.solution || "",
        solution_typescript: formData.solutionTypeScript || null,
        mistakes: [],
        leetcode_url: formData.leetcodeUrl || null,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Problem added!",
        description: `${formData.name} has been saved to your tracker`,
      });

      // Reset form
      setFormData({
        name: "",
        pattern: "",
        difficulty: "",
        keyClue: "",
        approach: "",
        notes: "",
        solution: "",
        solutionTypeScript: "",
        leetcodeUrl: "",
      });

      // Trigger a refresh of the problems list
      window.dispatchEvent(new Event("problems-updated"));
    } catch (error) {
      console.error("Error adding problem:", error);
      toast({
        title: "Error",
        description: "Failed to add problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Problem</CardTitle>
        <CardDescription>
          Track a problem you've solved and the pattern you used
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Problem Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Two Sum"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern *</Label>
              <Select
                value={formData.pattern}
                onValueChange={(value) =>
                  setFormData({ ...formData, pattern: value })
                }
              >
                <SelectTrigger id="pattern">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {PATTERNS.map((pattern) => (
                    <SelectItem key={pattern} value={pattern}>
                      {pattern}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyClue">Key Clue *</Label>
            <Input
              id="keyClue"
              placeholder="What told you to use this pattern?"
              value={formData.keyClue}
              onChange={(e) =>
                setFormData({ ...formData, keyClue: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              One sentence describing the hint that led to the pattern
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approach">Your Approach</Label>
            <MarkdownEditor
              value={formData.approach}
              onChange={(value) =>
                setFormData({ ...formData, approach: value })
              }
              placeholder="Explain your approach..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">Solution Code & Playground</Label>
            <Tabs defaultValue="python" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              </TabsList>
              <TabsContent value="python">
                <PythonPlayground
                  initialCode={
                    formData.solution ||
                    "# Write your Python solution here\ndef solution():\n    # Your code\n    pass\n\nprint(solution())"
                  }
                  onCodeChange={(newCode) =>
                    setFormData({ ...formData, solution: newCode })
                  }
                  readOnly={false}
                  onExpand={() => setShowFullscreenPlayground(true)}
                  showExpandButton={true}
                />
              </TabsContent>
              <TabsContent value="typescript">
                <TypeScriptEditor
                  initialCode={
                    formData.solutionTypeScript ||
                    "// Write your TypeScript solution here\nfunction solution(): void {\n  // Your code\n}\n\nconsole.log(solution());"
                  }
                  onCodeChange={(newCode) =>
                    setFormData({ ...formData, solutionTypeScript: newCode })
                  }
                  readOnly={false}
                  onExpand={() => setShowFullscreenPlayground(true)}
                  showExpandButton={true}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes, gotchas, or things to remember..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leetcodeUrl">LeetCode URL</Label>
            <Input
              id="leetcodeUrl"
              type="url"
              placeholder="https://leetcode.com/problems/..."
              value={formData.leetcodeUrl}
              onChange={(e) =>
                setFormData({ ...formData, leetcodeUrl: e.target.value })
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Problem"}
          </Button>
        </form>
      </CardContent>

      {/* Fullscreen Playground Modal */}
      <FullscreenPlayground
        open={showFullscreenPlayground}
        onClose={() => setShowFullscreenPlayground(false)}
        pythonCode={
          formData.solution ||
          "# Write your Python solution here\ndef solution():\n    # Your code\n    pass\n\nprint(solution())"
        }
        typescriptCode={
          formData.solutionTypeScript ||
          "// Write your TypeScript solution here\nfunction solution(): void {\n  // Your code\n}\n\nconsole.log(solution());"
        }
        onPythonCodeChange={(newCode) =>
          setFormData({ ...formData, solution: newCode })
        }
        onTypeScriptCodeChange={(newCode) =>
          setFormData({ ...formData, solutionTypeScript: newCode })
        }
        readOnly={false}
      />
    </Card>
  );
}

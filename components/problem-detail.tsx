"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit2,
  Save,
  X,
  Trash2,
  ExternalLink,
  Clock,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PATTERNS, DIFFICULTIES, type Problem } from "@/lib/types";
import { PythonPlayground } from "@/components/python-playground";
import { TypeScriptEditor } from "@/components/typescript-playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

interface ProblemDetailProps {
  problem: Problem | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProblemDetail({
  problem,
  open,
  onClose,
  onUpdate,
}: ProblemDetailProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProblem, setEditedProblem] = useState<Problem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditedProblem(problem);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProblem(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedProblem) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("problems")
        .update({
          name: editedProblem.name,
          pattern: editedProblem.pattern,
          difficulty: editedProblem.difficulty,
          key_clue: editedProblem.keyClue,
          approach: editedProblem.approach,
          confidence: editedProblem.confidence,
          notes: editedProblem.notes,
          solution: editedProblem.solution,
          solution_typescript: editedProblem.solutionTypeScript || null,
          leetcode_url: editedProblem.leetcodeUrl || null,
        })
        .eq("id", editedProblem.id);

      if (error) throw error;

      toast({
        title: "Problem updated",
        description: "Your changes have been saved successfully",
      });

      setIsEditing(false);
      setEditedProblem(null);
      onUpdate();
      window.dispatchEvent(new Event("problems-updated"));
    } catch (error) {
      console.error("Error updating problem:", error);
      toast({
        title: "Error",
        description: "Failed to update problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!problem) return;

    try {
      const { error } = await supabase
        .from("problems")
        .delete()
        .eq("id", problem.id);

      if (error) throw error;

      toast({
        title: "Problem deleted",
        description: "The problem has been removed from your tracker",
      });

      onClose();
      onUpdate();
      window.dispatchEvent(new Event("problems-updated"));
    } catch (error) {
      console.error("Error deleting problem:", error);
      toast({
        title: "Error",
        description: "Failed to delete problem. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (editedProblem) {
      setEditedProblem({ ...editedProblem, solution: newCode });
    }
  };

  const handleTypeScriptCodeChange = (newCode: string) => {
    if (editedProblem) {
      setEditedProblem({ ...editedProblem, solutionTypeScript: newCode });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const currentProblem = isEditing ? editedProblem : problem;

  if (!currentProblem) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedProblem?.name || ""}
                  onChange={(e) =>
                    setEditedProblem(
                      editedProblem
                        ? { ...editedProblem, name: e.target.value }
                        : null
                    )
                  }
                  className="text-xl font-bold"
                />
              ) : (
                <DialogTitle className="text-2xl">
                  {currentProblem.name}
                </DialogTitle>
              )}
              <div className="flex items-center gap-2 mt-2">
                {isEditing ? (
                  <>
                    <Select
                      value={editedProblem?.difficulty}
                      onValueChange={(value) =>
                        setEditedProblem(
                          editedProblem
                            ? { ...editedProblem, difficulty: value }
                            : null
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {diff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={editedProblem?.pattern}
                      onValueChange={(value) =>
                        setEditedProblem(
                          editedProblem
                            ? { ...editedProblem, pattern: value }
                            : null
                        )
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PATTERNS.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>
                            {pattern}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Badge
                      className={getDifficultyColor(currentProblem.difficulty)}
                    >
                      {currentProblem.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentProblem.pattern}</Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Star className="w-4 h-4" />
                Confidence
              </div>
              <div className="text-2xl font-bold">
                {currentProblem.confidence
                  ? `${currentProblem.confidence}/5`
                  : "Not rated"}
              </div>
              {Boolean(currentProblem.confidence) && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= currentProblem.confidence
                          ? "fill-primary text-primary"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="w-4 h-4" />
                Best Time
              </div>
              <div className="text-2xl font-bold">
                {currentProblem.attempts && currentProblem.attempts.length > 0
                  ? formatTime(
                      Math.min(
                        ...currentProblem.attempts.map((a) => a.timeSpent)
                      )
                    )
                  : "N/A"}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Attempts
              </div>
              <div className="text-2xl font-bold">
                {currentProblem.attempts?.length || 0}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Last Review
              </div>
              <div className="text-sm font-medium">
                {currentProblem.lastReviewed
                  ? new Date(currentProblem.lastReviewed).toLocaleDateString()
                  : "Never"}
              </div>
            </div>
          </div>

          <Separator />

          {/* Key Clue */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Key Clue
            </Label>
            {isEditing ? (
              <Textarea
                value={editedProblem?.keyClue || ""}
                onChange={(e) =>
                  setEditedProblem(
                    editedProblem
                      ? { ...editedProblem, keyClue: e.target.value }
                      : null
                  )
                }
                rows={2}
              />
            ) : (
              <p className="text-muted-foreground">{currentProblem.keyClue}</p>
            )}
          </div>

          {/* Approach */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Your Approach
            </Label>
            {isEditing ? (
              <Textarea
                value={editedProblem?.approach || ""}
                onChange={(e) =>
                  setEditedProblem(
                    editedProblem
                      ? { ...editedProblem, approach: e.target.value }
                      : null
                  )
                }
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {currentProblem.approach || "No approach saved"}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-base font-semibold mb-2 block">Notes</Label>
            {isEditing ? (
              <Textarea
                value={editedProblem?.notes || ""}
                onChange={(e) =>
                  setEditedProblem(
                    editedProblem
                      ? { ...editedProblem, notes: e.target.value }
                      : null
                  )
                }
                rows={4}
                placeholder="Add your personal notes, insights, or things to remember..."
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {currentProblem.notes || "No notes added"}
              </p>
            )}
          </div>

          {/* Solution with Code Playground */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Solution Code & Playground
            </Label>
            <Tabs defaultValue="python" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              </TabsList>
              <TabsContent value="python">
                <PythonPlayground
                  initialCode={
                    currentProblem.solution ||
                    "# Write your Python solution here\ndef solution():\n    # Your code\n    pass\n\nprint(solution())"
                  }
                  onCodeChange={isEditing ? handleCodeChange : undefined}
                  readOnly={!isEditing}
                />
              </TabsContent>
              <TabsContent value="typescript">
                <TypeScriptEditor
                  initialCode={
                    currentProblem.solutionTypeScript ||
                    "// Write your TypeScript solution here\nfunction solution(): void {\n  // Your code\n}\n\nconsole.log(solution());"
                  }
                  onCodeChange={
                    isEditing ? handleTypeScriptCodeChange : undefined
                  }
                  readOnly={!isEditing}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* LeetCode URL */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              LeetCode URL
            </Label>
            {isEditing ? (
              <Input
                value={editedProblem?.leetcodeUrl || ""}
                onChange={(e) =>
                  setEditedProblem(
                    editedProblem
                      ? { ...editedProblem, leetcodeUrl: e.target.value }
                      : null
                  )
                }
                placeholder="https://leetcode.com/problems/..."
              />
            ) : currentProblem.leetcodeUrl ? (
              <a
                href={currentProblem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2"
              >
                {currentProblem.leetcodeUrl}
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <p className="text-muted-foreground">No URL added</p>
            )}
          </div>

          {/* Attempt History */}
          {currentProblem.attempts && currentProblem.attempts.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Attempt History
              </Label>
              <div className="space-y-2">
                {currentProblem.attempts.map((attempt) => (
                  <div
                    key={attempt.date}
                    className="bg-muted/50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(attempt.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatTime(attempt.timeSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {currentProblem.mistakes && currentProblem.mistakes.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Common Mistakes
              </Label>
              <ul className="space-y-2">
                {currentProblem.mistakes.map((mistake) => (
                  <li
                    key={mistake}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-destructive mt-1">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

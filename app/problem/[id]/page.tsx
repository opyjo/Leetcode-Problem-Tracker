"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PATTERNS,
  DIFFICULTIES,
  type Problem,
  type Attempt,
} from "@/lib/types";
import { PythonPlayground } from "@/components/python-playground";
import { supabase } from "@/lib/supabase";

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProblem, setEditedProblem] = useState<Problem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadProblem(params.id as string);
    }
  }, [params.id]);

  const loadProblem = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const transformedProblem: Problem = {
          id: data.id,
          name: data.name,
          pattern: data.pattern,
          difficulty: data.difficulty as "Easy" | "Medium" | "Hard",
          keyClue: data.key_clue,
          approach: data.approach,
          dateSolved: data.date_solved,
          confidence: data.confidence,
          lastReviewed: data.last_reviewed,
          nextReview: data.next_review,
          reviewCount: data.review_count,
          attempts: (data.attempts as Attempt[]) || [],
          targetTime: data.target_time,
          notes: data.notes,
          solution: data.solution,
          mistakes: (data.mistakes as string[]) || [],
          leetcodeUrl: data.leetcode_url || undefined,
        };
        setProblem(transformedProblem);
      }
    } catch (error) {
      console.error("Error loading problem:", error);
      toast({
        title: "Error",
        description: "Failed to load problem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          leetcode_url: editedProblem.leetcodeUrl || null,
        })
        .eq("id", editedProblem.id);

      if (error) throw error;

      toast({
        title: "Problem updated",
        description: "Your changes have been saved successfully",
      });

      setProblem(editedProblem);
      setIsEditing(false);
      setEditedProblem(null);
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

    if (!confirm("Are you sure you want to delete this problem?")) return;

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

      window.dispatchEvent(new Event("problems-updated"));
      router.push("/");
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-muted-foreground">Loading problem...</div>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-muted-foreground">Problem not found</div>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Problems
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Problems
          </Button>
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
            <h1 className="text-3xl font-bold">{currentProblem.name}</h1>
          )}
          <div className="flex items-center gap-2 mt-2">
            {isEditing ? (
              <>
                <Select
                  value={editedProblem?.difficulty}
                  onValueChange={(value) =>
                    setEditedProblem(
                      editedProblem
                        ? { ...editedProblem, difficulty: value as any }
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
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
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
                    Math.min(...currentProblem.attempts.map((a) => a.timeSpent))
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
          <Label className="text-base font-semibold mb-2 block">Key Clue</Label>
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

        {/* Solution with Python Playground */}
        <div>
          <Label className="text-base font-semibold mb-2 block">
            Solution Code & Playground
          </Label>
          <PythonPlayground
            initialCode={
              currentProblem.solution ||
              "# Write your Python solution here\ndef solution():\n    # Your code\n    pass\n\nprint(solution())"
            }
            onCodeChange={isEditing ? handleCodeChange : undefined}
            readOnly={!isEditing}
            height="600px"
          />
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
    </div>
  );
}

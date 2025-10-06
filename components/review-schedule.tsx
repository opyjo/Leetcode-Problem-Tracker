"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Brain,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { type Problem, type Attempt, calculateNextReview } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function ReviewSchedule() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [dueProblems, setDueProblems] = useState<Problem[]>([]);
  const [upcomingProblems, setUpcomingProblems] = useState<Problem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProblems();

    // Listen for updates
    const handleUpdate = () => loadProblems();
    window.addEventListener("problems-updated", handleUpdate);
    return () => window.removeEventListener("problems-updated", handleUpdate);
  }, []);

  const loadProblems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("next_review", { ascending: true });

      if (error) throw error;

      // Transform database rows to Problem type
      const transformedProblems: Problem[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        pattern: row.pattern,
        difficulty: row.difficulty as "Easy" | "Medium" | "Hard",
        keyClue: row.key_clue,
        approach: row.approach,
        dateSolved: row.date_solved,
        confidence: row.confidence,
        lastReviewed: row.last_reviewed,
        nextReview: row.next_review,
        reviewCount: row.review_count,
        attempts: (row.attempts as Attempt[]) || [],
        targetTime: row.target_time,
        notes: row.notes,
        solution: row.solution,
        mistakes: (row.mistakes as string[]) || [],
        leetcodeUrl: row.leetcode_url || undefined,
      }));

      setProblems(transformedProblems);

      const now = new Date();
      const due: Problem[] = [];
      const upcoming: Problem[] = [];

      transformedProblems.forEach((problem: Problem) => {
        const nextReview = new Date(problem.nextReview);
        if (nextReview <= now) {
          due.push(problem);
        } else {
          upcoming.push(problem);
        }
      });

      // Sort by next review date
      due.sort(
        (a, b) =>
          new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
      );
      upcoming.sort(
        (a, b) =>
          new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
      );

      setDueProblems(due);
      setUpcomingProblems(upcoming);
    } catch (error) {
      console.error("Error loading problems:", error);
      toast({
        title: "Error",
        description: "Failed to load problems",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsReviewed = async (problemId: string, confidence: number) => {
    try {
      const problem = problems.find((p) => p.id === problemId);
      if (!problem) return;

      const now = new Date().toISOString();
      const newReviewCount =
        confidence >= 4 ? problem.reviewCount + 1 : problem.reviewCount;
      const nextReview = calculateNextReview(
        confidence,
        newReviewCount
      ).toISOString();

      const { error } = await supabase
        .from("problems")
        .update({
          confidence,
          last_reviewed: now,
          next_review: nextReview,
          review_count: newReviewCount,
        })
        .eq("id", problemId);

      if (error) throw error;

      toast({
        title: "Review recorded!",
        description: `Next review scheduled based on confidence level ${confidence}`,
      });

      loadProblems();
      window.dispatchEvent(new Event("problems-updated"));
    } catch (error) {
      console.error("Error marking as reviewed:", error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence <= 2) return "bg-destructive";
    if (confidence === 3) return "bg-yellow-500";
    return "bg-success";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueProblems.length}</p>
                <p className="text-sm text-muted-foreground">Due for Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingProblems.length}</p>
                <p className="text-sm text-muted-foreground">
                  Upcoming Reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{problems.length}</p>
                <p className="text-sm text-muted-foreground">Total Problems</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due for Review */}
      <Card>
        <CardHeader>
          <CardTitle>Due for Review</CardTitle>
          <CardDescription>
            {dueProblems.length === 0
              ? "Great job! No problems due for review right now."
              : "Review these problems to maintain your mastery"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dueProblems.map((problem) => (
            <div
              key={problem.id}
              className="border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-foreground truncate">
                      {problem.name}
                    </h3>
                    {problem.leetcodeUrl && (
                      <a
                        href={problem.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(problem.difficulty)}
                    >
                      {problem.difficulty}
                    </Badge>
                    <Badge variant="outline">{problem.pattern}</Badge>
                    <span className="text-muted-foreground">
                      Last reviewed:{" "}
                      {new Date(problem.lastReviewed).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getConfidenceColor(
                          problem.confidence
                        )}`}
                      />
                      <span className="text-muted-foreground">
                        Confidence: {problem.confidence}/5
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedId(expandedId === problem.id ? null : problem.id)
                  }
                >
                  {expandedId === problem.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {expandedId === problem.id && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Key Clue:</h4>
                    <p className="text-sm text-muted-foreground">
                      {problem.keyClue}
                    </p>
                  </div>

                  {problem.approach && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Approach:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {problem.approach}
                      </p>
                    </div>
                  )}

                  {problem.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Notes:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {problem.notes}
                      </p>
                    </div>
                  )}

                  {problem.solution && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Solution:</h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{problem.solution}</code>
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      How confident are you now?
                    </h4>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Button
                          key={level}
                          variant={
                            problem.confidence === level ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => markAsReviewed(problem.id, level)}
                          className="flex-1"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      1 = Need to review soon | 5 = Fully mastered
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reviews</CardTitle>
          <CardDescription>
            Problems scheduled for future review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingProblems.slice(0, 10).map((problem) => {
            const daysUntil = getDaysUntil(problem.nextReview);
            return (
              <div
                key={problem.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {problem.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {problem.pattern}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getConfidenceColor(
                          problem.confidence
                        )}`}
                      />
                      <span>Confidence: {problem.confidence}/5</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {daysUntil === 0
                      ? "Today"
                      : daysUntil === 1
                      ? "Tomorrow"
                      : `In ${daysUntil} days`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(problem.nextReview).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

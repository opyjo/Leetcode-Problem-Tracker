"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PATTERNS, type Problem, type Attempt } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function PatternsOverview() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [patternStats, setPatternStats] = useState<Record<string, Problem[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

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
      const { data, error } = await supabase.from("problems").select("*");

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

      const stats: Record<string, Problem[]> = {};
      PATTERNS.forEach((pattern) => {
        stats[pattern] = transformedProblems.filter(
          (p: Problem) => p.pattern === pattern
        );
      });
      setPatternStats(stats);
    } catch (error) {
      console.error("Error loading problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalProblems = problems.length;
  const maxProblemsPerPattern = Math.max(
    ...Object.values(patternStats).map((arr) => arr.length),
    1
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patterns Overview</CardTitle>
          <CardDescription>
            Track your progress across different problem patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {totalProblems}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Problems Solved
            </div>
          </div>

          <div className="space-y-6">
            {PATTERNS.map((pattern) => {
              const count = patternStats[pattern]?.length || 0;
              const percentage =
                maxProblemsPerPattern > 0
                  ? (count / maxProblemsPerPattern) * 100
                  : 0;

              return (
                <div key={pattern} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{pattern}</h3>
                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? "problem" : "problems"}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  {count > 0 && (
                    <div className="mt-2 space-y-1">
                      {patternStats[pattern].map((problem) => (
                        <div
                          key={problem.id}
                          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors pl-2"
                        >
                          • {problem.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Clock, Target, Award } from "lucide-react";
import type { Problem, Attempt } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function StatsDashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProblems: 0,
    totalAttempts: 0,
    totalTimeSpent: 0,
    averageConfidence: 0,
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
    byPattern: {} as Record<string, number>,
    weakestPatterns: [] as {
      pattern: string;
      avgConfidence: number;
      count: number;
    }[],
    recentActivity: [] as { date: string; count: number }[],
  });

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
      calculateStats(transformedProblems);
    } catch (error) {
      console.error("Error loading problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (problems: Problem[]) => {
    const totalProblems = problems.length;
    const totalAttempts = problems.reduce(
      (sum, p) => sum + p.attempts.length,
      0
    );
    const totalTimeSpent = problems.reduce(
      (sum, p) => sum + p.attempts.reduce((s, a) => s + a.timeSpent, 0),
      0
    );
    const averageConfidence =
      problems.length > 0
        ? problems.reduce((sum, p) => sum + p.confidence, 0) / problems.length
        : 0;

    // By difficulty
    const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach((p) => {
      byDifficulty[p.difficulty]++;
    });

    // By pattern
    const byPattern: Record<string, number> = {};
    problems.forEach((p) => {
      byPattern[p.pattern] = (byPattern[p.pattern] || 0) + 1;
    });

    // Weakest patterns (lowest average confidence)
    const patternStats: Record<string, { total: number; count: number }> = {};
    problems.forEach((p) => {
      if (!patternStats[p.pattern]) {
        patternStats[p.pattern] = { total: 0, count: 0 };
      }
      patternStats[p.pattern].total += p.confidence;
      patternStats[p.pattern].count++;
    });

    const weakestPatterns = Object.entries(patternStats)
      .map(([pattern, data]) => ({
        pattern,
        avgConfidence: data.total / data.count,
        count: data.count,
      }))
      .sort((a, b) => a.avgConfidence - b.avgConfidence)
      .slice(0, 5);

    // Recent activity (last 30 days)
    const activityMap: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    problems.forEach((p) => {
      const date = new Date(p.dateSolved);
      if (date >= thirtyDaysAgo) {
        const dateKey = date.toISOString().split("T")[0];
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
      }

      p.attempts.forEach((a) => {
        const attemptDate = new Date(a.date);
        if (attemptDate >= thirtyDaysAgo) {
          const dateKey = attemptDate.toISOString().split("T")[0];
          activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
        }
      });
    });

    const recentActivity = Object.entries(activityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setStats({
      totalProblems,
      totalAttempts,
      totalTimeSpent,
      averageConfidence,
      byDifficulty,
      byPattern,
      weakestPatterns,
      recentActivity,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence <= 2) return "text-destructive";
    if (confidence <= 3.5) return "text-yellow-500";
    return "text-success";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProblems}</p>
                <p className="text-sm text-muted-foreground">Total Problems</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatTime(stats.totalTimeSpent)}
                </p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${getConfidenceColor(
                    stats.averageConfidence
                  )}`}
                >
                  {stats.averageConfidence.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Problems by Difficulty</CardTitle>
          <CardDescription>
            Distribution of problems you've solved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.byDifficulty).map(([difficulty, count]) => {
              const percentage =
                stats.totalProblems > 0
                  ? (count / stats.totalProblems) * 100
                  : 0;
              const color =
                difficulty === "Easy"
                  ? "bg-success"
                  : difficulty === "Medium"
                  ? "bg-yellow-500"
                  : "bg-destructive";

              return (
                <div key={difficulty}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{difficulty}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pattern Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Problems by Pattern</CardTitle>
          <CardDescription>
            Which patterns you've practiced most
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(stats.byPattern)
              .sort(([, a], [, b]) => b - a)
              .map(([pattern, count]) => (
                <div
                  key={pattern}
                  className="p-3 border border-border rounded-lg"
                >
                  <p className="text-sm font-medium truncate">{pattern}</p>
                  <p className="text-2xl font-bold text-primary">{count}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Weakest Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Areas</CardTitle>
          <CardDescription>
            Patterns with lowest confidence - prioritize reviewing these
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.weakestPatterns.map((item) => (
              <div
                key={item.pattern}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.pattern}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.count} problems
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${getConfidenceColor(
                      item.avgConfidence
                    )}`}
                  >
                    {item.avgConfidence.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    avg confidence
                  </p>
                </div>
              </div>
            ))}
            {stats.weakestPatterns.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No data yet. Keep solving problems!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your problem-solving activity over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {stats.recentActivity.slice(-14).map((activity) => (
                <div key={activity.date} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-24">
                    {new Date(activity.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((activity.count / 5) * 100, 100)}%`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {activity.count}{" "}
                      {activity.count === 1 ? "problem" : "problems"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent activity. Start solving problems!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star } from "lucide-react";
import {
  PATTERNS,
  DIFFICULTIES,
  type Problem,
  type Attempt,
} from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function ProblemsList() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [patternFilter, setPatternFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProblems();

    // Listen for updates from add-problem or problem-detail
    const handleUpdate = () => loadProblems();
    window.addEventListener("problems-updated", handleUpdate);
    return () => window.removeEventListener("problems-updated", handleUpdate);
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchTerm, patternFilter, difficultyFilter]);

  const loadProblems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: false });

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
    } catch (error) {
      console.error("Error loading problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = [...problems];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (patternFilter !== "all") {
      filtered = filtered.filter((p) => p.pattern === patternFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
    }

    setFilteredProblems(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-success";
      case "Medium":
        return "text-primary";
      case "Hard":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Problems List</CardTitle>
          <CardDescription>
            View and manage all your tracked problems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={patternFilter} onValueChange={setPatternFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All patterns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All patterns</SelectItem>
                {PATTERNS.map((pattern) => (
                  <SelectItem key={pattern} value={pattern}>
                    {pattern}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All difficulties</SelectItem>
                {DIFFICULTIES.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Problems Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Pattern
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Difficulty
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Confidence
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Key Clue
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading problems...
                      </td>
                    </tr>
                  ) : filteredProblems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No problems found. Add your first problem to get
                        started!
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((problem) => (
                      <tr
                        key={problem.id}
                        className="border-t border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/problem/${problem.id}`)}
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {problem.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {problem.pattern}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </td>
                        <td className="px-4 py-3">
                          {problem.confidence ? (
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= problem.confidence!
                                      ? "fill-primary text-primary"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Not rated
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {problem.keyClue}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(problem.dateSolved).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredProblems.length} of {problems.length} problems
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

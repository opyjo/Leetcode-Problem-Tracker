"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Brain, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { type Problem, calculateNextReview } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function ReviewSchedule() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [dueProblems, setDueProblems] = useState<Problem[]>([])
  const [upcomingProblems, setUpcomingProblems] = useState<Problem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProblems()
  }, [])

  const loadProblems = () => {
    const stored = JSON.parse(localStorage.getItem("leetcode-problems") || "[]")
    setProblems(stored)

    const now = new Date()
    const due: Problem[] = []
    const upcoming: Problem[] = []

    stored.forEach((problem: Problem) => {
      const nextReview = new Date(problem.nextReview)
      if (nextReview <= now) {
        due.push(problem)
      } else {
        upcoming.push(problem)
      }
    })

    // Sort by next review date
    due.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
    upcoming.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())

    setDueProblems(due)
    setUpcomingProblems(upcoming)
  }

  const markAsReviewed = (problemId: string, confidence: number) => {
    const updatedProblems = problems.map((p) => {
      if (p.id === problemId) {
        const now = new Date().toISOString()
        const newReviewCount = confidence >= 4 ? p.reviewCount + 1 : p.reviewCount
        return {
          ...p,
          confidence,
          lastReviewed: now,
          nextReview: calculateNextReview(confidence, newReviewCount).toISOString(),
          reviewCount: newReviewCount,
        }
      }
      return p
    })

    localStorage.setItem("leetcode-problems", JSON.stringify(updatedProblems))
    loadProblems()

    toast({
      title: "Review recorded!",
      description: `Next review scheduled based on confidence level ${confidence}`,
    })
  }

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence <= 2) return "bg-destructive"
    if (confidence === 3) return "bg-yellow-500"
    return "bg-success"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success"
      case "Medium":
        return "bg-yellow-500"
      case "Hard":
        return "bg-destructive"
      default:
        return "bg-muted"
    }
  }

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
                <p className="text-sm text-muted-foreground">Upcoming Reviews</p>
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
            <div key={problem.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-foreground truncate">{problem.name}</h3>
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
                    <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                    <Badge variant="outline">{problem.pattern}</Badge>
                    <span className="text-muted-foreground">
                      Last reviewed: {new Date(problem.lastReviewed).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(problem.confidence)}`} />
                      <span className="text-muted-foreground">Confidence: {problem.confidence}/5</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === problem.id ? null : problem.id)}
                >
                  {expandedId === problem.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {expandedId === problem.id && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Key Clue:</h4>
                    <p className="text-sm text-muted-foreground">{problem.keyClue}</p>
                  </div>

                  {problem.approach && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Approach:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.approach}</p>
                    </div>
                  )}

                  {problem.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Notes:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.notes}</p>
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
                    <h4 className="text-sm font-medium mb-2">How confident are you now?</h4>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Button
                          key={level}
                          variant={problem.confidence === level ? "default" : "outline"}
                          size="sm"
                          onClick={() => markAsReviewed(problem.id, level)}
                          className="flex-1"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">1 = Need to review soon | 5 = Fully mastered</p>
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
          <CardDescription>Problems scheduled for future review</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingProblems.slice(0, 10).map((problem) => {
            const daysUntil = getDaysUntil(problem.nextReview)
            return (
              <div key={problem.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{problem.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {problem.pattern}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(problem.confidence)}`} />
                      <span>Confidence: {problem.confidence}/5</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(problem.nextReview).toLocaleDateString()}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

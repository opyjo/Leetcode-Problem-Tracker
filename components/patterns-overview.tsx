"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PATTERNS, type Problem } from "@/lib/types"

export function PatternsOverview() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [patternStats, setPatternStats] = useState<Record<string, Problem[]>>({})

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("leetcode-problems") || "[]")
    setProblems(stored)

    const stats: Record<string, Problem[]> = {}
    PATTERNS.forEach((pattern) => {
      stats[pattern] = stored.filter((p: Problem) => p.pattern === pattern)
    })
    setPatternStats(stats)
  }, [])

  const totalProblems = problems.length
  const maxProblemsPerPattern = Math.max(...Object.values(patternStats).map((arr) => arr.length), 1)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patterns Overview</CardTitle>
          <CardDescription>Track your progress across different problem patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary">{totalProblems}</div>
            <div className="text-sm text-muted-foreground">Total Problems Solved</div>
          </div>

          <div className="space-y-6">
            {PATTERNS.map((pattern) => {
              const count = patternStats[pattern]?.length || 0
              const percentage = maxProblemsPerPattern > 0 ? (count / maxProblemsPerPattern) * 100 : 0

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
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

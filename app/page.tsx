"use client"

import { useState } from "react"
import { AddProblem } from "@/components/add-problem"
import { ProblemsList } from "@/components/problems-list"
import { PatternsOverview } from "@/components/patterns-overview"
import { QuizMode } from "@/components/quiz-mode"
import { ReviewSchedule } from "@/components/review-schedule"
import { StatsDashboard } from "@/components/stats-dashboard"
import { Code2, ListChecks, BarChart3, Brain, Calendar, TrendingUp } from "lucide-react"

type View = "add" | "list" | "patterns" | "quiz" | "review" | "stats"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("review")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-primary">LeetCode</span> Pattern Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Master coding patterns through practice and repetition</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setCurrentView("review")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === "review"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Review
            </button>
            <button
              onClick={() => setCurrentView("quiz")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === "quiz"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain className="w-4 h-4" />
              Quiz
            </button>
            <button
              onClick={() => setCurrentView("stats")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === "stats"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Stats
            </button>
            <button
              onClick={() => setCurrentView("add")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === "add"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="w-4 h-4" />
              Add Problem
            </button>
            <button
              onClick={() => setCurrentView("list")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === "list"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListChecks className="w-4 h-4" />
              Problems
            </button>
            <button
              onClick={() => setCurrentView("patterns")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === "patterns"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Patterns
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === "review" && <ReviewSchedule />}
        {currentView === "stats" && <StatsDashboard />}
        {currentView === "add" && <AddProblem />}
        {currentView === "list" && <ProblemsList />}
        {currentView === "patterns" && <PatternsOverview />}
        {currentView === "quiz" && <QuizMode />}
      </main>
    </div>
  )
}

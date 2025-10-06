"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, CheckCircle2, XCircle, RotateCcw, Timer, Play } from "lucide-react"
import { PATTERNS, type Problem, calculateNextReview } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

type QuizState = "start" | "question" | "answer" | "complete"

export function QuizMode() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [quizState, setQuizState] = useState<QuizState>("start")
  const [quizProblems, setQuizProblems] = useState<Problem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<{ problem: Problem; correct: boolean }[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [selectedConfidence, setSelectedConfidence] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("leetcode-problems") || "[]")
    setProblems(stored)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning])

  const startQuiz = () => {
    if (problems.length === 0) return

    const shuffled = [...problems].sort(() => Math.random() - 0.5)
    const quizSet = shuffled.slice(0, Math.min(10, shuffled.length))
    setQuizProblems(quizSet)
    setCurrentIndex(0)
    setScore(0)
    setAnswers([])
    setSelectedPattern(null)
    setTimeElapsed(0)
    setTimerRunning(true)
    setSelectedConfidence(null)
    setQuizState("question")
  }

  const submitAnswer = () => {
    if (!selectedPattern) return

    setTimerRunning(false)
    const currentProblem = quizProblems[currentIndex]
    const isCorrect = selectedPattern === currentProblem.pattern

    if (isCorrect) {
      setScore(score + 1)
    }

    setAnswers([...answers, { problem: currentProblem, correct: isCorrect }])
    setQuizState("answer")
  }

  const nextQuestion = () => {
    if (selectedConfidence) {
      const currentProblem = quizProblems[currentIndex]
      const updatedProblems = problems.map((p) => {
        if (p.id === currentProblem.id) {
          const now = new Date().toISOString()
          const newReviewCount = selectedConfidence >= 4 ? p.reviewCount + 1 : p.reviewCount
          return {
            ...p,
            attempts: [
              ...p.attempts,
              {
                date: now,
                timeSpent: timeElapsed,
                confidence: selectedConfidence,
              },
            ],
            confidence: selectedConfidence,
            lastReviewed: now,
            nextReview: calculateNextReview(selectedConfidence, newReviewCount).toISOString(),
            reviewCount: newReviewCount,
          }
        }
        return p
      })

      localStorage.setItem("leetcode-problems", JSON.stringify(updatedProblems))
      setProblems(updatedProblems)
    }

    if (currentIndex + 1 < quizProblems.length) {
      setCurrentIndex(currentIndex + 1)
      setSelectedPattern(null)
      setSelectedConfidence(null)
      setTimeElapsed(0)
      setTimerRunning(true)
      setQuizState("question")
    } else {
      setQuizState("complete")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentProblem = quizProblems[currentIndex]
  const isCorrect = selectedPattern === currentProblem?.pattern

  return (
    <div className="max-w-3xl mx-auto">
      {quizState === "start" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Quiz Mode</CardTitle>
            <CardDescription>Test your pattern recognition skills with timed practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                You'll be shown problems from your tracker. Try to identify the correct pattern based on the problem
                name and key clue. Track your time and rate your confidence after each problem.
              </p>
              <div className="text-3xl font-bold text-primary">{problems.length}</div>
              <p className="text-sm text-muted-foreground">problems available</p>
            </div>

            {problems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You need to add some problems first!</p>
                <p className="text-sm text-muted-foreground">Go to "Add Problem" to get started.</p>
              </div>
            ) : (
              <Button onClick={startQuiz} className="w-full" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {quizState === "question" && currentProblem && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {quizProblems.length}
              </span>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono font-medium">{formatTime(timeElapsed)}</span>
                <span className="text-sm font-medium">
                  Score: {score}/{currentIndex}
                </span>
              </div>
            </div>
            <CardTitle className="text-xl">{currentProblem.name}</CardTitle>
            <CardDescription>What pattern does this problem use?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Key Clue:</h4>
              <p className="text-sm text-muted-foreground">{currentProblem.keyClue}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-3">Select the pattern:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PATTERNS.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`p-3 text-left text-sm rounded-lg border-2 transition-all ${
                      selectedPattern === pattern
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={submitAnswer} disabled={!selectedPattern} className="w-full" size="lg">
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      )}

      {quizState === "answer" && currentProblem && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <XCircle className="w-8 h-8 text-destructive" />
              )}
              <div className="flex-1">
                <CardTitle className={isCorrect ? "text-success" : "text-destructive"}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </CardTitle>
                <CardDescription>
                  {currentIndex + 1} of {quizProblems.length} • Time: {formatTime(timeElapsed)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Problem:</h4>
                <p className="text-foreground">{currentProblem.name}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Correct Pattern:</h4>
                <p className="text-primary font-medium">{currentProblem.pattern}</p>
              </div>

              {!isCorrect && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Your Answer:</h4>
                  <p className="text-destructive">{selectedPattern}</p>
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Key Clue:</h4>
                <p className="text-sm text-muted-foreground">{currentProblem.keyClue}</p>
              </div>

              {currentProblem.approach && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Your Approach:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentProblem.approach}</p>
                </div>
              )}

              {currentProblem.notes && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Your Notes:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentProblem.notes}</p>
                </div>
              )}

              {currentProblem.solution && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Your Solution:</h4>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                    {currentProblem.solution}
                  </pre>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium mb-2">How confident are you with this problem now?</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      variant={selectedConfidence === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedConfidence(level)}
                      className="flex-1"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">1 = Need more practice | 5 = Fully mastered</p>
              </div>
            </div>

            <Button onClick={nextQuestion} disabled={!selectedConfidence} className="w-full" size="lg">
              {currentIndex + 1 < quizProblems.length ? "Next Problem" : "View Results"}
            </Button>
          </CardContent>
        </Card>
      )}

      {quizState === "complete" && (
        <Card>
          <CardHeader className="text-center">
            <div
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                score / quizProblems.length >= 0.7 ? "bg-success/10" : "bg-primary/10"
              }`}
            >
              <span className="text-3xl font-bold text-primary">{score}</span>
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>
              You scored {score} out of {quizProblems.length} ({Math.round((score / quizProblems.length) * 100)}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-3">Results:</h4>
              {answers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    answer.correct ? "border-success/50 bg-success/5" : "border-destructive/50 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{answer.problem.name}</span>
                    {answer.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{answer.problem.pattern}</span>
                </div>
              ))}
            </div>

            <Button onClick={startQuiz} className="w-full" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

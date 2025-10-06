export const PATTERNS = [
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Backtracking",
  "Arrays & Hashing",
  "Linked Lists",
  "Heap",
  "Greedy",
  "Other",
] as const;

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export interface Attempt {
  date: string;
  timeSpent: number; // in seconds
  confidence: number; // 1-5
}

export interface Problem {
  id: string;
  name: string;
  pattern: string;
  difficulty: "Easy" | "Medium" | "Hard";
  keyClue: string;
  approach: string;
  dateSolved: string;
  // Spaced Repetition fields
  confidence: number; // 1-5, current confidence level
  lastReviewed: string; // ISO date string
  nextReview: string; // ISO date string
  reviewCount: number;
  // Time Tracking
  attempts: Attempt[];
  targetTime: number; // in seconds, based on difficulty
  // Notes & Solutions
  notes: string;
  solution: string; // Python code solution
  solutionTypeScript?: string; // TypeScript code solution
  mistakes: string[]; // common mistakes
  leetcodeUrl?: string; // optional link to problem
}

// Helper function to calculate next review date based on confidence
export function calculateNextReview(
  confidence: number,
  reviewCount: number
): Date {
  const now = new Date();
  let daysToAdd = 1;

  // Spaced repetition algorithm
  if (confidence === 1) {
    daysToAdd = 1; // Review tomorrow
  } else if (confidence === 2) {
    daysToAdd = 2; // Review in 2 days
  } else if (confidence === 3) {
    daysToAdd = 4; // Review in 4 days
  } else if (confidence === 4) {
    daysToAdd = 7; // Review in 1 week
  } else if (confidence === 5) {
    daysToAdd = 14; // Review in 2 weeks
  }

  // Increase interval based on review count (successful reviews)
  if (reviewCount > 0 && confidence >= 4) {
    daysToAdd = daysToAdd * Math.min(reviewCount, 3);
  }

  now.setDate(now.getDate() + daysToAdd);
  return now;
}

// Get target time based on difficulty
export function getTargetTime(difficulty: "Easy" | "Medium" | "Hard"): number {
  switch (difficulty) {
    case "Easy":
      return 15 * 60; // 15 minutes
    case "Medium":
      return 25 * 60; // 25 minutes
    case "Hard":
      return 35 * 60; // 35 minutes
  }
}

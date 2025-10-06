# 🚀 LeetCode Problem Tracker

A modern, feature-rich LeetCode problem tracker with Python playground, spaced repetition, and cloud storage powered by Supabase.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)

## ✨ Features

### 🎯 Core Features
- **Problem Tracking**: Track LeetCode problems with patterns, difficulty, and solutions
- **Python Playground**: Built-in Python code editor with live execution (powered by Pyodide)
- **Spaced Repetition**: Smart review scheduling based on confidence levels
- **Cloud Storage**: All data stored in Supabase for access anywhere
- **Pattern Recognition**: Categorize problems by algorithmic patterns
- **Confidence Tracking**: Rate your confidence from 1-5 stars
- **Time Tracking**: Monitor attempt history and time spent

### 🎨 UI/UX
- **Modern Design**: Beautiful UI built with Shadcn components
- **Dark Theme**: Eye-friendly dark mode interface
- **Responsive**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Instant synchronization across components

### 💻 Python Playground
- **Line Numbers**: Professional code editor with line numbering
- **Syntax Highlighting**: Dark theme code editor
- **Terminal Output**: Color-coded success/error messages
- **Keyboard Shortcuts**: `Ctrl+Enter` to run, `Tab` for indentation
- **No Backend Required**: Python runs entirely in the browser via WebAssembly

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Python Runtime**: Pyodide (WebAssembly)
- **Package Manager**: pnpm

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account

### 1. Clone the repository
```bash
git clone https://github.com/opyjo/Leetcode-Problem-Tracker.git
cd Leetcode-Problem-Tracker
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Set up Supabase

#### Create a Supabase project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API** to get your credentials

#### Run the database migration
Go to your Supabase project → **SQL Editor** and run:

```sql
-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  key_clue TEXT NOT NULL,
  approach TEXT NOT NULL DEFAULT '',
  date_solved TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence INTEGER NOT NULL DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5),
  last_reviewed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_review TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_count INTEGER NOT NULL DEFAULT 0,
  attempts JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_time INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  leetcode_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_problems_next_review ON problems(next_review);
CREATE INDEX IF NOT EXISTS idx_problems_pattern ON problems(pattern);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);

-- Enable Row Level Security
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- Create policy (modify for authentication if needed)
CREATE POLICY "Allow all operations" ON problems FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace with your actual Supabase credentials from **Settings** → **API**.

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/opyjo/Leetcode-Problem-Tracker)

Or manually:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📖 Usage

### Adding a Problem
1. Click on **"Add Problem"** tab
2. Fill in:
   - Problem name
   - Pattern (e.g., Two Pointers, Dynamic Programming)
   - Difficulty (Easy, Medium, Hard)
   - Key Clue (hint that identified the pattern)
   - Approach (your solution explanation)
   - Solution code (Python code in the playground)
   - Notes and LeetCode URL (optional)
3. Click **"Save Problem"**

### Using Python Playground
- Write your Python solution in the code editor
- Press `Ctrl+Enter` or click **"Run Code"** to execute
- View output in the terminal below
- Code is automatically saved with the problem

### Reviewing Problems
- Problems are scheduled for review based on your confidence rating
- Higher confidence = longer intervals between reviews
- Track your progress in the **Stats Dashboard**

## 🎨 Customization

### Patterns
Edit patterns in `lib/types.ts`:
```typescript
export const PATTERNS = [
  "Two Pointers",
  "Sliding Window",
  // Add your custom patterns
]
```

### Spaced Repetition Algorithm
Modify the review intervals in `lib/types.ts`:
```typescript
export function calculateNextReview(confidence: number, reviewCount: number): Date {
  // Customize your spacing algorithm
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Pyodide](https://pyodide.org/) - Python in the browser
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI components
- [Supabase](https://supabase.com/) - Backend as a service
- [Next.js](https://nextjs.org/) - React framework

## 📧 Contact

Created by [@opyjo](https://github.com/opyjo)

---

**Happy Coding!** 🎉


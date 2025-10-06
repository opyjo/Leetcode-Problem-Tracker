export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      problems: {
        Row: {
          id: string;
          name: string;
          pattern: string;
          difficulty: "Easy" | "Medium" | "Hard";
          key_clue: string;
          approach: string;
          date_solved: string;
          confidence: number;
          last_reviewed: string;
          next_review: string;
          review_count: number;
          attempts: Json;
          target_time: number;
          notes: string;
          solution: string;
          mistakes: Json;
          leetcode_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          pattern: string;
          difficulty: "Easy" | "Medium" | "Hard";
          key_clue: string;
          approach?: string;
          date_solved?: string;
          confidence?: number;
          last_reviewed?: string;
          next_review?: string;
          review_count?: number;
          attempts?: Json;
          target_time: number;
          notes?: string;
          solution?: string;
          mistakes?: Json;
          leetcode_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          pattern?: string;
          difficulty?: "Easy" | "Medium" | "Hard";
          key_clue?: string;
          approach?: string;
          date_solved?: string;
          confidence?: number;
          last_reviewed?: string;
          next_review?: string;
          review_count?: number;
          attempts?: Json;
          target_time?: number;
          notes?: string;
          solution?: string;
          mistakes?: Json;
          leetcode_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

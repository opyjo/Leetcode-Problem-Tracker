"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Problem } from "@/lib/types";
import { PythonPlayground } from "@/components/python-playground";
import { TypeScriptEditor } from "@/components/typescript-playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export default function PlaygroundPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [pythonCode, setPythonCode] = useState("");
  const [typescriptCode, setTypescriptCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const defaultLanguage =
    (searchParams.get("lang") as "python" | "typescript") || "python";
  const readOnly = searchParams.get("readOnly") === "true";

  useEffect(() => {
    if (params.id) {
      loadProblem(params.id as string);
    }
  }, [params.id]);

  const loadProblem = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setProblem({
          id: data.id,
          name: data.name,
          pattern: data.pattern,
          difficulty: data.difficulty,
          keyClue: data.key_clue,
          approach: data.approach,
          dateSolved: data.date_solved,
          confidence: data.confidence,
          lastReviewed: data.last_reviewed,
          nextReview: data.next_review,
          reviewCount: data.review_count,
          attempts: data.attempts || [],
          targetTime: data.target_time,
          notes: data.notes,
          solution: data.solution,
          solutionTypeScript: data.solution_typescript || undefined,
          mistakes: data.mistakes || [],
          leetcodeUrl: data.leetcode_url || undefined,
        });

        setPythonCode(
          data.solution ||
            "# Write your Python solution here\ndef solution():\n    # Your code\n    pass\n\nprint(solution())"
        );
        setTypescriptCode(
          data.solution_typescript ||
            "// Write your TypeScript solution here\nfunction solution(): void {\n  // Your code\n}\n\nconsole.log(solution());"
        );
      }
    } catch (error) {
      console.error("Error loading problem:", error);
      toast({
        title: "Error",
        description: "Failed to load problem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePythonCodeChange = (newCode: string) => {
    setPythonCode(newCode);
    setHasChanges(true);
  };

  const handleTypeScriptCodeChange = (newCode: string) => {
    setTypescriptCode(newCode);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!problem || readOnly) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("problems")
        .update({
          solution: pythonCode,
          solution_typescript: typescriptCode,
        })
        .eq("id", problem.id);

      if (error) throw error;

      toast({
        title: "Code saved",
        description: "Your solution has been saved successfully",
      });

      setHasChanges(false);
      window.dispatchEvent(new Event("problems-updated"));
    } catch (error) {
      console.error("Error saving code:", error);
      toast({
        title: "Error",
        description: "Failed to save code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges && !readOnly) {
      if (
        confirm(
          "You have unsaved changes. Are you sure you want to leave without saving?"
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading playground...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="text-muted-foreground">Problem not found</div>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Problems
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">{problem.name}</h1>
            <p className="text-sm text-muted-foreground">
              Fullscreen Code Playground
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && !readOnly && (
            <span className="text-sm text-orange-500">Unsaved changes</span>
          )}
          {!readOnly && (
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      {/* Playground Content */}
      <div className="flex-1 overflow-hidden p-6">
        <Tabs
          defaultValue={defaultLanguage}
          className="w-full h-full flex flex-col"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="typescript">TypeScript</TabsTrigger>
          </TabsList>

          <TabsContent value="python" className="flex-1 mt-4">
            <PythonPlayground
              initialCode={pythonCode}
              onCodeChange={readOnly ? undefined : handlePythonCodeChange}
              readOnly={readOnly}
              height="calc(100vh - 200px)"
              showExpandButton={false}
            />
          </TabsContent>

          <TabsContent value="typescript" className="flex-1 mt-4">
            <TypeScriptEditor
              initialCode={typescriptCode}
              onCodeChange={readOnly ? undefined : handleTypeScriptCodeChange}
              readOnly={readOnly}
              height="calc(100vh - 200px)"
              showExpandButton={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

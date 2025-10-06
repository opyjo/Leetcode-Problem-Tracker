"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PythonPlayground } from "@/components/python-playground";
import { TypeScriptEditor } from "@/components/typescript-playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FullscreenPlaygroundProps {
  open: boolean;
  onClose: () => void;
  pythonCode: string;
  typescriptCode: string;
  onPythonCodeChange?: (code: string) => void;
  onTypeScriptCodeChange?: (code: string) => void;
  readOnly?: boolean;
  defaultLanguage?: "python" | "typescript";
}

export function FullscreenPlayground({
  open,
  onClose,
  pythonCode,
  typescriptCode,
  onPythonCodeChange,
  onTypeScriptCodeChange,
  readOnly = false,
  defaultLanguage = "python",
}: FullscreenPlaygroundProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-6">
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
              onCodeChange={onPythonCodeChange}
              readOnly={readOnly}
              height="calc(95vh - 120px)"
            />
          </TabsContent>

          <TabsContent value="typescript" className="flex-1 mt-4">
            <TypeScriptEditor
              initialCode={typescriptCode}
              onCodeChange={onTypeScriptCodeChange}
              readOnly={readOnly}
              height="calc(95vh - 120px)"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

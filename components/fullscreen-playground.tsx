"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PythonPlayground } from "@/components/python-playground";
import { TypeScriptEditor } from "@/components/typescript-playground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FullscreenPlaygroundProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly pythonCode: string;
  readonly typescriptCode: string;
  readonly onPythonCodeChange?: (code: string) => void;
  readonly onTypeScriptCodeChange?: (code: string) => void;
  readonly readOnly?: boolean;
  readonly defaultLanguage?: "python" | "typescript";
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
        <DialogHeader>
          <DialogTitle>Code Playground</DialogTitle>
        </DialogHeader>
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
              height="calc(95vh - 160px)"
              showExpandButton={false}
            />
          </TabsContent>

          <TabsContent value="typescript" className="flex-1 mt-4">
            <TypeScriptEditor
              initialCode={typescriptCode}
              onCodeChange={onTypeScriptCodeChange}
              readOnly={readOnly}
              height="calc(95vh - 160px)"
              showExpandButton={false}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

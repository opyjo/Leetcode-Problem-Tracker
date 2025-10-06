"use client";

import { useState, useEffect, useRef } from "react";

interface TypeScriptEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onRunComplete?: (output: string, success: boolean) => void;
  className?: string;
  height?: string;
  readOnly?: boolean;
  onExpand?: () => void;
  showExpandButton?: boolean;
}

export function TypeScriptEditor({
  initialCode = "// Write your TypeScript code here\nconst greeting: string = 'Hello, World!';\nconsole.log(greeting);",
  onCodeChange,
  onRunComplete,
  className = "",
  height = "500px",
  readOnly = false,
  onExpand,
  showExpandButton = true,
}: TypeScriptEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [code]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    // Tab = 2 spaces (TypeScript convention)
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      handleCodeChange(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }

    // Ctrl/Cmd + Enter = Run
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setIsSuccess(false);

    try {
      // Capture console output
      const logs: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args: unknown[]) => {
        logs.push(
          args
            .map((arg) => {
              if (arg === null) return "null";
              if (arg === undefined) return "undefined";
              if (typeof arg === "object") {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            })
            .join(" ")
        );
      };
      console.error = (...args: unknown[]) => {
        logs.push("ERROR: " + args.map((arg) => String(arg)).join(" "));
      };
      console.warn = (...args: unknown[]) => {
        logs.push("WARNING: " + args.map((arg) => String(arg)).join(" "));
      };

      try {
        // Transpile TypeScript to JavaScript (basic - just strip types)
        // For full TypeScript support, we'd use the TypeScript compiler API
        let jsCode = code
          // Remove type annotations
          .replace(/:\s*\w+(\[\])?(?=\s*[=,;)\n])/g, "")
          // Remove interface declarations
          .replace(/interface\s+\w+\s*\{[^}]*\}/g, "")
          // Remove type declarations
          .replace(/type\s+\w+\s*=\s*[^;]+;/g, "")
          // Remove explicit type casts
          .replace(/as\s+\w+/g, "")
          // Remove generic type parameters
          .replace(/<[\w\s,]+>/g, "");

        // Execute the code
        // eslint-disable-next-line no-new-func
        const func = new Function(jsCode);
        func();

        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;

        const result =
          logs.length > 0
            ? logs.join("\n")
            : "✓ Code executed successfully (no console output)";

        setOutput(result);
        setIsSuccess(true);
        onRunComplete?.(result, true);
      } catch (err: unknown) {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        throw new Error(errorMessage);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setOutput(`❌ Error: ${errorMessage}`);
      setError(errorMessage);
      setIsSuccess(false);
      onRunComplete?.(errorMessage, false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput("");
    setError("");
    setIsSuccess(false);
    onCodeChange?.(initialCode);
  };

  const lineCount = code.split("\n").length;
  const lineNumberWidth = lineCount.toString().length * 8 + 16;

  return (
    <div
      className={`border border-blue-700 rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{ height }}
    >
      {/* Header Bar */}
      <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="font-semibold text-sm">TypeScript Editor</span>
          <span className="text-xs text-blue-300 font-medium">Ready</span>
        </div>
        <div className="flex items-center gap-2">
          {showExpandButton && onExpand && (
            <button
              onClick={onExpand}
              className="px-3 py-1.5 text-xs font-medium bg-blue-800 hover:bg-blue-700 rounded transition-colors"
              title="Expand to fullscreen"
            >
              ⛶ Expand
            </button>
          )}
          {!readOnly && (
            <>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium bg-blue-800 hover:bg-blue-700 rounded transition-colors"
                title="Reset to initial code"
              >
                🔄 Reset
              </button>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Run code (Ctrl+Enter)"
              >
                {isRunning ? "⏳ Running..." : "▶ Run Code"}
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className="flex flex-col"
        style={{ height: `calc(${height} - 48px)` }}
      >
        {/* Code Editor */}
        <div className="flex-1 relative bg-gray-900 text-gray-100 overflow-hidden">
          {/* Line Numbers */}
          <div
            className="absolute left-0 top-0 px-3 py-4 text-gray-500 font-mono text-sm pointer-events-none select-none border-r border-blue-800 bg-gray-800"
            style={{ width: lineNumberWidth }}
          >
            {code.split("\n").map((line, index) => (
              <div
                key={`${index}-${line.substring(0, 10)}`}
                style={{ lineHeight: "1.5", height: "21px" }}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            className="w-full h-full bg-transparent text-gray-100 font-mono text-sm resize-none border-0 outline-none overflow-auto"
            placeholder="Write your TypeScript code here..."
            spellCheck={false}
            style={{
              lineHeight: "1.5",
              tabSize: 2,
              paddingLeft: lineNumberWidth + 16,
              paddingRight: "16px",
              paddingTop: "16px",
              paddingBottom: "16px",
            }}
          />
        </div>

        {/* Output Terminal */}
        <div className="h-40 bg-gray-950 text-blue-400 font-mono text-sm border-t border-blue-800 flex flex-col">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs font-semibold">
                OUTPUT
              </span>
              {isSuccess && (
                <span className="text-blue-400 text-xs">✓ Success</span>
              )}
              {error && <span className="text-red-400 text-xs">✗ Error</span>}
            </div>
            {output && (
              <button
                onClick={() => setOutput("")}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Terminal Content */}
          <div className="flex-1 p-4 overflow-auto">
            {output ? (
              <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                {error ? (
                  <span className="text-red-400">{output}</span>
                ) : (
                  <span className="text-blue-400">{output}</span>
                )}
              </pre>
            ) : (
              <span className="text-gray-500 text-xs italic">
                Click 'Run Code' or press Ctrl+Enter to see output...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-blue-900 px-4 py-2 text-center border-t border-blue-800">
        <span className="text-xs text-blue-200">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-blue-800 rounded text-xs font-mono">
            Ctrl+Enter
          </kbd>{" "}
          to run •{" "}
          <kbd className="px-1.5 py-0.5 bg-blue-800 rounded text-xs font-mono ml-1">
            Tab
          </kbd>{" "}
          for indentation
        </span>
      </div>
    </div>
  );
}

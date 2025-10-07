"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

interface TypeScriptEditorProps {
  readonly initialCode?: string;
  readonly onCodeChange?: (code: string) => void;
  readonly onRunComplete?: (output: string, success: boolean) => void;
  readonly className?: string;
  readonly height?: string;
  readonly readOnly?: boolean;
  readonly onExpand?: () => void;
  readonly showExpandButton?: boolean;
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

  const handleCodeChange = (newCode: string | undefined) => {
    if (!newCode) return;
    setCode(newCode);
    onCodeChange?.(newCode);
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
              if (typeof arg === "object" && arg !== null) {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(Object.prototype.toString.call(arg));
                }
              }
              // Handle primitives (string, number, boolean, symbol, bigint)
              if (typeof arg === "string") return arg;
              if (typeof arg === "number") return String(arg);
              if (typeof arg === "boolean") return String(arg);
              if (typeof arg === "symbol") return String(arg);
              if (typeof arg === "bigint") return String(arg);
              // Fallback for function type
              if (typeof arg === "function")
                return `[Function: ${(arg as () => void).name || "anonymous"}]`;
              return "[Unknown]";
            })
            .join(" ")
        );
      };
      console.error = (...args: unknown[]) => {
        logs.push(
          "ERROR: " +
            args
              .map((arg) => {
                if (typeof arg === "object" && arg !== null) {
                  try {
                    return JSON.stringify(arg);
                  } catch {
                    return String(Object.prototype.toString.call(arg));
                  }
                }
                return String(arg);
              })
              .join(" ")
        );
      };
      console.warn = (...args: unknown[]) => {
        logs.push(
          "WARNING: " +
            args
              .map((arg) => {
                if (typeof arg === "object" && arg !== null) {
                  try {
                    return JSON.stringify(arg);
                  } catch {
                    return String(Object.prototype.toString.call(arg));
                  }
                }
                return String(arg);
              })
              .join(" ")
        );
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
        <div className="flex-1 relative overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultPath="file:///main.ts"
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
              quickSuggestions: {
                other: true,
                comments: false,
                strings: true,
              },
            }}
            onMount={(editor, monaco) => {
              // Configure TypeScript formatting to use semicolons and disable lint errors
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                {
                  noSemanticValidation: true, // Disable semantic validation
                  noSyntaxValidation: false,
                  diagnosticCodesToIgnore: [
                    1108, // 'return' statement not in function
                    2304, // Cannot find name
                    2552, // Cannot find name (did you mean)
                    2683, // 'this' implicitly has type 'any'
                    7027, // Unreachable code detected
                  ],
                }
              );

              monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                {
                  target: monaco.languages.typescript.ScriptTarget.ES2020,
                  allowNonTsExtensions: true,
                  moduleResolution:
                    monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                  module: monaco.languages.typescript.ModuleKind.CommonJS,
                  noEmit: true,
                  esModuleInterop: true,
                  jsx: monaco.languages.typescript.JsxEmit.React,
                  reactNamespace: "React",
                  allowJs: true,
                  lib: ["es2020"],
                  strict: false,
                  skipLibCheck: true,
                  noUnusedLocals: false,
                  noUnusedParameters: false,
                  noImplicitAny: false,
                  noImplicitReturns: false,
                  noFallthroughCasesInSwitch: false,
                }
              );

              // Add keybinding for Ctrl/Cmd + Enter to run code
              editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                () => {
                  handleRunCode();
                }
              );

              // Add format document command with Monaco's built-in formatter
              editor.addCommand(
                monaco.KeyMod.CtrlCmd |
                  monaco.KeyMod.Shift |
                  monaco.KeyCode.KeyF,
                () => {
                  editor.getAction("editor.action.formatDocument")?.run();
                }
              );

              // Auto format on paste
              editor.onDidPaste(() => {
                setTimeout(() => {
                  editor.getAction("editor.action.formatDocument")?.run();
                }, 100);
              });
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
          <kbd className="px-1.5 py-0.5 bg-blue-800 rounded text-xs font-mono">
            Ctrl+Enter
          </kbd>{" "}
          to run •{" "}
          <kbd className="px-1.5 py-0.5 bg-blue-800 rounded text-xs font-mono ml-1">
            Ctrl+Shift+F
          </kbd>{" "}
          to format •{" "}
          <kbd className="px-1.5 py-0.5 bg-blue-800 rounded text-xs font-mono ml-1">
            Ctrl+Space
          </kbd>{" "}
          for IntelliSense
        </span>
      </div>
    </div>
  );
}

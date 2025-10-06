/**
 * STANDALONE PYTHON CODE EDITOR
 *
 * A complete, self-contained Python code editor with execution capabilities.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";

interface PythonPlaygroundProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
  className?: string;
  height?: string;
  onExpand?: () => void;
  showExpandButton?: boolean;
}

export const PythonPlayground = ({
  initialCode = "# Write your Python solution here\ndef solution():\n    # Your code\n    pass\n\nprint(solution())",
  onCodeChange,
  readOnly = false,
  className = "",
  height = "500px",
  onExpand,
  showExpandButton = true,
}: PythonPlaygroundProps) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pyodideRef = useRef<any>(null);

  // Initialize Pyodide (Python WebAssembly runtime)
  useEffect(() => {
    let mounted = true;

    const initPyodide = async () => {
      try {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.async = true;

        script.onload = async () => {
          if (!mounted) return;

          try {
            // @ts-ignore
            const { loadPyodide } = window as any;

            const pyodide = await loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
            });

            if (!mounted) return;
            pyodideRef.current = pyodide;
            setPyodideReady(true);
          } catch (err) {
            if (!mounted) return;
            setError("Failed to initialize Python");
            console.error("Pyodide error:", err);
          }
        };

        script.onerror = () => {
          if (!mounted) return;
          setError("Failed to load Python");
        };

        document.head.appendChild(script);
      } catch (err: unknown) {
        if (!mounted) return;
        const errorMsg =
          err instanceof Error ? err.message : "Failed to initialize Python";
        console.error("Python initialization error:", errorMsg);
        setError("Failed to initialize Python");
      }
    };

    initPyodide();
    return () => {
      mounted = false;
    };
  }, []);

  // Update code when initialCode changes
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [code]);

  const handleCodeChange = (newCode: string) => {
    if (readOnly) return;
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    // Tab = 4 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + "    " + code.substring(end);
      handleCodeChange(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 4;
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
    if (!pyodideReady || !pyodideRef.current) {
      setOutput("⏳ Python environment is still loading...");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setError("");
    setIsSuccess(false);

    try {
      // Capture stdout
      pyodideRef.current.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Run code
      pyodideRef.current.runPython(code);

      // Get output
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
      const result = stdout || "✓ Code executed successfully (no output)";

      setOutput(result);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setOutput(`❌ Error: ${errorMessage}`);
      setError(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (readOnly) return;
    setCode(initialCode);
    setOutput("");
    setError("");
    setIsSuccess(false);
    onCodeChange?.(initialCode);
  };

  const lineCount = code.split("\n").length;
  const lineNumberWidth = Math.max(lineCount.toString().length * 8 + 16, 48);

  return (
    <div
      className={`border border-gray-700 rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{ height }}
    >
      {/* Header Bar */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              pyodideReady ? "bg-green-500" : "bg-yellow-500 animate-pulse"
            }`}
          ></div>
          <span className="font-semibold text-sm">Python Code Editor</span>
          {!pyodideReady && (
            <span className="text-xs text-gray-400">Loading Python...</span>
          )}
          {pyodideReady && (
            <span className="text-xs text-green-400 font-medium">
              Python Ready
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showExpandButton && onExpand && (
            <button
              onClick={onExpand}
              className="px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              title="Expand to fullscreen"
              type="button"
            >
              ⛶ Expand
            </button>
          )}
          {!readOnly && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              title="Reset to initial code"
              type="button"
            >
              🔄 Reset
            </button>
          )}
          <button
            onClick={handleRunCode}
            disabled={isRunning || !pyodideReady}
            className="px-4 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Run code (Ctrl+Enter)"
            type="button"
          >
            {isRunning ? "⏳ Running..." : "▶ Run Code"}
          </button>
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
            className="absolute left-0 top-0 px-3 py-4 text-gray-500 font-mono text-sm pointer-events-none select-none border-r border-gray-700 bg-gray-800"
            style={{ width: lineNumberWidth }}
          >
            {code.split("\n").map((_, index) => (
              <div
                key={`line-${index}`}
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
            className="w-full h-full bg-transparent text-gray-100 font-mono text-sm resize-none border-0 outline-none overflow-auto"
            placeholder="Write your Python code here..."
            spellCheck={false}
            readOnly={readOnly}
            style={{
              lineHeight: "1.5",
              tabSize: 4,
              paddingLeft: lineNumberWidth + 16,
              paddingRight: "16px",
              paddingTop: "16px",
              paddingBottom: "16px",
            }}
          />
        </div>

        {/* Output Terminal */}
        <div className="h-40 bg-gray-950 text-green-400 font-mono text-sm border-t border-gray-700 flex flex-col">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs font-semibold">
                Output:
              </span>
              {isSuccess && (
                <span className="text-green-400 text-xs">✓ Success</span>
              )}
              {error && <span className="text-red-400 text-xs">✗ Error</span>}
            </div>
            {output && (
              <button
                onClick={() => setOutput("")}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                type="button"
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
                  <span className="text-green-400">{output}</span>
                )}
              </pre>
            ) : (
              <span className="text-gray-500 text-xs italic">
                {pyodideReady
                  ? "Click 'Run Code' to see the output here..."
                  : "Loading Python environment..."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 px-4 py-2 text-center border-t border-gray-700">
        <span className="text-xs text-gray-400">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">
            Ctrl+Enter
          </kbd>{" "}
          to run •{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono ml-1">
            Tab
          </kbd>{" "}
          for indentation
        </span>
      </div>
    </div>
  );
};

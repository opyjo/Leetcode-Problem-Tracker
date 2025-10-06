/**
 * Runs Python code using Pyodide (Python in the browser via WebAssembly)
 * This is a client-side implementation that doesn't require a backend
 */

let pyodideInstance: any = null;

/**
 * Initialize Pyodide if not already loaded
 */
const initPyodide = async () => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  try {
    // @ts-ignore - Pyodide is loaded via CDN
    const pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });
    pyodideInstance = pyodide;
    return pyodide;
  } catch (error) {
    console.error("Failed to initialize Pyodide:", error);
    throw new Error("Failed to initialize Python runtime");
  }
};

/**
 * Run Python code and return the output
 */
export const runPythonCode = async (code: string): Promise<string> => {
  try {
    const pyodide = await initPyodide();

    // Capture stdout/stderr
    let output = "";

    // Redirect stdout to capture print statements
    await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

    // Run the user's code
    try {
      const result = await pyodide.runPythonAsync(code);

      // Get captured output
      const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
      const stderr = await pyodide.runPythonAsync("sys.stderr.getvalue()");

      output = stdout || "";

      // Include result if it exists and is not None
      if (result !== undefined && result !== null) {
        output += (output ? "\n" : "") + String(result);
      }

      // Include errors if any
      if (stderr) {
        output += (output ? "\n\n" : "") + "Errors:\n" + stderr;
      }

      return output || "Code executed successfully (no output)";
    } catch (error: any) {
      const stderr = await pyodide.runPythonAsync("sys.stderr.getvalue()");
      return `Error:\n${error.message}\n${stderr || ""}`;
    }
  } catch (error: any) {
    return `Failed to run code: ${error.message}`;
  }
};

/**
 * Check if Pyodide is available (loaded from CDN)
 */
export const isPyodideAvailable = (): boolean => {
  return typeof window !== "undefined" && "loadPyodide" in window;
};

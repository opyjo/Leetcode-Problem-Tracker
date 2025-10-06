-- Add TypeScript solution column to problems table
ALTER TABLE problems
ADD COLUMN solution_typescript TEXT;

-- Add comment to the column
COMMENT ON COLUMN problems.solution_typescript IS 'TypeScript code solution for the problem';


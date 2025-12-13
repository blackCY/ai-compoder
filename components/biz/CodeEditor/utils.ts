// 根据文件名后缀识别语言
export const getLanguageFromFilename = (filename?: string): string => {
  if (!filename) return "javascript";

  const ext = filename.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    css: "css",
    scss: "scss",
    less: "less",
    html: "html",
    json: "json",
    md: "markdown",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    sql: "sql",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
  };

  return languageMap[ext || ""] || "javascript";
};

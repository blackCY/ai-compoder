export interface CodeEditorProps {
  className?: string;
  code?: string;
  language?: string;
  filename?: string; // 文件名，用于自动识别语言
  placeholder?: string;
}

export interface CodeEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
}
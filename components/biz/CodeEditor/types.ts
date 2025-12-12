export interface CodeEditorProps {
  className?: string;
  code?: string;
  language?: string;
  placeholder?: string;
}

export interface CodeEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
}
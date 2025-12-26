export interface CodeEditorProps {
  className?: string;
  code?: string;
  language?: string;
  filename?: string; // 文件名，用于自动识别语言
  placeholder?: string;
  readOnly?: boolean; // 是否只读模式（只读时自动滚动到底部）
  onChange?: (code: string) => void; // 内容变化回调
}

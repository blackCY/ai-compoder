import { ReactNode } from 'react';

export interface ChatInterfaceProps {
  className?: string;
  showExamples?: boolean;
  onGenerate?: (input: string) => void;
  children?: ReactNode;
}

export interface ChatInterfaceRef {
  focus: () => void;
  clear: () => void;
}

export interface CodeDisplayProps {
  code: string;
  isGenerating: boolean;
  className?: string;
}

export interface MatrixBackgroundProps {
  className?: string;
}
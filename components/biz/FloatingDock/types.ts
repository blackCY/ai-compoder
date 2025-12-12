import { ReactNode } from 'react';

export interface FloatingDockProps {
  className?: string;
  onGenerate?: (input: string) => void;
  terminalOutput?: ReactNode;
  disabled?: boolean;
  placeholder?: string;
}
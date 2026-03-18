import { cva } from 'class-variance-authority';

export const terminalVariants = cva(
  'pointer-events-auto w-[600px] max-w-[90%] relative z-[10] overflow-hidden font-mono text-sm leading-6 text-yellow-500 bg-gray-900/80 backdrop-blur-md border border-gray-800/50',
  {
    variants: {
      visible: {
        true: 'rounded-t-2xl p-5 border-b-0',
        false: 'rounded-2xl p-0 mb-0 h-0',
      },
    },
    defaultVariants: {
      visible: false,
    },
  }
);

export const commandBarVariants = cva(
  'group w-full h-full flex items-center gap-3 px-6 bg-gradient-to-br from-emerald-950/60 via-emerald-950/50 to-slate-900/60 backdrop-blur-xl border border-emerald-500/20 shadow-xl shadow-emerald-500/10 transition-all duration-300',
  {
    variants: {
      terminalVisible: {
        true: 'rounded-b-2xl border-t-0 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]',
        false: 'rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(16,185,129,0.1)]',
      },
    },
    defaultVariants: {
      terminalVisible: false,
    },
  }
);

export const typingCursorVariants = cva('', {
  variants: {
    typing: {
      true: 'after:content-["▋"] after:inline-block after:ml-1 after:animate-pulse after:text-yellow-500',
    },
  },
});

export const dockContainerVariants = cva(
  'fixed bottom-9 left-0 w-full flex flex-col justify-end items-center pointer-events-none z-[1000]'
);

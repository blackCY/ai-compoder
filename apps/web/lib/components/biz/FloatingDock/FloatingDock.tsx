"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "lib/utils";
import { FloatingDockProps } from "./types";
import { commandBarVariants } from "./variants";

export const FloatingDock: React.FC<FloatingDockProps> = ({ 
  className, 
  onGenerate,
  terminalOutput,
  disabled = false,
  placeholder = "Enter your command..."
}) => {
  const [command, setCommand] = useState("");
  const isTerminalVisible = !!terminalOutput;

  // Handle command submission
  const handleCommandSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" && !e.shiftKey) || (e.key === "Enter" && e.ctrlKey)) {
      e.preventDefault();
      executeCommand();
    }
  };

  // Execute command (shared by keyboard and click)
  const executeCommand = () => {
    if (!command.trim() || disabled) return;

    const userInput = command.trim();
    setCommand("");

    // Call external onGenerate callback
    if (onGenerate) {
      onGenerate(userInput);
    }
  };

  return (
    <div className={cn("fixed bottom-8 left-0 right-0 w-full max-w-5xl mx-auto z-50 px-4", className)}>
      <div className="relative flex flex-col items-center" style={{ viewTransitionName: "floating-dock" }}>
        {/* Terminal Output with Animation */}
        <AnimatePresence mode="wait">
          {isTerminalVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="relative z-[10] w-[600px] max-w-[90%]"
              style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            >
              {terminalOutput}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider Line */}
        <motion.div
          className="w-[580px] max-w-[calc(90%-1.25rem)] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mx-auto"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: isTerminalVisible ? 1 : 0,
            opacity: isTerminalVisible ? 1 : 0
          }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
            delay: isTerminalVisible ? 0.3 : 0
          }}
          style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
        />

        {/* Floating Dock Command Bar */}
        <motion.div
          className="pointer-events-auto w-[600px] max-w-[90%]"
          initial={{ y: "120%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.5 }}
          style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
        >
          <motion.div
            className="h-16 relative z-[20]"
            whileHover={{
              scale: 1.005,
              transition: { duration: 0.2 }
            }}
            whileFocus={{
              y: -2,
              scale: 1.01,
              boxShadow:
                "0 20px 50px -12px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.3), 0 0 30px -5px rgba(16, 185, 129, 0.2)",
            }}
          >
            <div className={commandBarVariants({ terminalVisible: isTerminalVisible })}>
              {/* Command Icon */}
              <svg
                className="w-5 h-5 mr-3 text-emerald-400/70 transition-all duration-300 group-hover:text-emerald-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 9L11 12L8 15M13 15H16M7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Command Input */}
              <input
                type="text"
                value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={handleCommandSubmit}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 bg-gray-900/50 border border-emerald-500/20 rounded-lg px-4 py-2 outline-none text-base text-gray-100 placeholder-gray-500/70 transition-all duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:placeholder-gray-500/50"
                autoComplete="off"
              />

              {/* Status Indicator */}
              <motion.button
                type="button"
                onClick={executeCommand}
                disabled={!command.trim() || disabled}
                className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: !command.trim() || disabled ? 1 : 1.05 }}
                whileTap={{ scale: !command.trim() || disabled ? 1 : 0.95 }}
              >
                <kbd className="font-mono font-semibold">⏎</kbd>
                <span>ENTER</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

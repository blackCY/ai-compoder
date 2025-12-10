"use server";

import { StageConfig, Resource } from "./types";

// Private Component Library
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const mockResources: Resource = require("./config/private-component.json");

/**
 * 测试用硬编码阶段配置
 * 包含 2 个阶段：需求理解 (Design) → 代码生成 (Coding)
 */
const testStages: StageConfig[] = [
  // Stage 1: Design Phase - Component Selection from Private Library
  {
    resources: mockResources,
    systemPrompt: `You are a Component Selection Expert.

Your goal is to select appropriate components from our private component library based on the user's requirements.

CRITICAL REQUIREMENTS:
1. COMPONENT SELECTION CONSTRAINTS:
   - MUST select components ONLY from the "Available Private Components Library"
   - Each selected component must directly serve the user's functional requirements
   - Components must be practical and implementable

2. SELECTION CRITERIA:
   - Match component functionality to user requirements
   - Prioritize commonly used, stable components
   - Ensure selected components can work together
   - Consider component complexity and learning curve

3. OUTPUT REQUIREMENTS:
   - Select only relevant components from the private library
   - Use the exact component names as provided in the library
   - Copy the description and api information exactly from the library
   - Focus on practical component selection for implementation

Remember: Your component selection will be used directly by a Senior Frontend Engineer to implement the solution. Select components that are actually available in our private library.`,
    schema: {
      type: "object",
      properties: {
        analysis: {
          type: "string",
          minLength: 50,
          description: "Analysis of user requirements and available components from the private library"
        },
        selectedComponents: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Component name from private library (exact match)"
              },
              description: {
                type: "string",
                description: "Component description from private library (exact copy)"
              },
              api: {
                type: "string",
                description: "Component API documentation from private library (exact copy)"
              }
            },
            required: ["name", "description", "api"],
            additionalProperties: false
          },
          description: "Array of selected components from private library with exact description and api"
        }
      },
      required: ["analysis", "selectedComponents"],
      additionalProperties: false
    },
  },
  // Stage 2: Coding Phase
  {
    systemPrompt: `You are a Senior Frontend Engineer.

Your goal is to generate executable React code using the components selected from the private component library in the previous stage.

CRITICAL CONSTRAINTS - MUST FOLLOW EXACTLY:
1. COMPONENT USAGE REQUIREMENTS:
   - MUST use the components selected in the previous stage from the private component library
   - Follow the exact API specifications provided for each selected component
   - Implement components according to their descriptions and intended usage
   - Create a cohesive application using the selected private components

2. Generate EXACTLY 4 files - no more, no less:
   - App.tsx (Entry component with imports and main structure)
   - [ComponentName].tsx (Main functional component with full implementation)
   - styles.css (All CSS styles with proper class names)
   - utils.ts (Utility functions and helper methods)

3. CODE QUALITY REQUIREMENTS:
   - Strict TypeScript typing (no 'any' types)
   - React functional components with hooks
   - Proper error handling and loading states
   - Responsive design with Tailwind CSS classes
   - Clean, readable code with consistent formatting
   - No external dependencies beyond what's specified

4. FILE STRUCTURE REQUIREMENTS:
   - App.tsx: Must import the main component and serve as entry point
   - [ComponentName].tsx: Must contain the main business logic and UI using selected components
   - styles.css: Must contain all necessary CSS with descriptive class names
   - utils.ts: Must contain reusable helper functions and types

5. INTEGRATION REQUIREMENTS:
   - MUST integrate the private components selected in the previous stage
   - Use the exact component names and API specifications from the previous stage
   - Ensure all components are properly connected and functional
   - Include proper TypeScript interfaces for all data structures

6. OUTPUT FORMAT:
   - Return a JSON object with exactly 4 files
   - Each file must have non-empty content
   - File names must match the required pattern exactly
   - Code must be production-ready and executable

Remember: You are generating a complete, working React application using the specific private components selected in the previous stage.`,
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: {
            type: "object",
            properties: {
              fileName: {
                type: "string",
                description: "File name (e.g., App.tsx, ComponentName.tsx, styles.css, utils.ts)"
              },
              componentName: {
                type: "string",
                description: "Component name for TypeScript files (optional for utility files)"
              },
              content: {
                type: "string",
                minLength: 50,
                description: "File content must be substantial and non-empty"
              },
              description: {
                type: "string",
                description: "Brief description of what this file contains"
              }
            },
            required: ["fileName", "content", "description"],
            additionalProperties: false
          },
          description: "Exactly 4 files: App.tsx, [ComponentName].tsx, styles.css, utils.ts"
        }
      },
      required: ["files"],
      additionalProperties: false
    },
  },
];

// TODO: 后续根据 typeId 从数据库查询 stages
export const getStages = async (_typeId: string) => testStages;

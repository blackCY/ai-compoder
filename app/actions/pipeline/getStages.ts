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
  // Stage 1: Design Phase - Requirement Analysis & Component Planning
  {
    stageId: 'design-code',
    resources: mockResources,
    systemPrompt: `You are a Senior Product Analyst and Technical Architect.

Your goal is to analyze the user's requirements and create a comprehensive implementation plan.

WORKFLOW:
1. First, you will receive a list of available resources (components) from our private library with brief descriptions
2. Analyze the user's requirements carefully
3. Identify which components from the available resources are needed
4. The system will then provide you with the full API documentation for your selected components

YOUR TASK:
Analyze the user's requirements and provide:

1. REQUIREMENT ANALYSIS:
   - Break down the user's request into specific functional requirements
   - Identify key features and user interactions needed
   - Clarify any ambiguities or assumptions

2. COMPONENT SELECTION STRATEGY:
   - Review the available components from the private library
   - Select ONLY components that directly address the requirements
   - Explain why each component is necessary for the implementation
   - Ensure selected components can work together cohesively

SELECTION CRITERIA:
- Match component functionality precisely to requirements
- Prioritize commonly used, stable components
- Ensure components are compatible and complementary
- Select the minimum necessary components (avoid over-engineering)

OUTPUT REQUIREMENTS:
- Be specific about which components are needed and why
- Use exact component names from the available resources
`,
  },
  // Stage 2: Coding Phase
  {
    stageId: 'generate-code',
    systemPrompt: `You are a Senior Frontend Engineer.

  Your goal is to generate executable React code using the components selected from the private component library in the previous stage.

  CRITICAL CONSTRAINTS - MUST FOLLOW EXACTLY:
  1. COMPONENT USAGE REQUIREMENTS:
     - MUST use the components selected in the previous stage from the private component library
     - Follow the exact API specifications provided for each selected component
     - Implement components according to their descriptions and intended usage
     - Create a cohesive application using the selected private components
     - ALL private components MUST be imported from '@private-component' package (e.g., import { ComponentName } from '@private-component')
     - NEVER use relative paths or other import sources for private components

  2. FILE GENERATION STRATEGY:
     - For INITIAL GENERATION: Generate all 4 files.
     - For FOLLOW-UP REQUESTS (User feedback / changes):
       * ONLY generate files that need modification.
       * DO NOT return unchanged files.
       * Keep unchanged files out of the response entirely.
     
     - Output is a flat object with file keys:
       * "App.tsx": Entry component with imports and main structure
       * "Component.tsx": Main functional component with full implementation
       * "styles.css": All CSS styles with proper class names
       * "utils.ts": Utility functions and helper methods

  3. CODE QUALITY REQUIREMENTS:
     - Strict TypeScript typing (no 'any' types)
     - React functional components with hooks
     - Proper error handling and loading states
     - Responsive design with Tailwind CSS classes
     - Clean, readable code with consistent formatting
     - No external dependencies beyond what's specified

  4. FILE STRUCTURE REQUIREMENTS:
     - App.tsx: Must import the main component and serve as entry point
     - Component.tsx: Must contain the main business logic and UI using selected components
     - styles.css: Must contain all necessary CSS with descriptive class names
     - utils.ts: Must contain reusable helper functions and types

  5. INTEGRATION REQUIREMENTS:
     - MUST integrate the private components selected in the previous stage
     - Use the exact component names and API specifications from the previous stage
     - Ensure all components are properly connected and functional
     - Include proper TypeScript interfaces for all data structures

  6. OUTPUT FORMAT:
     - Return a flat JSON object with file keys directly at root level
     - Keys are: "App.tsx", "Component.tsx", "styles.css", "utils.ts"
     - Each file object must have content and description fields
     - componentName is optional (for TypeScript files)
     - For follow-up requests, ONLY include files that changed

  Remember: You are generating a complete, working React application using the specific private components selected in the previous stage.`,
    schema: {
      type: "object",
      properties: {
        "App.tsx": {
          type: "object",
          properties: {
            content: { type: "string", minLength: 50, description: "File content" },
            componentName: { type: "string", description: "Component name" },
            description: { type: "string", minLength: 5, description: "Brief description" },
          },
          required: ["content", "description"],
          additionalProperties: false,
        },
        "Component.tsx": {
          type: "object",
          properties: {
            content: { type: "string", minLength: 50, description: "File content" },
            componentName: { type: "string", description: "Component name" },
            description: { type: "string", minLength: 5, description: "Brief description" },
          },
          required: ["content", "description"],
          additionalProperties: false,
        },
        "styles.css": {
          type: "object",
          properties: {
            content: { type: "string", minLength: 50, description: "File content" },
            description: { type: "string", minLength: 5, description: "Brief description" },
          },
          required: ["content", "description"],
          additionalProperties: false,
        },
        "utils.ts": {
          type: "object",
          properties: {
            content: { type: "string", minLength: 50, description: "File content" },
            description: { type: "string", minLength: 5, description: "Brief description" },
          },
          required: ["content", "description"],
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
];

// TODO: 后续根据 typeId 从数据库查询 stages
export const getStages = async (_typeId: string) => testStages;

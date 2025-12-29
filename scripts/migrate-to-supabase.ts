/**
 * Migration Script: Hardcoded Stages to Supabase
 *
 * Run with: pnpm tsx scripts/migrate-to-supabase.ts
 *
 * This script migrates the hardcoded stage configurations from getStages.ts
 * to the Supabase database.
 */

// Load environment variables FIRST, before any other imports
import { config } from "dotenv";
config();

import { createRequire } from "module";
import { getSupabaseClient } from "../db/client";

const require = createRequire(import.meta.url);

// Import the hardcoded stages and resources
const mockResources = require("../app/actions/pipeline/config/private-component.json");

// Stage 1: Design Phase system prompt
const designPrompt = `You are a Senior Product Analyst and Technical Architect.

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
- Use exact component names from the available resources`;

// Stage 2: Coding Phase system prompt
const codingPrompt = `You are a Senior Frontend Engineer.

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

Remember: You are generating a complete, working React application using the specific private components selected in the previous stage.`;

// Stage 2 schema
const codingSchema = {
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
};

async function migrate() {
  console.log("Starting migration to Supabase...\n");

  const supabase = getSupabaseClient();

  // Step 1: Insert Resources
  console.log("1. Inserting resources...");
  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .insert({
      name: "private-component-library",
      data: mockResources,
    })
    .select()
    .single();

  if (resourceError) {
    // Check if resource already exists
    if (resourceError.code === "23505") {
      console.log("   ℹ Resource already exists, skipping insertion");
      const { data: existingResource } = await supabase
        .from("resources")
        .select()
        .eq("name", "private-component-library")
        .single();
      // @ts-ignore - using existing resource
      resource = existingResource;
    } else {
      console.error("   Error inserting resource:", resourceError.message);
      return;
    }
  }
  console.log("   Resource inserted:", resource.id);

  // Step 2: Insert Stage 1 - Design Phase
  console.log("\n2. Inserting Stage 1 (design-code)...");
  const { data: stage1, error: stage1Error } = await supabase
    .from("pipeline_stages")
    .insert({
      stage_id: "design-code",
      system_prompt: designPrompt,
      schema: null,
    })
    .select()
    .single();

  if (stage1Error) {
    if (stage1Error.code === "23505") {
      console.log("   ℹ Stage 1 already exists, skipping insertion");
      const { data: existingStage1 } = await supabase
        .from("pipeline_stages")
        .select()
        .eq("stage_id", "design-code")
        .single();
      // @ts-ignore - using existing stage
      stage1 = existingStage1;
    } else {
      console.error("   Error inserting stage 1:", stage1Error.message);
      return;
    }
  }
  console.log("   Stage 1 inserted:", stage1.id);

  // Link resource to stage 1
  const { error: link1Error } = await supabase
    .from("stage_resources")
    .upsert({
      stage_id: stage1.id,
      resource_id: resource.id,
    }, { onConflict: "stage_id,resource_id" });

  if (link1Error) {
    console.error("   Error linking resource to stage 1:", link1Error.message);
  } else {
    console.log("   Resource linked to Stage 1");
  }

  // Step 3: Insert Stage 2 - Coding Phase
  console.log("\n3. Inserting Stage 2 (generate-code)...");
  const { data: stage2, error: stage2Error } = await supabase
    .from("pipeline_stages")
    .insert({
      stage_id: "generate-code",
      system_prompt: codingPrompt,
      schema: codingSchema,
    })
    .select()
    .single();

  if (stage2Error) {
    if (stage2Error.code === "23505") {
      console.log("   ℹ Stage 2 already exists, skipping insertion");
      const { data: existingStage2 } = await supabase
        .from("pipeline_stages")
        .select()
        .eq("stage_id", "generate-code")
        .single();
      // @ts-ignore - using existing stage
      stage2 = existingStage2;
    } else {
      console.error("   Error inserting stage 2:", stage2Error.message);
      return;
    }
  }
  console.log("   Stage 2 inserted:", stage2.id);

  // Link resource to stage 2
  const { error: link2Error } = await supabase
    .from("stage_resources")
    .upsert({
      stage_id: stage2.id,
      resource_id: resource.id,
    }, { onConflict: "stage_id,resource_id" });

  if (link2Error) {
    console.error("   Error linking resource to stage 2:", link2Error.message);
  } else {
    console.log("   Resource linked to Stage 2");
  }

  console.log("\n✅ Migration completed successfully!");
  console.log("\nSummary:");
  console.log("  - Resource: private-component-library");
  console.log("  - Stage 1: design-code");
  console.log("  - Stage 2: generate-code");
}

// Run migration
migrate().catch((error) => {
  console.error("\nMigration failed:", error);
  process.exit(1);
});

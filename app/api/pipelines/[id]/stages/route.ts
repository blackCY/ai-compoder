import { NextResponse } from "next/server";
import { fetchStagesFull, createStage } from "db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const stages = await fetchStagesFull(pipelineId);

    return NextResponse.json(stages);
  } catch (error) {
    console.error("Failed to fetch stages:", error);
    return NextResponse.json(
      { error: "Failed to fetch stages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const body = await request.json();
    const created = await createStage(pipelineId, body);
    return NextResponse.json(created);
  } catch (error) {
    console.error("Failed to create stage:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create stage" },
      { status: 500 }
    );
  }
}

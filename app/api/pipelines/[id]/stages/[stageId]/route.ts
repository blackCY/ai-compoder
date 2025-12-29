import { NextResponse } from "next/server";
import { updateStage, deleteStage } from "@/db/queries";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const { stageId } = await params;
    const body = await request.json();
    
    // Remove metadata that shouldn't be updated directly via this endpoint
    const { id, created_at, pipeline_id, ...updateData } = body;
    
    const updated = await updateStage(stageId, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update stage:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update stage" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const { stageId } = await params;
    await deleteStage(stageId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete stage:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete stage" },
      { status: 500 }
    );
  }
}

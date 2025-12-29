import { NextResponse } from "next/server";
import { fetchPipelines, updatePipeline, deletePipeline } from "@/db/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pipelines = await fetchPipelines();
    const pipeline = pipelines.find((p) => p.id === id);

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Failed to fetch pipeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updatePipeline(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update pipeline:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update pipeline" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePipeline(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete pipeline:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete pipeline" },
      { status: 500 }
    );
  }
}

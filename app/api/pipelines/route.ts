import { NextResponse } from "next/server";
import { fetchPipelines, createPipeline } from "@/db/queries";

export async function GET() {
  try {
    const pipelines = await fetchPipelines();
    return NextResponse.json(pipelines); // pipelines is DbPipeline[]
  } catch (error) {
    console.error("Failed to fetch pipelines:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipelines" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newPipeline = await createPipeline({ name, description });
    return NextResponse.json(newPipeline);
  } catch (error) {
    console.error("Failed to create pipeline:", error);
    return NextResponse.json(
      { error: "Failed to create pipeline" },
      { status: 500 }
    );
  }
}


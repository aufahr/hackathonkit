import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "audio file is required" },
        { status: 400 }
      );
    }

    // Convert File to Blob for ElevenLabs API
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type || "audio/webm",
    });

    const result = await client.speechToText.convert({
      file: audioBlob,
      model_id: "scribe_v1",
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Error transcribing speech:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

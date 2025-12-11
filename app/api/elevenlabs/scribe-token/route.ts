import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    // For ElevenLabs Scribe real-time STT, we use the API key directly
    // The @elevenlabs/client Scribe.connect() accepts the API key as the token
    return NextResponse.json({
      token: process.env.ELEVENLABS_API_KEY
    });
  } catch (error) {
    console.error("Error getting scribe token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
export default defineSchema({
  ...authTables,
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),

  // Dungeon game sessions
  dungeonSessions: defineTable({
    code: v.string(),
    adventureId: v.string(),
    status: v.union(
      v.literal("lobby"),
      v.literal("playing"),
      v.literal("paused"),
      v.literal("ended")
    ),
    currentScene: v.number(),
    gameState: v.object({
      hp: v.number(),
      gold: v.number(),
      inventory: v.array(v.string()),
      flags: v.record(v.string(), v.boolean()),
    }),
    lastNarration: v.optional(v.string()),
    // Turn-based tracking
    activePlayerId: v.optional(v.id("dungeonPlayers")),
    turnPhase: v.optional(v.union(
      v.literal("intro"),
      v.literal("player_turn"),
      v.literal("dm_speaking"),
      v.literal("waiting")
    )),
    createdAt: v.number(),
  })
    .index("by_code", ["code"]),

  // Players who join via QR code (no auth required)
  dungeonPlayers: defineTable({
    sessionId: v.id("dungeonSessions"),
    name: v.string(),
    avatar: v.string(),
    isActive: v.boolean(),
    lastSeen: v.number(),
  }).index("by_session", ["sessionId"]),

  // Game events log (narrations, actions, etc.)
  dungeonEvents: defineTable({
    sessionId: v.id("dungeonSessions"),
    type: v.union(
      v.literal("narration"),
      v.literal("player_action"),
      v.literal("sound_effect"),
      v.literal("scene_change")
    ),
    playerId: v.optional(v.id("dungeonPlayers")),
    content: v.string(),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]),
});

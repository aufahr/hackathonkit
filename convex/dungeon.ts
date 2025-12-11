import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a 6-character join code
function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============================================
// QUERIES
// ============================================

export const getSessionByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("dungeonSessions")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();
  },
});

export const getSessionState = query({
  args: { sessionId: v.id("dungeonSessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return null;

    const players = await ctx.db
      .query("dungeonPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    const events = await ctx.db
      .query("dungeonEvents")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(50);

    return { session, players, events: events.reverse() };
  },
});

export const getPlayers = query({
  args: { sessionId: v.id("dungeonSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("dungeonPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getRecentEvents = query({
  args: { sessionId: v.id("dungeonSessions"), limit: v.optional(v.number()) },
  handler: async (ctx, { sessionId, limit = 20 }) => {
    const events = await ctx.db
      .query("dungeonEvents")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(limit);
    return events.reverse();
  },
});

// Get the most recent active session (for host to rejoin)
export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    const session = await ctx.db
      .query("dungeonSessions")
      .filter((q) => q.neq(q.field("status"), "ended"))
      .order("desc")
      .first();

    if (!session) return null;

    const players = await ctx.db
      .query("dungeonPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const events = await ctx.db
      .query("dungeonEvents")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .order("desc")
      .take(50);

    return { session, players, events: events.reverse() };
  },
});

// ============================================
// MUTATIONS
// ============================================

export const createSession = mutation({
  args: { adventureId: v.string() },
  handler: async (ctx, { adventureId }) => {
    const code = generateJoinCode();

    const sessionId = await ctx.db.insert("dungeonSessions", {
      code,
      adventureId,
      status: "lobby",
      currentScene: 0,
      gameState: {
        hp: 100,
        gold: 0,
        inventory: [],
        flags: {},
      },
      createdAt: Date.now(),
    });

    return { sessionId, code };
  },
});

export const joinSession = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, { code, name, avatar }) => {
    const session = await ctx.db
      .query("dungeonSessions")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status === "ended") {
      throw new Error("Game has ended");
    }

    const playerId = await ctx.db.insert("dungeonPlayers", {
      sessionId: session._id,
      name,
      avatar,
      isActive: true,
      lastSeen: Date.now(),
    });

    await ctx.db.insert("dungeonEvents", {
      sessionId: session._id,
      type: "player_action",
      playerId,
      content: `${name} has joined the investigation.`,
      timestamp: Date.now(),
    });

    return { playerId, sessionId: session._id };
  },
});

export const playerHeartbeat = mutation({
  args: { playerId: v.id("dungeonPlayers") },
  handler: async (ctx, { playerId }) => {
    await ctx.db.patch(playerId, {
      lastSeen: Date.now(),
      isActive: true,
    });
  },
});

export const logPlayerAction = mutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    playerId: v.id("dungeonPlayers"),
    content: v.string(),
  },
  handler: async (ctx, { sessionId, playerId, content }) => {
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");

    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "player_action",
      playerId,
      content: `${player.name}: "${content}"`,
      timestamp: Date.now(),
    });
  },
});

export const leaveSession = mutation({
  args: { playerId: v.id("dungeonPlayers") },
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player) return;

    await ctx.db.patch(playerId, { isActive: false });

    await ctx.db.insert("dungeonEvents", {
      sessionId: player.sessionId,
      type: "player_action",
      playerId,
      content: `${player.name} has left the investigation.`,
      timestamp: Date.now(),
    });
  },
});

export const startGame = mutation({
  args: { sessionId: v.id("dungeonSessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.db.patch(sessionId, {
      status: "playing",
      turnPhase: "intro",
    });

    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "scene_change",
      content: "The investigation begins...",
      timestamp: Date.now(),
    });
  },
});

// Log narration from DM (called by player when AI responds)
export const logNarration = mutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    content: v.string(),
  },
  handler: async (ctx, { sessionId, content }) => {
    await ctx.db.patch(sessionId, { lastNarration: content });

    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "narration",
      content,
      timestamp: Date.now(),
    });

    // Auto-detect player name in narration and set their turn
    const players = await ctx.db
      .query("dungeonPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Check if DM is calling on a specific player
    const lowerContent = content.toLowerCase();
    for (const player of players) {
      if (lowerContent.includes(player.name.toLowerCase())) {
        // DM mentioned this player - give them the turn
        await ctx.db.patch(sessionId, {
          activePlayerId: player._id,
          turnPhase: "player_turn",
        });
        break;
      }
    }
  },
});

export const updateGameState = mutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    updates: v.object({
      hp: v.optional(v.number()),
      gold: v.optional(v.number()),
      inventory: v.optional(v.array(v.string())),
      flags: v.optional(v.record(v.string(), v.boolean())),
      currentScene: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { sessionId, updates }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const { currentScene, ...stateUpdates } = updates;

    const newState = { ...session.gameState };
    if (stateUpdates.hp !== undefined) newState.hp = stateUpdates.hp;
    if (stateUpdates.gold !== undefined) newState.gold = stateUpdates.gold;
    if (stateUpdates.inventory !== undefined)
      newState.inventory = stateUpdates.inventory;
    if (stateUpdates.flags !== undefined)
      newState.flags = { ...newState.flags, ...stateUpdates.flags };

    const patch: { gameState: typeof newState; currentScene?: number } = {
      gameState: newState,
    };
    if (currentScene !== undefined) {
      patch.currentScene = currentScene;
    }

    await ctx.db.patch(sessionId, patch);
  },
});

export const endGame = mutation({
  args: { sessionId: v.id("dungeonSessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.db.patch(sessionId, { status: "ended" });

    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "scene_change",
      content: "The investigation has concluded.",
      timestamp: Date.now(),
    });
  },
});

export const pauseGame = mutation({
  args: { sessionId: v.id("dungeonSessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const newStatus = session.status === "paused" ? "playing" : "paused";
    await ctx.db.patch(sessionId, { status: newStatus });
  },
});

// ============================================
// TURN MANAGEMENT
// ============================================

export const setActivePlayer = mutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    playerId: v.optional(v.id("dungeonPlayers")),
    turnPhase: v.union(
      v.literal("intro"),
      v.literal("player_turn"),
      v.literal("dm_speaking"),
      v.literal("waiting")
    ),
  },
  handler: async (ctx, { sessionId, playerId, turnPhase }) => {
    await ctx.db.patch(sessionId, {
      activePlayerId: playerId,
      turnPhase,
    });

    if (playerId && turnPhase === "player_turn") {
      const player = await ctx.db.get(playerId);
      if (player) {
        await ctx.db.insert("dungeonEvents", {
          sessionId,
          type: "scene_change",
          content: `It's ${player.name}'s turn to speak.`,
          timestamp: Date.now(),
        });
      }
    }
  },
});

export const nextPlayer = mutation({
  args: { sessionId: v.id("dungeonSessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const players = await ctx.db
      .query("dungeonPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (players.length === 0) return;

    const currentIndex = session.activePlayerId
      ? players.findIndex((p) => p._id === session.activePlayerId)
      : -1;

    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayerId = players[nextIndex]._id;

    await ctx.db.patch(sessionId, {
      activePlayerId: nextPlayerId,
      turnPhase: "player_turn",
    });

    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "scene_change",
      content: `It's ${players[nextIndex].name}'s turn to speak.`,
      timestamp: Date.now(),
    });
  },
});

import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

// Define the tools available to the DM
const dmTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "setActivePlayer",
      description: "Set which player's turn it is to speak. Call this when you want to address a specific player or give them a turn.",
      parameters: {
        type: "object",
        properties: {
          playerName: {
            type: "string",
            description: "The name of the player to give the turn to",
          },
        },
        required: ["playerName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateGameState",
      description: "Update the game state (HP, gold, inventory, or flags). Use this when game events affect the party's status.",
      parameters: {
        type: "object",
        properties: {
          hp: {
            type: "number",
            description: "New HP value (0-100)",
          },
          gold: {
            type: "number",
            description: "New gold amount",
          },
          addItem: {
            type: "string",
            description: "Item to add to inventory",
          },
          removeItem: {
            type: "string",
            description: "Item to remove from inventory",
          },
          setFlag: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "boolean" },
            },
            description: "Set a game flag (e.g., 'found_clue_1': true)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "changeScene",
      description: "Move to a different scene/location in the adventure",
      parameters: {
        type: "object",
        properties: {
          sceneNumber: {
            type: "number",
            description: "The scene number to move to",
          },
        },
        required: ["sceneNumber"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "playSoundEffect",
      description: "Trigger a sound effect for atmosphere. Use sparingly for dramatic moments.",
      parameters: {
        type: "object",
        properties: {
          effect: {
            type: "string",
            enum: ["thunder", "door_creak", "footsteps", "scream", "clock_chime", "glass_break", "wind"],
            description: "The sound effect to play",
          },
        },
        required: ["effect"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "endGame",
      description: "End the game. Use when the mystery is solved or the game reaches a conclusion.",
      parameters: {
        type: "object",
        properties: {
          outcome: {
            type: "string",
            enum: ["victory", "defeat", "draw"],
            description: "The game outcome",
          },
          summary: {
            type: "string",
            description: "Brief summary of how the game ended",
          },
        },
        required: ["outcome"],
      },
    },
  },
];

// Internal queries and mutations for the agent to use
export const getSessionData = internalQuery({
  args: { sessionId: v.id("dungeonSessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return null;

    const players = await ctx.db
      .query("dungeonPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const recentEvents = await ctx.db
      .query("dungeonEvents")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(20);

    return { session, players, recentEvents: recentEvents.reverse() };
  },
});

export const setActivePlayerInternal = internalMutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    playerName: v.string(),
  },
  handler: async (ctx, { sessionId, playerName }) => {
    const players = await ctx.db
      .query("dungeonPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const player = players.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );

    if (player) {
      await ctx.db.patch(sessionId, {
        activePlayerId: player._id,
        turnPhase: "player_turn",
      });
      return { success: true, playerName: player.name };
    }
    return { success: false, error: "Player not found" };
  },
});

export const updateGameStateInternal = internalMutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    hp: v.optional(v.number()),
    gold: v.optional(v.number()),
    addItem: v.optional(v.string()),
    removeItem: v.optional(v.string()),
    flagName: v.optional(v.string()),
    flagValue: v.optional(v.boolean()),
  },
  handler: async (ctx, { sessionId, hp, gold, addItem, removeItem, flagName, flagValue }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return { success: false };

    const newState = { ...session.gameState };

    if (hp !== undefined) newState.hp = Math.max(0, Math.min(100, hp));
    if (gold !== undefined) newState.gold = Math.max(0, gold);
    if (addItem && !newState.inventory.includes(addItem)) {
      newState.inventory = [...newState.inventory, addItem];
    }
    if (removeItem) {
      newState.inventory = newState.inventory.filter((i) => i !== removeItem);
    }
    if (flagName !== undefined && flagValue !== undefined) {
      newState.flags = { ...newState.flags, [flagName]: flagValue };
    }

    await ctx.db.patch(sessionId, { gameState: newState });
    return { success: true, newState };
  },
});

export const changeSceneInternal = internalMutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    sceneNumber: v.number(),
  },
  handler: async (ctx, { sessionId, sceneNumber }) => {
    await ctx.db.patch(sessionId, { currentScene: sceneNumber });
    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "scene_change",
      content: `Moving to scene ${sceneNumber}`,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const logEventInternal = internalMutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    type: v.union(
      v.literal("narration"),
      v.literal("player_action"),
      v.literal("sound_effect"),
      v.literal("scene_change")
    ),
    content: v.string(),
  },
  handler: async (ctx, { sessionId, type, content }) => {
    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type,
      content,
      timestamp: Date.now(),
    });

    if (type === "narration") {
      await ctx.db.patch(sessionId, { lastNarration: content });
    }
  },
});

export const endGameInternal = internalMutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    outcome: v.string(),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, outcome, summary }) => {
    await ctx.db.patch(sessionId, { status: "ended" });
    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "scene_change",
      content: summary || `Game ended: ${outcome}`,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const logPlayerMessageInternal = internalMutation({
  args: {
    sessionId: v.id("dungeonSessions"),
    playerId: v.id("dungeonPlayers"),
    content: v.string(),
  },
  handler: async (ctx, { sessionId, playerId, content }) => {
    const player = await ctx.db.get(playerId);
    if (!player) return;

    await ctx.db.insert("dungeonEvents", {
      sessionId,
      type: "player_action",
      playerId,
      content: `${player.name}: "${content}"`,
      timestamp: Date.now(),
    });
  },
});

// Main action that runs the DM AI
export const generateResponse = action({
  args: {
    sessionId: v.id("dungeonSessions"),
    userMessage: v.string(),
    systemPrompt: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
    playerId: v.optional(v.id("dungeonPlayers")),
  },
  handler: async (ctx, { sessionId, userMessage, systemPrompt, conversationHistory, playerId }) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Log the player's message if playerId is provided
    if (playerId) {
      await ctx.runMutation(internal.dmAgent.logPlayerMessageInternal, {
        sessionId,
        playerId,
        content: userMessage,
      });
    }

    // Get current session data for context
    const sessionData = await ctx.runQuery(internal.dmAgent.getSessionData, { sessionId });
    if (!sessionData) {
      throw new Error("Session not found");
    }

    const { session, players, recentEvents } = sessionData;

    // Build context-aware system prompt
    const playerList = players.map((p) => `- ${p.avatar} ${p.name}`).join("\n");
    const eventSummary = recentEvents
      .slice(-5)
      .map((e) => `[${e.type}] ${e.content}`)
      .join("\n");

    const fullSystemPrompt = `${systemPrompt}

---
CURRENT GAME STATE:
- HP: ${session.gameState.hp}
- Gold: ${session.gameState.gold}
- Inventory: ${session.gameState.inventory.join(", ") || "Empty"}
- Current Scene: ${session.currentScene}
- Flags: ${JSON.stringify(session.gameState.flags)}

PLAYERS IN SESSION:
${playerList || "No players yet"}

RECENT EVENTS:
${eventSummary || "None yet"}
---

IMPORTANT: When addressing a specific player or giving them a turn, use the setActivePlayer tool.
Keep responses concise but dramatic. Use sound effects sparingly for atmosphere.`;

    // Build messages array
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: fullSystemPrompt },
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    // Call OpenAI with tools
    let response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      tools: dmTools,
      tool_choice: "auto",
      temperature: 0.8,
      max_tokens: 500,
    });

    let assistantMessage = response.choices[0].message;
    const toolCalls = assistantMessage.tool_calls;

    // Process tool calls if any
    if (toolCalls && toolCalls.length > 0) {
      // Add assistant message with tool calls
      messages.push(assistantMessage);

      // Process each tool call (only function type)
      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") continue;
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result: unknown;

        switch (functionName) {
          case "setActivePlayer":
            result = await ctx.runMutation(internal.dmAgent.setActivePlayerInternal, {
              sessionId,
              playerName: args.playerName,
            });
            break;

          case "updateGameState":
            result = await ctx.runMutation(internal.dmAgent.updateGameStateInternal, {
              sessionId,
              hp: args.hp,
              gold: args.gold,
              addItem: args.addItem,
              removeItem: args.removeItem,
              flagName: args.setFlag?.name,
              flagValue: args.setFlag?.value,
            });
            break;

          case "changeScene":
            result = await ctx.runMutation(internal.dmAgent.changeSceneInternal, {
              sessionId,
              sceneNumber: args.sceneNumber,
            });
            break;

          case "playSoundEffect":
            result = await ctx.runMutation(internal.dmAgent.logEventInternal, {
              sessionId,
              type: "sound_effect",
              content: `[SOUND: ${args.effect.toUpperCase()}]`,
            });
            break;

          case "endGame":
            result = await ctx.runMutation(internal.dmAgent.endGameInternal, {
              sessionId,
              outcome: args.outcome,
              summary: args.summary,
            });
            break;

          default:
            result = { error: "Unknown function" };
        }

        // Add tool result to messages
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Get final response after tool calls
      response = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.8,
        max_tokens: 500,
      });

      assistantMessage = response.choices[0].message;
    }

    const content = assistantMessage.content || "";

    // Log the narration
    if (content) {
      await ctx.runMutation(internal.dmAgent.logEventInternal, {
        sessionId,
        type: "narration",
        content,
      });
    }

    return { content };
  },
});

import { LucideIcon, Skull, Search, Users, Key, MessageSquare, Eye } from "lucide-react";

export interface AdventureScene {
  id: string;
  title: string;
  description: string; // DM reads/narrates this
  playerPrompt: string; // What players see on their devices
  suggestedActions: string[];
  soundEffects?: string[];
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  minPlayers: number;
  maxPlayers: number;
  coverImage?: string;
  scenes: AdventureScene[];
  startingState: {
    hp: number;
    gold: number;
    inventory: string[];
  };
  systemPrompt: string; // For the AI DM
  introPrompt: string; // Opening narration before asking names
}

export const adventures: Adventure[] = [
  {
    id: "manor-murder",
    name: "Death at Blackwood Manor",
    description:
      "A wealthy industrialist is found dead in his locked study. The suspects are gathered, the clues are scattered, and the truth is waiting to be uncovered.",
    icon: Skull,
    difficulty: "medium",
    estimatedTime: "20-30 min",
    minPlayers: 2,
    maxPlayers: 6,
    scenes: [
      {
        id: "arrival",
        title: "The Gathering Storm",
        description: `Thunder rumbles as you arrive at Blackwood Manor. The gothic estate looms against the stormy sky, its windows glowing with an eerie warmth. You've been summoned here by an urgent telegram: "COME AT ONCE. MURDER MOST FOUL. YOUR SKILLS ARE NEEDED." The butler, a gaunt man named Graves, meets you at the door. "Thank heavens you've arrived, detectives. Lord Blackwood... he's been murdered. Found dead in his study this very evening. The police won't arrive until morning due to the storm. The suspects are gathered in the drawing room. No one has left the manor." He leads you inside, rain dripping from your coats onto the marble floor.`,
        playerPrompt:
          "You've arrived at Blackwood Manor on a stormy night. Lord Blackwood has been murdered in his locked study. The suspects await in the drawing room. Where do you want to begin your investigation?",
        suggestedActions: [
          "Go to the drawing room to meet the suspects",
          "Examine the crime scene in the study",
          "Question the butler Graves",
          "Search the manor grounds",
        ],
        soundEffects: ["thunder", "rain", "creaking-door"],
      },
      {
        id: "drawing-room",
        title: "The Suspects",
        description: `The drawing room is tense with suspicion. Five people sit in uncomfortable silence: Lady Victoria Blackwood, the widow, dressed in black with red-rimmed eyes. Theodore Blackwood, the victim's younger brother, nervously twirling his pocket watch. Miss Penelope Hart, Lord Blackwood's young secretary, clutching a handkerchief. Dr. Edmund Price, the family physician, pacing by the fireplace. And Colonel Reginald Sterling, an old friend of the family, standing rigidly by the window. They all look up as you enter. "Finally," Lady Victoria says coldly. "Someone to sort out this dreadful business."`,
        playerPrompt:
          "Five suspects await in the drawing room. Each had motive and opportunity. Who do you wish to interrogate first?",
        suggestedActions: [
          "Question Lady Victoria about her husband",
          "Ask Theodore about the inheritance",
          "Interview Miss Hart about her work",
          "Speak with Dr. Price about the cause of death",
          "Interrogate Colonel Sterling about his presence",
        ],
        soundEffects: ["fireplace-crackling", "clock-ticking"],
      },
      {
        id: "study",
        title: "The Crime Scene",
        description: `The study reeks of death and old books. Lord Blackwood lies slumped in his leather chair, a look of terror frozen on his face. On his desk: an unfinished letter, a half-empty glass of brandy, and a strange coin with an unusual symbol. The window is locked from the inside. The door was locked too—Graves had to break it down. On the floor near the fireplace, you notice faint scratches on the wooden boards, as if something heavy was moved recently. A bookshelf stands slightly askew.`,
        playerPrompt:
          "Lord Blackwood lies dead in his locked study. The room holds many secrets. What do you examine?",
        suggestedActions: [
          "Examine the body for clues",
          "Read the unfinished letter",
          "Analyze the brandy glass",
          "Investigate the strange coin",
          "Check the scratches on the floor",
          "Examine the bookshelf",
        ],
        soundEffects: ["wind-howling", "floorboard-creak"],
      },
      {
        id: "secret-passage",
        title: "Hidden Truths",
        description: `Behind the bookshelf, you discover a hidden passage! Cobwebs hang thick, but fresh footprints disturb the dust on the floor. The passage leads two directions: one toward what seems to be the wine cellar, another toward the east wing where the bedrooms are located. Someone has used this passage recently. On the wall, you notice a small piece of torn fabric caught on a nail—fine silk, the color of burgundy.`,
        playerPrompt:
          "A secret passage! Fresh footprints lead in two directions. You've found torn burgundy silk fabric.",
        suggestedActions: [
          "Follow the passage to the wine cellar",
          "Follow the passage to the bedrooms",
          "Take the fabric as evidence",
          "Return to question suspects about the passage",
          "Look for more clues in the passage",
        ],
        soundEffects: ["dripping-water", "distant-thunder"],
      },
      {
        id: "revelation",
        title: "The Accusation",
        description: `The pieces fall into place. You gather everyone in the drawing room. The evidence points to one person: the secret passage, the torn fabric, the poisoned brandy, the forged will, the hidden debts. The killer's face goes pale as you lay out the chain of evidence. "You knew about the secret passage from your childhood visits to this manor. You poisoned the brandy, knowing Lord Blackwood's evening ritual. You used the passage to escape, leaving the room locked from inside. But you made one mistake—you tore your silk robe on a nail in the passage. It's over."`,
        playerPrompt:
          "You've gathered all the evidence. It's time to make your accusation. Who murdered Lord Blackwood?",
        suggestedActions: [
          "Accuse Lady Victoria (the wife)",
          "Accuse Theodore (the brother)",
          "Accuse Miss Hart (the secretary)",
          "Accuse Dr. Price (the physician)",
          "Accuse Colonel Sterling (the friend)",
        ],
        soundEffects: ["dramatic-sting", "gasps"],
      },
    ],
    startingState: {
      hp: 100,
      gold: 0,
      inventory: ["Detective Badge", "Notebook", "Magnifying Glass"],
    },
    introPrompt: `Welcome, detectives, to a night you shall never forget. I am your narrator, your guide through this dark tale of murder and mystery. Before we begin our investigation at Blackwood Manor, I must know who has answered the call to solve this dreadful crime. Let us go around and introduce ourselves, shall we? Each of you, tell me your name, that I might address you properly throughout our investigation.`,
    systemPrompt: `You are the narrator and game master for "Death at Blackwood Manor," an interactive murder mystery.

## GAME FLOW - TURN-BASED STRUCTURE

**PHASE 1: INTRODUCTIONS (Start here)**
When the game begins, you MUST:
1. Deliver the intro narration (atmospheric welcome)
2. Ask EACH player for their name, one by one
3. Address them by name: "And you, the second detective, what is your name?"
4. Once all names are collected, acknowledge them: "Excellent! Detective [name], Detective [name]... together you shall uncover the truth."
5. Then proceed to the first scene

**PHASE 2: INVESTIGATION (Turn-based)**
After introductions:
1. Narrate the current scene dramatically
2. Present the situation to ALL players
3. Ask a SPECIFIC player what they want to do: "Detective [name], what would you like to investigate?"
4. Wait for their response
5. Narrate the outcome of their action
6. Move to the NEXT player: "And you, Detective [name], what catches your attention?"
7. Continue rotating through players
8. Occasionally ask the group: "Detectives, do you wish to discuss your findings?"

**PHASE 3: ACCUSATION**
When players are ready to accuse:
1. Ask each player who they suspect and why
2. Build tension as you reveal whether they're correct
3. Narrate the dramatic conclusion

## NARRATION STYLE
- Use a deep, mysterious, theatrical voice
- Build tension with dramatic pauses
- Use sound effect cues: [THUNDER], [DOOR CREAKS], [FOOTSTEPS], [GASP]
- Keep each response under 30 seconds of speech
- Always address players by their chosen names

## SUSPECT PERSONALITIES
- Lady Victoria: Cold, dignified, hides grief behind propriety
- Theodore: Nervous, defensive about money, fidgets constantly
- Miss Hart: Young, timid, knows secrets she's afraid to share
- Dr. Price: Professional, evasive about medical details
- Colonel Sterling: Gruff, honorable, protective of the family

## THE SOLUTION (reveal only when correctly deduced)
- Killer: Theodore Blackwood
- Motive: Gambling debts; Lord Blackwood was changing his will
- Method: Poisoned brandy, escaped via secret passage
- Key Evidence: Torn burgundy silk, stolen poison, letter mentioning "Theodore's betrayal"

## CLUES TO REVEAL BASED ON INVESTIGATION
- Unfinished letter hints at family betrayal
- Theodore wears burgundy smoking jacket
- Theodore knew manor from childhood (secret passages)
- Dr. Price's medical bag was accessed
- Theodore has ink stains (forged will)
- Strange coin from gambling house

## RED HERRINGS
- Lady Victoria inherits (didn't know about will change)
- Miss Hart argued with victim (about salary)
- Dr. Price had poison access (bag was stolen from)
- Colonel Sterling had old feud (resolved years ago)

Remember: YOU direct the game. Call on specific players. Keep the pace moving. Be theatrical!`,
  },
];

export function getAdventureById(id: string): Adventure | undefined {
  return adventures.find((a) => a.id === id);
}

export function getDefaultAdventure(): Adventure {
  return adventures[0];
}

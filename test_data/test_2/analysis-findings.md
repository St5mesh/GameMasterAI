# Test 2 Analysis - Critical Issues Found

**Date:** December 8, 2025  
**Test Session:** test_2  
**Model Used:** qwen/qwen3-vl-8b  
**Verdict:** NOT WORKING AS INTENDED - Multiple Critical Failures

---

## Critical Issue #1: AI Ignoring System Prompt Instructions

The D&D system prompt (`DungeonsAndDragons.txt`) contains clear, explicit rules that are being completely ignored:

### What the System Prompt Says:
- **"Maximum response length: 150 words. Be concise."**
- **"STOP after describing ONE event or resolving ONE action. WAIT for player input."**
- **"NEVER advance time, change locations, or introduce new scenes without player consent."**
- **"NEVER reveal what would have happened on other roll results."**
- **"Roll a d20 yourself (pick a random number 1-20) and narrate ONLY the outcome that occurred."**
- **"DO NOT show multiple outcome branches or conditional text."**

### What the AI Actually Did:
- Generated 250-300+ word responses (nearly double the limit)
- Continued narrating multiple events without stopping for player input
- Listed multiple hypothetical outcomes instead of rolling and narrating one result
- Example from logs: *"If you eat it... If you don't eat it... Roll a CON... Roll a DEX... Roll a STR..."*
- Never actually rolled dice - just presented options

### Evidence from Chat Log:
```
GameMaster.AI: You're not alone in this sugary nightmare — here's what's *actually* 
around you (and maybe useful):

**1. Half-Eaten Cursed Cookie (in your hand)**
- If you eat it… the gingerbread man's stomach might *react*...
- If you *don't* eat it… the recipe on the wall might react...
- *Roll a CON save to resist its temptation.*

**2. Clock with a Caramelized Pendulum**
- If you can *stop* it, maybe the curse doesn't trigger.
- *Roll a DEX to dodge the pendulum's swing...*

**3. Chocolate Bar Shelf (on the ceiling)**
- *Roll a STR to climb...*
[continues for 7+ more items]
```

**This is exactly what the system prompt says NOT to do.**

---

## Critical Issue #2: Completely Inappropriate Narrative Tone

### Expected D&D Session:
- Coherent fantasy setting with proper D&D mechanics
- Clear scene setting with actionable choices
- Proper dice rolling system (d20 + modifiers vs DC)
- Structured turn-based gameplay
- DM describes, player responds, DM resolves action, repeat

### What Actually Happened:
- **Surreal, stream-of-consciousness storytelling** ("sentient gingerbread man's stomach", "dessert dragon", "chocolate bar shelf")
- **No D&D structure** - reads like a fever dream or absurdist comedy sketch
- **Wildly off-tone** - player created a "Former Baker's Apprentice" rogue, AI created a nonsensical pastry nightmare
- **Over-description and purple prose** instead of clear, actionable D&D gameplay
- **No pause for player agency** - AI just keeps narrating

### Example of Problematic Narrative:
```
"You're inside the belly of a giant, sentient gingerbread man — not the kind you'd 
find in a cookie jar, but one tall enough to swallow a bakery whole. The walls are 
warm, cinnamon-scented, and lined with sugary ribs that creak like old floorboards..."
```

**This is NOT standard D&D. This is creative writing run amok.**

---

## Critical Issue #3: Model Configuration Problems

### From `.env` file:
```
AI_PROVIDER=lmstudio
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_MODEL_DM=local-model-name       # ❌ PLACEHOLDER, NOT ACTUAL MODEL
LM_STUDIO_MODEL_CAMPAIGN=local-model-name # ❌ PLACEHOLDER
LM_STUDIO_MODEL_SUMMARY=local-model-name  # ❌ PLACEHOLDER
```

### From LM Studio Logs:
```
Running chat completion on conversation with X messages.
Model: qwen/qwen3-vl-8b
```

### Problems:
1. **Using placeholder names instead of actual model names** - this likely causes LM Studio to use whatever model is loaded, not what's intended
2. **Using qwen3-vl-8b** - this is a **Vision-Language multimodal model** designed for image understanding, NOT text-based roleplay
3. **8B parameter model** - too small for complex D&D game mastering (needs 13B+ minimum, ideally 70B)
4. **Wrong model family** - Qwen VL models are for vision tasks, not text instruction-following

### Why This Model Fails:
- Not trained for structured roleplay or game mastering
- Cannot follow complex system prompt instructions reliably
- Optimized for describing images, not maintaining D&D game state
- Too small to handle the cognitive load of D&D rules + narrative + character tracking

---

## Critical Issue #4: Token Limits Contradicting System Prompt

### From `server/ai-provider.js`:
```javascript
async function generateDMResponse(messages) {
    return generateAIResponse(messages, {
        modelType: 'dm',
        max_tokens: 500,  // ❌ WAY TOO HIGH
        temperature: 0.8   // ❌ TOO HIGH FOR STRUCTURED GAMEPLAY
    });
}

async function generateCampaign(messages) {
    return generateAIResponse(messages, {
        modelType: 'campaign',
        max_tokens: 1500,  // ❌ ABSURDLY HIGH
        temperature: 0.8
    });
}

async function generateSummary(messages) {
    return generateAIResponse(messages, {
        modelType: 'summary',
        max_tokens: 800,   // ❌ TOO HIGH
        temperature: 0.8
    });
}
```

### The Math:
- System prompt requests: **150 words max**
- Average conversion: **~1.33 tokens per word**
- Expected token limit: **~200 tokens**
- Actual token limit: **500 tokens** (2.5x too high)

**Result:** The AI has permission to generate 2.5x more text than the system prompt requests, so it ignores the length instruction.

---

## Critical Issue #5: Temperature Too High for Structured Gameplay

### Current Setting:
```javascript
temperature: 0.8
```

### Problem:
- **0.8 temperature** = high creativity/randomness
- Good for creative writing, BAD for structured gameplay
- Causes the AI to "get creative" and ignore instructions
- Results in unpredictable, off-rails responses

### Recommended for D&D:
- **0.5-0.6** for structured, consistent DM responses
- **0.7 maximum** if you want some creative flair
- **0.8+** only for freeform creative content, NOT rule-based games

---

## Critical Issue #6: Dice Rolling Not Working

### Player Input:
```
Player: 2. roll dex for me
```

### AI Response:
```
🎲 **Dexterity Roll: 18 (Natural 20!)** 🎲
```

### Problems:
1. **18 is NOT a Natural 20** - these are different things in D&D
2. AI appears to be making up results, not following actual D&D mechanics
3. No indication of: modifier applied, DC target, or actual calculation
4. The system should show: `d20 roll + DEX modifier (+3) = total vs DC`

### Expected D&D Format:
```
Rolling Dexterity (DC 12)...
You rolled 15 + 3 (DEX modifier) = 18. Success!
[Describe the successful outcome only]
```

---

## Critical Issue #7: Summary/Notetaker Output Is Broken

### From `webui-notetakerai-window-log`:
```
Summary:
If you don't… you might become a snack.* --- **6. Cinnamon Roll (on the floor)** 
- *It's not cursed — but it's *very* tempting.* - If you eat it… you might become 
a cinnamon roll. - *Roll a WIS to resist — or maybe you're just hungry.* 
[continues with more broken formatting]
```

### Problems:
1. **Not summarizing the adventure** - just copying the DM's rambling item list
2. **Broken formatting** - markdown asterisks, dashes, incomplete sentences
3. **No narrative continuity** - should be "Snick entered the bakery vault and discovered..." not "If you don't... you might..."
4. **Useless for reminders** - the summary is supposed to help maintain story continuity, this is gibberish

---

## Critical Issue #8: Context Window Management Issues

### From `ChatRoom.vue`:
```javascript
ContextLength: 3, // The number of most recent messages to consider
const lastMessages = this.conversation.slice(-this.ContextLength * 2);
```

### Analysis:
- Only sending **last 6 messages** (3 * 2) to AI
- For D&D, this is **too short** - AI loses context of earlier events
- System message gets dropped after initial setup
- Summary injection happens but may not be sufficient

### Evidence:
- First response has system context
- Later responses show AI "forgetting" the rules and going off-rails
- Each response treats conversation like fresh start

---

## Root Cause Summary

1. **Wrong Model Type** - Vision-language model used for text-only roleplay
2. **Wrong Model Size** - 8B too small for complex D&D mechanics
3. **Configuration Mismatch** - Token limits contradict system prompt instructions
4. **Temperature Too High** - Causing creative chaos instead of structured gameplay
5. **Model Not Following Instructions** - Either incapable or improperly configured
6. **Context Management** - Too short, dropping critical instructions

---

## Test Session Quality Assessment

**D&D Session Quality:** ❌ **FAILURE** (0/10)
- No coherent D&D structure
- System prompt completely ignored
- Dice mechanics broken
- Narrative tone inappropriate
- Player agency undermined
- Summary system broken

**Technical Functionality:** ⚠️ **PARTIAL** (4/10)
- API calls working
- Database saving/loading working
- Frontend displaying messages
- AI generating responses (but wrong ones)
- Token counting functional

**Overall Verdict:** ❌ **NOT PRODUCTION READY**

The system generates responses, but they are not D&D gameplay. This is a creative writing generator producing surreal fiction, not a dungeon master following D&D 5e rules.

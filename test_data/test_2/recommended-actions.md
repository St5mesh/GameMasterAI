# Recommended Actions to Fix GameMaster.AI

**Date:** December 8, 2025  
**Priority:** CRITICAL - System Not Functional for D&D Gameplay  
**Estimated Implementation Time:** 1-2 hours

---

## PRIORITY 1: Fix Model Configuration (CRITICAL)

### Action 1.1: Load Appropriate Model in LM Studio

**Current Problem:**
- Using `qwen/qwen3-vl-8b` (vision-language model, wrong type)
- 8B parameters too small for complex D&D

**Required Action:**
1. Open LM Studio
2. Download and load ONE of these models (in order of preference):

**Option A - Best Quality (if hardware supports):**
- `meta-llama/Meta-Llama-3.1-70B-Instruct` (GGUF Q4_K_M)
- Requires ~40GB VRAM/RAM
- Best instruction following, best D&D quality

**Option B - Good Quality (16GB+ VRAM):**
- `meta-llama/Meta-Llama-3.1-13B-Instruct` (GGUF Q5_K_M)
- Good balance of quality and performance
- Reliable instruction following

**Option C - Minimum Viable (8GB VRAM):**
- `meta-llama/Meta-Llama-3.1-8B-Instruct` (GGUF Q5_K_M)
- NOT `mistralai/Mistral-7B-Instruct-v0.3` (GGUF Q5_K_M)

**Option D - Alternative (if Llama unavailable):**
- `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO` (GGUF Q4_K_M)
- Excellent for roleplay, good instruction following

**Why These Models:**
- Trained specifically for instruction following
- Large enough context window (8K+ tokens)
- Good at maintaining role consistency
- Proven performance in roleplay/game scenarios
- NOT vision models, NOT base models (must be Instruct/Chat variants)

### Action 1.2: Update `.env` File with Actual Model Names

**File:** `/home/st5ubu/GamemasterAI-Test2/.env`

**Find the exact model name from LM Studio** (shown in the model dropdown), then update:

```bash
# BEFORE (WRONG):
LM_STUDIO_MODEL_DM=local-model-name
LM_STUDIO_MODEL_CAMPAIGN=local-model-name
LM_STUDIO_MODEL_SUMMARY=local-model-name

# AFTER (EXAMPLE - use your actual model name):
LM_STUDIO_MODEL_DM=meta-llama-3.1-8b-instruct
LM_STUDIO_MODEL_CAMPAIGN=meta-llama-3.1-8b-instruct
LM_STUDIO_MODEL_SUMMARY=meta-llama-3.1-8b-instruct
```

**Note:** The exact string must match what LM Studio shows in its API. Check by:
1. Opening LM Studio
2. Going to the Local Server tab
3. Looking at the model name shown in the interface

**Alternative:** You can keep all three the same model for simplicity, or use smaller/faster model for campaign/summary if needed.

---

## PRIORITY 2: Fix Token Limits and Temperature (CRITICAL)

### Action 2.1: Update `server/ai-provider.js`

**File:** `/home/st5ubu/GamemasterAI-Test2/server/ai-provider.js`

**Changes Required:**

```javascript
// BEFORE:
async function generateDMResponse(messages) {
    return generateAIResponse(messages, {
        modelType: 'dm',
        max_tokens: 500,  // ❌ TOO HIGH
        temperature: 0.8   // ❌ TOO HIGH
    });
}

async function generateCampaign(messages) {
    return generateAIResponse(messages, {
        modelType: 'campaign',
        max_tokens: 1500,  // ❌ TOO HIGH
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

// AFTER:
async function generateDMResponse(messages) {
    return generateAIResponse(messages, {
        modelType: 'dm',
        max_tokens: 200,      // ✅ Matches 150 word guideline
        temperature: 0.6      // ✅ More controlled, less random
    });
}

async function generateCampaign(messages) {
    return generateAIResponse(messages, {
        modelType: 'campaign',
        max_tokens: 100,      // ✅ Brief 2-sentence prompt
        temperature: 0.7      // ✅ Slightly more creative for setup
    });
}

async function generateSummary(messages) {
    return generateAIResponse(messages, {
        modelType: 'summary',
        max_tokens: 300,      // ✅ Concise summary format
        temperature: 0.5      // ✅ Factual summarization
    });
}
```

**Rationale:**
- **DM max_tokens: 200** - Enforces ~150 word limit (150 words × 1.33 tokens/word = ~200)
- **Temperature: 0.6** - Balances creativity with rule-following
- **Campaign max_tokens: 100** - Brief 2-sentence adventure hook as intended
- **Summary max_tokens: 300** - Adequate for concise summaries
- **Summary temperature: 0.5** - More factual, less creative interpretation

---

## PRIORITY 3: Improve System Prompt Enforcement (HIGH)

### Action 3.1: Strengthen D&D System Prompt

**File:** `/home/st5ubu/GamemasterAI-Test2/client/gamemasterai/src/prompts/DungeonsAndDragons.txt`

**Add to the very top (BEFORE existing content):**

```
YOU ARE A D&D 5E DUNGEON MASTER. THIS IS NOT CREATIVE WRITING. THIS IS A GAME WITH RULES.

RESPONSE LENGTH LIMIT: Your response MUST be under 150 words. If you reach 140 words, END YOUR SENTENCE IMMEDIATELY and stop. Do NOT continue.

[Rest of existing content...]
```

**Rationale:** Some models respond better to imperative commands at the start. The explicit word count reminder helps.

### Action 3.2: Add Stop Sequences

**File:** `/home/st5ubu/GamemasterAI-Test2/server/ai-provider.js`

**In the `generateAIResponse` function, add stop sequences:**

```javascript
const requestBody = {
    model: model,
    messages: messages,
    max_tokens: max_tokens,
    temperature: temperature,
    stop: ["\n\nPlayer:", "What would you like to do?", "\n\n---", "What do you do?"]  // ✅ ADD THIS
};
```

**Rationale:** Stop sequences force the AI to end responses when it reaches natural DM stopping points.

---

## PRIORITY 4: Fix Context Window Issues (MEDIUM)

### Action 4.1: Increase Context Length

**File:** `/home/st5ubu/GamemasterAI-Test2/client/gamemasterai/src/components/ChatRoom.vue`

```javascript
// BEFORE:
ContextLength: 3, // The number of most recent messages to consider

// AFTER:
ContextLength: 8, // Increased for better context retention
```

**Rationale:** 6 messages (3×2) is too short for D&D. 16 messages (8×2) provides better context while staying within token limits.

### Action 4.2: Always Include System Message

**File:** `/home/st5ubu/GamemasterAI-Test2/client/gamemasterai/src/components/ChatRoom.vue`

**Find the `submitMessage` method, locate this section:**

```javascript
// Prepare an array of last ContextLength number of messages
const lastMessages = this.conversation.slice(-this.ContextLength * 2);
```

**Replace with:**

```javascript
// Always include system message + recent messages
const systemMessage = this.conversation.find(msg => msg.role === 'system');
const recentMessages = this.conversation.slice(-this.ContextLength * 2);
const lastMessages = systemMessage 
    ? [systemMessage, ...recentMessages.filter(msg => msg.role !== 'system')]
    : recentMessages;
```

**Rationale:** Ensures the D&D rules system prompt is ALWAYS sent to the AI, not just at the start.

---

## PRIORITY 5: Fix Dice Rolling System (MEDIUM)

### Action 5.1: Add Dice Rolling to System Prompt

**File:** `/home/st5ubu/GamemasterAI-Test2/client/gamemasterai/src/prompts/DungeonsAndDragons.txt`

**Strengthen the dice rolling section (around line 15-25):**

```
**DICE ROLLING SYSTEM:**
When a skill check, saving throw, or attack is needed:
1. YOU MUST ROLL THE DICE YOURSELF. Pick a random number from 1-20 for d20 rolls.
2. Apply the character's relevant modifier (provided in character stats).
3. State the formula: "Rolling [Skill] (DC [number])... d20 roll [X] + [modifier] = [total]"
4. Compare to DC and narrate ONLY the result that occurred.
5. NEVER show "if you roll X..." or multiple outcomes. ONE result only.

CORRECT EXAMPLE:
"Rolling Dexterity (DC 12)... d20 roll: 15 + 3 (DEX) = 18. Success! You dodge the arrow."

WRONG EXAMPLE (DO NOT DO):
"Roll for DEX. If you get 10-15, you dodge. If you get 16+, you catch it."
```

---

## PRIORITY 6: Test Configuration Changes (CRITICAL)

### Action 6.1: Test Checklist

After making the above changes, test in this order:

**Test 1: Model Loading**
1. Open LM Studio → verify correct model loaded
2. Check LM Studio logs show model name correctly
3. Verify `.env` file has exact matching name

**Test 2: Basic Response**
1. Start new game with simple character
2. Send message: "I look around the room"
3. Check response length (should be ~100-150 words max)
4. Check response tone (should be standard D&D, not surreal)

**Test 3: Dice Rolling**
1. Send message: "I try to pick the lock"
2. AI should roll dice itself and show: "Rolling Sleight of Hand (DC 15)... d20: [X] + [modifier] = [total]"
3. AI should narrate ONE outcome only

**Test 4: Rule Following**
1. Send 2-3 more messages
2. Check each response stops after one event
3. Check AI waits for player input
4. Check no hypothetical "if you do X..." text

**Test 5: Summary Generation**
1. Play through 8+ exchanges (to trigger summary)
2. Check summary is coherent narrative, not item lists
3. Check summary maintains past context

---

## PRIORITY 7: Additional Quality Improvements (OPTIONAL)

### Action 7.1: Add Model-Specific Prompt Tweaks

Different models respond better to different prompt styles:

**For Llama 3.1 models - Add to system prompt:**
```
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
[Existing prompt]
<|eot_id|>
```

**For Mistral models - Add emphasis:**
```
[INST] You are a strict D&D 5e Dungeon Master. Follow the rules EXACTLY. [/INST]
[Existing prompt]
```

### Action 7.2: Add Response Validation

**File:** `/home/st5ubu/GamemasterAI-Test2/server/ai-provider.js`

After receiving AI response, add validation:

```javascript
// After: const aiMessage = response.data.choices[0].message.content.trim();

// Validate response length
const wordCount = aiMessage.split(/\s+/).length;
if (wordCount > 200) {
    console.warn(`AI response too long: ${wordCount} words, truncating...`);
    // Truncate to ~150 words at sentence boundary
    const sentences = aiMessage.match(/[^.!?]+[.!?]+/g) || [];
    let truncated = '';
    let count = 0;
    for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).length;
        if (count + sentenceWords > 150) break;
        truncated += sentence;
        count += sentenceWords;
    }
    return truncated || aiMessage.substring(0, 800); // Fallback
}

return aiMessage;
```

---

## Implementation Order

**Phase 1: CRITICAL (Do First)**
1. Load proper model in LM Studio
2. Update `.env` with actual model names
3. Fix token limits and temperature in `ai-provider.js`
4. Restart server and test

**Phase 2: HIGH PRIORITY (Do Same Session)**
5. Add stop sequences to `ai-provider.js`
6. Increase ContextLength in `ChatRoom.vue`
7. Fix system message always included
8. Test dice rolling behavior

**Phase 3: REFINEMENT (Do After Testing)**
9. Strengthen system prompt if needed
10. Add response validation if needed
11. Model-specific prompt adjustments

---

## Expected Outcomes After Fixes

**Before Fixes:**
- 250+ word rambling responses
- Surreal, off-topic narrative
- No dice rolling mechanics
- Ignores all instructions
- Unusable for D&D

**After Fixes:**
- 100-150 word focused responses
- Standard D&D tone and structure
- Proper dice rolling with modifiers
- Follows system prompt rules
- Actually playable D&D sessions

---

## Validation Criteria

The system is working correctly when:

✅ Responses are consistently under 150 words  
✅ DM stops after describing one event and waits for player  
✅ Dice rolls show: "d20: [number] + [modifier] = [total] vs DC [X]"  
✅ Only one outcome narrated (no "if you roll..." alternatives)  
✅ Tone is standard D&D fantasy, not surreal comedy  
✅ Player has clear agency and choices  
✅ Summary generates coherent narrative prose  
✅ Context maintains across multiple exchanges  

---

## Troubleshooting

**If AI still ignoring instructions after fixes:**
- Try Llama 3.1 70B (smaller models may not be capable)
- Reduce temperature further (try 0.5)
- Use model-specific prompt formatting
- Consider adding few-shot examples to system prompt

**If responses still too long:**
- Reduce max_tokens to 150
- Add more stop sequences
- Implement response truncation validation

**If dice rolling still broken:**
- Add explicit examples to system prompt
- Consider client-side dice rolling instead
- Parse player intent and roll dice server-side

**If model loading fails:**
- Check LM Studio server is running on port 1234
- Verify model name EXACTLY matches LM Studio display
- Check LM Studio logs for model load errors
- Ensure sufficient VRAM/RAM for model size

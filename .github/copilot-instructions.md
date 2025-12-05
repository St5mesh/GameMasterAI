# GameMaster.AI - AI Coding Agent Instructions

## Project Overview
GameMaster.AI is a web-based TTRPG (tabletop role-playing game) platform featuring an AI Dungeon Master powered by OpenAI's GPT models. It combines AI-driven game narration with automatic notetaking to create immersive single-player D&D experiences.

## Architecture

### Three-Tier Structure
- **Root**: Entry point (`server.js`) that delegates to `server/server.js`
- **Server** (`/server`): Express.js backend (port 5001) handling OpenAI API calls, MongoDB persistence, game state management
- **Client** (`/client/gamemasterai`): Vue 3 SPA (port 8080) with Vuex store, Vue Router

### Key Data Flow
1. User submits message → `ChatRoom.vue` → `/api/game-session/generate` endpoint
2. Backend assembles conversation context (last `ContextLength * 2` messages) → OpenAI API
3. Response returned → appended to conversation → saved to MongoDB via `/api/game-state/save`
4. Every `ContextLength` messages, trigger summary generation via `/api/game-session/generate-summary`
5. Summary is injected back as system reminder to maintain narrative continuity

## Critical Patterns

### Conversation Management (ChatRoom.vue)
- Maintains TWO parallel arrays: `conversation` (full context including system messages) and `summaryConversation` (for notetaker)
- Uses sliding window pattern: only last `ContextLength * 2` messages sent to AI to manage token costs
- Token counting: `Math.ceil(message.length / 4)` approximation tracks usage in `totalTokenCount`
- Auto-save after every user/assistant message pair via `saveGameState()`

### AI System Messages
Game setup generates dynamic system prompts combining:
- Game system prompt (e.g., `prompts/DungeonsAndDragons.txt`)
- Adventure setting prompt (e.g., `prompts/ClassicFantasy.txt`)
- Character details from `SetupForm.vue`
- Campaign concept generated via `/generate-campaign` endpoint (GPT-3.5-turbo)

System reminders re-injected every `ContextLength` messages to prevent AI drift:
```javascript
reminderMessage = {
  role: 'system',
  content: '(this is a reminder of your role... ' + systemMessageContentDM + summary + ')'
}
```

### State Persistence
- **Vuex store** (`store.js`): Manages `gameId`, `gameSetup`, `systemMessageContentDM`, `summary`
- **MongoDB** (`GameState` model): Persists full game state including both conversation arrays, token counts
- **localStorage**: Stores user auth data (though auth appears partially deprecated)
- Game identification: `gameId` is timestamp-based (`Date.now().toString()`)

### Model Selection Strategy
- **Main DM**: GPT-4 (300 tokens, temp 0.8) - expensive but quality narration
- **Campaign Generator**: GPT-3.5-turbo (400 tokens) - one-time setup
- **Notetaker**: GPT-3.5-turbo (150 tokens) - frequent summarization

## Development Workflows

### Starting Development
```bash
npm start  # Runs both server and client concurrently
# OR separately:
npm run server  # Backend on port 5001
npm run client  # Frontend on port 8080
```

### Environment Setup
Required `.env` in root:
```
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=random_string
JWT_SECRET=random_string
```

### Project Structure Quirks
- Root `package.json` contains both server/client dependencies (legacy monorepo setup)
- Actual server dependencies in `server/package.json`, client in `client/gamemasterai/package.json`
- Client uses proxy to `http://localhost:5001` for API calls (configured in axios `baseURL`)

## Important Implementation Details

### API Endpoint Patterns
All game logic routes are in `server/routes/gameSession.js`:
- POST `/api/game-session/generate` - Main DM responses
- POST `/api/game-session/generate-campaign` - Setup campaign concept
- POST `/api/game-session/generate-summary` - Notetaker summaries

Game state CRUD in `server/routes/gameState.js`:
- POST `/api/game-state/save` - Upsert by `gameId`
- GET `/api/game-state/load/:gameId` - Load specific game
- GET `/api/game-state/all` - List all saved games

### Error Handling Pattern
Components display error messages with retry functionality:
```javascript
try {
  // API call
  this.errorMessage = null;
} catch (error) {
  this.errorMessage = "Failed to... Please try again.";
}
// Template includes tryAgain() method to resubmit
```

### Prompt Loading Convention
Prompts stored as `.txt` files in `client/gamemasterai/src/prompts/`, imported via `require()`:
```javascript
summaryPrompt: require('@/prompts/summaryPrompt.txt')
```

### Vue 3 Composition
- Uses Options API (not Composition API)
- Vuex integration via `mapGetters`, `this.$store.commit/state`
- Router guards check `gameSetup` in store before allowing chat access

## Common Gotchas

1. **Duplicate Route Names**: Router has two `ChatRoom` entries (with/without `:id` param) - both use same name, can cause routing issues
2. **Hardcoded Localhost URLs**: Several components use `http://localhost:5001` directly instead of axios instance from `api.js`
3. **Auth System Incomplete**: Passport config exists but user authentication largely removed/commented out
4. **Root server.js**: Just a redirect to `./GMAI/server/server.js` - actual server logic is in `server/` subdirectory
5. **Token Estimation**: Uses rough `length/4` approximation, not official tokenizer - can drift from actual OpenAI token counts

## Key Files Reference
- **Game logic**: `client/gamemasterai/src/components/ChatRoom.vue` (~300 lines, contains all core gameplay)
- **Setup flow**: `client/gamemasterai/src/components/SetupForm.vue`
- **State management**: `client/gamemasterai/src/store.js` (Vuex store)
- **API routes**: `server/routes/gameSession.js`, `server/routes/gameState.js`
- **Models**: `server/models/GameState.js` (main storage), `server/models/gamesession.js` (legacy, minimal use)

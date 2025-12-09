// GMAI/client/gamemasterai/src/components/SetupForm.vue


<template>
    <form @submit.prevent="submitForm">
        <h1 class="form-title">The Start of Your Adventure</h1> <!-- Title text added here -->
        <h4 class="form-description">Select the building blocks of your character and story. Allow up to 30 seconds after clicking "start game". If you wish to make your own custom prompt entirely, type it in the bottom box and start game!</h4>
        <div>
            <label for="game-system">Game System:</label>
            <select id="game-system" v-model="formData.gameSystem">
                <option disabled value="">Please select one</option>
                <option>Dungeons and Dragons 5th Edition</option>
            </select>
        </div>
        <div>
            <label for="adventure-Setting">Adventure Setting:</label>
            <select id="adventure-Setting" v-model="formData.adventureSetting">
                <option disabled value="">Please select one</option>
                <option>Classic Fantasy</option>
                <option>Steampunk</option>
            </select>
        </div>
        <div>
            <label for="character-name">Character Name:</label>
            <input id="character-name" v-model="formData.characterName" type="text">
        </div>
        <div>
            <label for="Character Class">Character Class:</label>
            <input id="character-class" v-model="formData.characterClass" type="text">
        </div>
        <div>
            <label for="Character Race">Character Race:</label>
            <input id="character-race" v-model="formData.characterRace" type="text">
        </div>
        <div>
            <label for="Character Level">Character Level:</label>
            <input id="character-level" v-model="formData.characterLevel" type="text">
        </div>
        <div>
            <label for="Character Background">Character Background:</label>
            <input id="character-background" v-model="formData.characterBackground" type="text">
        </div>
        <div>
            <label for="ability-scores">Ability Scores (STR DEX CON INT WIS CHA):</label>
            <input id="ability-scores" v-model="formData.abilityScores" type="text" placeholder="e.g., 10 14 12 8 16 10">
        </div>
        <div>
            <label for="or">OR:</label>
        </div>
        <div>
            <label for="custom-dm-content">Custom Prompt:</label>
            <textarea id="custom-dm-content" v-model="formData.customDMContent" placeholder="Type your own custom prompt here." rows="4"></textarea>
        </div>        <button type="submit">Start Game</button>
    </form>
    
</template>

<script>
    import api from '@/api';


    export default {
        data() {
            return {
                gameSystemPrompts: {
                    "Dungeons and Dragons 5th Edition": require('@/prompts/DungeonsAndDragons.txt'),
                },

                adventureSettingPrompts: {
                    "Classic Fantasy": require('@/prompts/ClassicFantasy.txt'),
                    "Steampunk": require ('@/prompts/Steampunk.txt'),
                },

                formData: {
                    gameSystem: 'Dungeons and Dragons 5th Edition',
                    adventureSetting: 'Classic Fantasy',
                    characterName: 'Snickerdoodle',
                    characterClass: 'Rogue',
                    characterRace: 'Halfling',
                    characterLevel: '3',
                    characterBackground: 'Former Baker\'s Apprentice / Amateur Acrobat / Aspiring Hero / Walking Liability. Snickerdoodle "Snick" Underbough is a chaotic-good Halfling Rogue who means incredibly well but is also a magnet for accidental chaos. Snick proudly calls himself a "Stealth Wizard" even though he cannot cast a single spell — he just thinks "stealth" counts as magic. He often shouts "BEHOLD! I vanish!" before attempting to hide, instantly ruining the attempt.',
                    abilityScores: '8 17 14 10 12 15'
                }
            };
        },
        methods: {

        async generateCampaignConcept() {
        // Generate the campaign concept using the OpenAI API.
        if (!this.formData.adventureSetting || !this.adventureSettingPrompts[this.formData.adventureSetting]) {
            console.error('Adventure setting not selected');
            return 'You arrive in a mysterious land where adventure awaits at every turn.';
        }
        
        const prompt = "Write a brief, 2 sentence adventure prompt for a new D&D adventure. Use the following to inform this:" + this.adventureSettingPrompts[this.formData.adventureSetting] + 'Player Character name: ' + this.formData.characterName + ', Player Charactre Class: ' + this.formData.characterClass + ', Player Character Race: ' + this.formData.characterRace + ', Player Character Starting Level:' + this.formData.characterLevel + '. Player Character Background: ' + this.formData.characterBackground;

        try {
            const response = await api.post('/game-session/generate-campaign', {
                messages: [{ role: "user", content: prompt }],
            });

            return response.data;
        } catch (error) {
            console.error('Error generating campaign concept:', error);
        }
    },

    async submitForm() {
            this.$store.commit('createNewGame');
            this.$store.commit('setGameSetup', this.formData);

            let systemMessageContentDM;

            // Check if the custom DM content is provided
            if (this.formData.customDMContent && this.formData.customDMContent.trim() !== "") {
                // Use the custom DM content
                systemMessageContentDM = this.formData.customDMContent.trim();
            } else {
                // Generate the campaign concept as before
                const campaignConcept = await this.generateCampaignConcept();
                
                // Parse ability scores to calculate modifiers
                let characterStats = '';
                if (this.formData.abilityScores && this.formData.abilityScores.trim()) {
                    const scores = this.formData.abilityScores.trim().split(/\s+/);
                    if (scores.length === 6) {
                        const [str, dex, con, int, wis, cha] = scores.map(Number);
                        const calcMod = (score) => Math.floor((score - 10) / 2);
                        characterStats = `\n\nCHARACTER STATS (for internal use - apply modifiers to all rolls):\nSTR ${str} (${calcMod(str) >= 0 ? '+' : ''}${calcMod(str)}), DEX ${dex} (${calcMod(dex) >= 0 ? '+' : ''}${calcMod(dex)}), CON ${con} (${calcMod(con) >= 0 ? '+' : ''}${calcMod(con)}), INT ${int} (${calcMod(int) >= 0 ? '+' : ''}${calcMod(int)}), WIS ${wis} (${calcMod(wis) >= 0 ? '+' : ''}${calcMod(wis)}), CHA ${cha} (${calcMod(cha) >= 0 ? '+' : ''}${calcMod(cha)})`;
                    }
                }
                
                systemMessageContentDM = this.gameSystemPrompts[this.formData.gameSystem] + campaignConcept + characterStats + '\n\nAssume the player knows nothing. Allow for an organic introduction of information.';
            }

            // Set the system message content DM
            this.$store.commit('setSystemMessageContentDM', systemMessageContentDM);
            console.log('SetupForm: Set systemMessageContentDM in store:', systemMessageContentDM.substring(0, 100) + '...');

            const gameId = this.$store.state.gameId;
            console.log('SetupForm: Navigating to ChatRoom with gameId:', gameId);
            this.$router.push({ name: 'ChatRoom', params: { id: gameId } });
        }
    }
    };</script>


<style scoped>
</style>

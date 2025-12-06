// GMAI/client/gamemasterai/src/components/ChatRoom.vue

<template>
    <h1 class="chat-room-title">GameMaster.AI - Chat</h1>
    <h4 class="chat-room-subtitle">You can now chat with an AI Game Master. Have fun!</h4>
    <div v-if="errorMessage" class="error-message">
        <p>Error: {{ errorMessage }}</p>
        <button @click="tryAgain">Try again</button>
    </div>
    <div class="chat-room">
        <div class="chat-messages">
            <div v-for="(message, index) in messages" :key="index" class="chat-message">
                <strong>{{ message.user }}:</strong> {{ message.text }}
            </div>
        </div>
        <form @submit.prevent="submitMessage">
            <input type="text" v-model="newMessage" placeholder="Type your message here..." />
            <button type="submit">Send</button>
        </form>
        <h1 class="notetaker-title">Notetaker.AI</h1>
        <h4 class="notetaker-subtitle">A summary of your adventure will update here automatically!</h4>
        <h4 class="notetaker-subtitle-editing">You may edit this summary to adjust what GameMaster.AI takes into consideration over time. These edits will take effect the next time the summary updates.</h4>

        <NotePanel :summary="summary" @update-summary="updateSummaryInChatRoom" />
    </div>
</template>

<script>import api from '@/api';
    import NotePanel from './NotePanel.vue';
    import summaryPrompt from '@/prompts/summaryPrompt.txt';

    export default {
        components: {
            NotePanel
        },
        data() {
            return {
                summaryPrompt,
                // Initial state for the component
                newMessage: "", // Holds the current message being typed
                messages: [], // Array to hold all the chat messages
                conversation: [], // Array to hold all conversation data
                summaryConversation: [], // Array to hold all summary conversation data
                summary: "", // Holds the summary of the game session
                systemMessageContentDM: "", //Holds the prompt for the AI DM
                ContextLength: 3, // The number of most recent messages to consider for generating a response
                userAndAssistantMessageCount: 0, // initialize the counter here
                totalTokenCount: 0,
                errorMessage: null // add error message data property


            };
        },
        async created() {
            console.log('ChatRoom created, gameId:', this.$route.params.id);

            // check if a gameId is provided in the route
            if (this.$route.params.id) {
                // Try to load existing game state
                const loaded = await this.loadGameState(this.$route.params.id);
                
                // If after loading, conversation is still empty, this is a new game
                if (!loaded || this.conversation.length === 0) {
                    console.log('New game detected, initializing...');
                    this.initializeNewGame();
                }
            }
        },
        
        async mounted() {
            // Double-check in mounted if we need to initialize
            if (this.conversation.length === 0 && this.$store.state.systemMessageContentDM) {
                this.initializeNewGame();
            }
        },

        methods: {
            
            initializeNewGame() {
                console.log('Initializing new game...');
                console.log('Store systemMessageContentDM:', this.$store.state.systemMessageContentDM);
                this.systemMessageContentDM = this.$store.state.systemMessageContentDM;
                if (this.systemMessageContentDM) {
                    const systemMessageDM = {
                        role: 'system',
                        content: this.systemMessageContentDM,
                    };
                    this.conversation.push(systemMessageDM);
                    console.log('System message added, requesting opening scene...');
                    
                    // Request opening scene asynchronously
                    this.requestOpeningScene();
                } else {
                    console.error('No system message content found in store!');
                }
            },
            
            async requestOpeningScene() {
                try {
                    console.log('Requesting opening scene...');
                    // Send initial prompt to get the opening scene
                    const openingPrompt = {
                        role: 'user',
                        content: 'Begin the adventure by setting the scene. Describe where I am and what is happening. Keep it brief and engaging.'
                    };
                    
                    this.conversation.push(openingPrompt);
                    
                    const response = await api.post('/game-session/generate', {
                        messages: this.conversation
                    });
                    
                    const aiMessageContent = response.data;
                    console.log('Opening scene received:', aiMessageContent);
                    
                    const aiMessage = {
                        role: 'assistant',
                        content: aiMessageContent,
                    };
                    
                    this.conversation.push(aiMessage);
                    this.summaryConversation.push(aiMessage);
                    this.messages.push({ user: "GameMaster.AI", text: aiMessageContent });
                    
                    this.incrementTokenCount(aiMessageContent);
                    this.userAndAssistantMessageCount++; // Count the opening exchange
                    await this.saveGameState();
                    
                } catch (error) {
                    console.error('Error requesting opening scene:', error);
                    this.errorMessage = "Failed to generate opening scene. Please refresh the page.";
                }
            },

            incrementTokenCount(message) {
                const tokenCountForMessage = Math.ceil(message.length / 4);
                this.totalTokenCount += tokenCountForMessage;
                console.log("Total tokens processed by AI: ", this.totalTokenCount);

            },
            async updateSummary() {
                try {
                    this.errorMessage = null; // Clear the error message

                    // Prepare an array of last ContextLength number of messages  
                    const lastSummaryMessages = this.summaryConversation.slice(-(this.ContextLength * 2));

                    // Increment token count based on the messages read by the AI 
                    lastSummaryMessages.forEach(message => {
                        this.incrementTokenCount(message.content);
                    });

                    // System prompt should come FIRST, then the conversation to summarize
                    const summaryRequest = {
                        role: 'system',
                        content: this.summaryPrompt,
                    };

                    const messagesToSend = [summaryRequest, ...lastSummaryMessages];

                    const response = await api.post('/game-session/generate-summary', {
                        messages: messagesToSend,
                    });

                    this.summary += "\n" + response.data;
                    this.incrementTokenCount(response.data); // Increment token count

                    // Remove the used messages from summaryConversation
                    this.summaryConversation = this.summaryConversation.slice(0, -(this.ContextLength));
                } catch (error) {
                    console.error('Error generating summary:', error);
                    this.errorMessage = "Failed to generate summary. Please try again."; // Set the error message

                }
            },

        updateSummaryInChatRoom(updatedSummary) {
        this.summary = updatedSummary;
        // Call the setSummary mutation to update the summary in the Vuex store
        this.$store.commit('setSummary', updatedSummary);
        this.saveGameState();
    },

            async submitMessage() {
                //const gameSetup = this.$store.state.gameSetup;

                if (this.newMessage.trim() !== "") {
                    this.messages.push({ user: "Player", text: this.newMessage.trim() });
    /*
                    const userMessageWithHidden = {
                        role: 'user',
                        content: this.appendHiddenMessage(this.newMessage.trim()),
                    };
                    this.conversation.push(userMessageWithHidden);
    */
                    const userMessage = {
                        role: 'user',
                        content: this.newMessage.trim(),
                    };
                    this.conversation.push(userMessage);
                    this.summaryConversation.push(userMessage);

                    try {
                        this.errorMessage = null; // Clear the error message

                        // Prepare an array of last ContextLength number of messages
                        const lastMessages = this.conversation.slice(-this.ContextLength * 2);

                        // Increment token count based on the messages read by the AI 
                        lastMessages.forEach(message => {
                            this.incrementTokenCount(message.content);
                        });

                        const response = await api.post('/game-session/generate', {
                            messages: lastMessages
                        });
                        const aiMessageContent = response.data;



                        this.incrementTokenCount(aiMessageContent); // Increment token count

                        const aiMessage = {
                            role: 'assistant',
                            content: aiMessageContent,
                        };
                        this.conversation.push(aiMessage);
                        this.summaryConversation.push(aiMessage);
                        this.messages.push({ user: "GameMaster.AI", text: aiMessageContent });

                        // Increment the counter only if the message is from the user or the assistant
                        if (userMessage.role === 'user' || aiMessage.role === 'assistant') {
                            this.userAndAssistantMessageCount++;
                            console.log('User and assistant message count:');
                            console.log(this.userAndAssistantMessageCount);
                            // Call saveGameState after each message
                            this.saveGameState();
                        }

                        if (this.userAndAssistantMessageCount % this.ContextLength === 0) {
                            await this.updateSummary();

                            const reminderMessage = {
                                role: 'system',
                                content: '(this is a reminder of your role, do not respond directly: ' + this.systemMessageContentDM + '. ' + 'This is also a summary of what has transpired in this game so far. Ensure continuity and consistency using this summary:' + this.summary + ')',
                            };
                            this.conversation.push(reminderMessage);
                        }
                    } catch (error) {
                        console.error('Error generating AI message:', error);
                        this.errorMessage = "Failed to send message. Please try again."; // Set the error message
                    }

                    this.newMessage = "";
                }
            },
            tryAgain() {
                this.errorMessage = null;
                this.submitMessage(); // Retry sending the message
            },

    /*
    appendHiddenMessage(message) {
                // Add the hidden message to the end of the user input
                const hiddenMessage = "Keep response under 75 words."; // Replace with your hidden message
                return message + hiddenMessage;
            }, */

            async saveGameState() {
                // Game state to save
                const gameState = {
                    gameId: this.$store.state.gameId,
                    userId: this.$store.state.userId,
                    gameSetup: this.$store.state.gameSetup,
                    conversation: this.conversation,
                    summaryConversation: this.summaryConversation,
                    summary: this.summary,
                    totalTokenCount: this.totalTokenCount,
                    userAndAssistantMessageCount: this.userAndAssistantMessageCount,
                    systemMessageContentDM: this.systemMessageContentDM
                };

                try {
                    // Save game state to backend
                    await api.post('/game-state/save', gameState);
                    console.log('Game saved');
                    console.log(gameState);

                } catch (error) {
                    console.error('Error saving game state:', error);
                }
            },
            async loadGameState(gameId) {
                try {
                    console.log('Loading game state for:', gameId);
                    const response = await api.get(`/game-state/load/${gameId}`);
                    const gameState = response.data;

                    // Restore the game state
                    this.$store.commit('setGameId', gameState.gameId);
                    this.$store.commit('setGameSetup', gameState.gameSetup);
                    this.$store.commit('setUserId', gameState.userId);
                    this.conversation = gameState.conversation;
                    this.summaryConversation = gameState.summaryConversation;
                    this.summary = gameState.summary;
                    this.totalTokenCount = gameState.totalTokenCount;
                    this.userAndAssistantMessageCount = gameState.userAndAssistantMessageCount;
                    this.systemMessageContentDM = gameState.systemMessageContentDM;

                    // Map the conversation array to match the structure needed by this.messages
                    // And only include the messages that are not of role 'system'
                    this.messages = this.conversation
                        .filter(({ role }) => role !== 'system')  // Filter out the 'system' role messages
                        .map(({ role, content }) => ({
                            user: role === 'assistant' ? 'GameMaster.AI' : role.charAt(0).toUpperCase() + role.slice(1),
                            text: content,
                        }));
                    
                    console.log('Game state loaded successfully, conversation length:', this.conversation.length);
                    return true; // Successfully loaded

                } catch (error) {
                    // This is expected for new games - no saved state exists yet
                    return false; // No saved game exists
                }
            }

        }
    };</script>

<style scoped>
    .chat-room {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    }

    .chat-messages {
        height: 400px;
        overflow-y: auto;
        border: 1px solid #ccc;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .chat-message {
        margin-bottom: 0.5rem;
    }

    input {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        box-sizing: border-box;
    }

    .error-message {
        color: red;
        margin: 1rem 0;
    }
</style>

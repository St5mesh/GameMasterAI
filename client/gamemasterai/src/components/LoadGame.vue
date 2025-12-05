<template>
    <div>
        <h2>Load Game</h2>
        <p v-if="loading">Loading...</p>
        <p v-else-if="error">{{ error }}</p>
        <div v-else>
            <ul>
                <li v-for="game in games" :key="game.gameId">
                    <router-link :to="`/chat-room/${game.gameId}`">{{ game.gameId }}</router-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import api from '@/api';

export default {
    data() {
        return {
            games: [],
            loading: false,
            error: null,
        };
    },
    async created() {
        this.loading = true;
        try {
            const response = await api.get('/game-state/all');  // Using api instance
            this.games = response.data;
        } catch (error) {
            this.error = 'An error occurred while loading the games.';
        } finally {
            this.loading = false;
        }
    },
};
</script>

import { PublicGame } from "@darrenkuro/pong-core";
import { authStore } from "../../modules/auth/auth.store";
import { createChart } from "../components/Chart";

const mapGame = (game: PublicGame) => {
    const { username } = authStore.get();
    const { player1Username, player2Username } = game;
    if (username !== player1Username && username !== player2Username) return;
    const index = username === player1Username ? 0 : 1;

    return {
        hits: index === 0 ? game.player1Hits : game.player2Hits,
        misses: index === 0 ? game.player2Score : game.player1Score,
    };
};

export const createGameStatsChart = (games: PublicGame[]) => {
    const data = games.map((game, index) => {
        return { gameId: index + 1, ...mapGame(game) };
    });

    const chartResult = createChart(
        "line",
        data,
        {
            responsive: true,
            events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
            plugins: {
                title: {
                    display: true,
                    text: "Pong Game Performance",
                },
                tooltip: {
                    enabled: true,
                    mode: "nearest",
                    intersect: false,
                },
            },
            interaction: {
                mode: "nearest",
                intersect: false,
            },
        },
        "gameId",
        ["hits", "misses"]
    );

    return chartResult.isOk() ? [chartResult.value] : [];
};

import { Chart, registerables } from "chart.js";
import { PublicGame } from "@darrenkuro/pong-core";
import { authStore } from "../../modules/auth/auth.store";
import { createEl } from "../../utils/dom-helper";

Chart.register(...registerables);

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

export const createGameStatsChart = (games: PublicGame[]): UIComponent => {
    const data = games.map((game, index) => {
        const mapped = mapGame(game);
        if (!mapped) return null;
        return { gameId: index + 1, ...mapped };
    });

    const chartEl = createEl("canvas", "w-full h-[400px]", {
        attributes: { id: "game-stats-chart" },
    });

    setTimeout(() => {
        const ctx = document.getElementById("game-stats-chart") as HTMLCanvasElement | null;
        if (!ctx) return;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: data.map((d) => d?.gameId),
                datasets: [
                    {
                        label: "Hits",
                        data: data.map((d) => d?.hits),
                        borderColor: "rgb(75, 192, 192)",
                        tension: 0.1,
                    },
                    {
                        label: "Misses",
                        data: data.map((d) => d?.misses),
                        borderColor: "rgb(255, 99, 132)",
                        tension: 0.1,
                    },
                ],
            },
            options: {
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
            },
        });
    }, 0);

    return [chartEl];
};

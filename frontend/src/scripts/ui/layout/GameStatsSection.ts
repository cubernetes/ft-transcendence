import { Chart, registerables } from "chart.js";
import { PublicGame } from "@darrenkuro/pong-core";
import { authStore } from "../../modules/auth/auth.store";
import { localeStore } from "../../modules/locale/locale.store";
import { createEl } from "../../utils/dom-helper";
import { createButtonGroup } from "../components/ButtonGroup";
import { createParagraph } from "../components/Paragraph";
import { createTable } from "../components/Table";

Chart.register(...registerables);

export const createStatsToggleSection = (games: PublicGame[]): HTMLElement[] => {
    const { STATS_CHART, MATCH_HISTORY, FRIENDS } = CONST.TEXT;
    const chartSection = createGameStatsChart(games);
    const historySection = createMatchHistoryList(games);
    const friendSection = createFriendList();

    const toggleContainer = createEl(
        "div",
        `flex justify-center ${CONST.FONT.BODY_SM} gap-4 mb-4 mt-4`
    );
    const contentContainer = createEl("div", "w-full transition-all");

    const toggleGroup = createButtonGroup({
        texts: [STATS_CHART, MATCH_HISTORY, FRIENDS],
        cbs: [
            () => showElement(chartSection),
            () => showElement(historySection),
            () => showElement(friendSection),
        ],
        twBtnSpecific: ["rounded-l-md", "rounded-r-md"],
        twSelected: "bg-purple-600 text-white",
        twBtn: "px-4 py-2 border border-gray-400 rounded transition m-1",
        twCtn: "justify-center mb-4",
        defaultSelected: 0,
    });

    const showElement = (element: UIComponent) => {
        contentContainer.replaceChildren(...element);
    };

    toggleContainer.append(toggleGroup);
    showElement(chartSection); // Default

    return [toggleContainer, contentContainer];
};

const createFriendList = (): HTMLElement[] => {
    const { RANK, STATUS, FRIENDS, GAMES_PLAYED, FRIENDS_ERROR } = CONST.TEXT;
    const playerName = authStore.get().username;

    if (playerName) {
        return [
            createParagraph({
                text: FRIENDS_ERROR,
                tw: "text-gray-500 text-center",
            }),
        ];
    }
    const headers = [FRIENDS, GAMES_PLAYED, RANK, STATUS];
    const row = [
        {
            friendUsername: playerName,
            gamesPlayed: 0,
            rank: "N/A",
            status: "Online",
        },
    ];
    const table = createTable(headers, ["friendUsername", "gamesPlayed", "rank", "status"], row);
    const tableWrapper = createEl(
        "div",
        `max-h-64 overflow-y-auto overflow-x-auto flex justify-center ${CONST.STYLES.CONTAINER}`
    );
    tableWrapper.appendChild(table);
    return [tableWrapper];
};

const createMatchHistoryList = (games: PublicGame[]): HTMLElement[] => {
    const { DATE, OPPONENT, RESULT, SCORE, GAME_DATA_ERROR } = CONST.TEXT;
    const playerName = authStore.get().username;

    if (!games.length) {
        return [
            createParagraph({
                text: GAME_DATA_ERROR,
                tw: "text-gray-500 text-center",
            }),
        ];
    }

    const reversedGames = [...games].reverse();

    const headers = [DATE, OPPONENT, RESULT, SCORE];
    const rows = reversedGames.map((game) => {
        const isPlayer1 = game.player1Username === playerName;
        const opponent = isPlayer1 ? game.player2Username : game.player1Username;
        const playerScore = isPlayer1 ? game.player1Score : game.player2Score;
        const opponentScore = isPlayer1 ? game.player2Score : game.player1Score;
        const result = game.winnerIndex == 0 && isPlayer1 ? "Won" : "Lost";

        return {
            date: new Date(game.finishedAt).toLocaleString(localeStore.get().locale, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour12: true,
            }),
            opponent,
            result,
            score: `${playerScore} - ${opponentScore}`,
        };
    });

    const table = createTable(headers, ["date", "opponent", "result", "score"], rows);
    const tableWrapper = createEl(
        "div",
        `max-h-64 overflow-y-auto overflow-x-auto flex justify-start ${CONST.STYLES.CONTAINER}`
    );
    tableWrapper.appendChild(table);
    return [tableWrapper];
};

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
    const { GAME_DATA_ERROR } = CONST.TEXT;
    if (!games.length) {
        return [
            createParagraph({
                text: GAME_DATA_ERROR,
                tw: "text-gray-500 text-center",
            }),
        ];
    }
    const data = [...games].reverse().map((game, index) => {
        const mapped = mapGame(game);
        if (!mapped) return null;
        return { gameId: index + 1, ...mapped };
    });
    const chartEl = createEl("canvas", "w-full max-h-[700px]", {
        attributes: { id: "game-stats-chart" },
    });

    setTimeout(() => {
        const ctx = document.getElementById("game-stats-chart") as HTMLCanvasElement | null;
        if (!ctx) return;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: data.map((d) => `Game ${d?.gameId}`),
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

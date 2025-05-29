import { MatchState, Round, tournamentStore } from "../../modules/tournament/tournament.store";
import { determineRound } from "../../modules/tournament/tournament.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createParagraph } from "../components/Paragraph";

export const buildTournamentTree = (matches: MatchState[][]): HTMLElement => {
    const { NO_TOURNAMENT, START } = CONST.TEXT;
    const bracketContainer = createEl(
        "div",
        "relative w-full h-full flex items-center justify-center overflow-x-auto"
    );

    if (!matches || matches.length === 0) {
        const emptyMessage = createEl("p", "text-center text-gray-500", {
            text: NO_TOURNAMENT,
        });
        bracketContainer.appendChild(emptyMessage);
        return bracketContainer;
    }

    const treeWrapper = createEl("div", "flex flex-row gap-4 relative");

    matches.forEach((roundMatches) => {
        const roundColumn = createEl("div", "flex flex-col items-center gap-2");
        const roundResult = determineRound(roundMatches);
        const roundTitle = createParagraph({
            text: roundResult.isOk() ? roundResult.value : "Unknown Round",
            tw: "font-semibold mb-1",
        });
        roundColumn.appendChild(roundTitle);

        roundMatches.forEach((match) => {
            // Compact match container
            const matchContainer = createEl(
                "div",
                `match-container p-2 text-center w-32 ${CONST.STYLES.CONTAINER}`
            );

            // Highlight winner directly within players
            const player1 = match.players[1] || "TBD";
            const player0 = match.players[0] || "TBD";

            // Determine winner for styling
            const isWinner1 = match.winner === player1;
            const isWinner0 = match.winner === player0;

            const players = createEl(
                "p",
                `${CONST.FONT.BODY_XXS} player-name text-gray-200 flex flex-col items-center`
            );

            const player1El = createEl("span", `${isWinner1 ? "text-green-600 font-bold" : ""}`, {
                text: isWinner1 ? `👑 ${player1}` : player1,
            });
            const player0El = createEl("span", `${isWinner0 ? "text-green-600 font-bold" : ""}`, {
                text: isWinner0 ? `👑 ${player0}` : player0,
            });

            players.appendChild(player1El);
            players.appendChild(createEl("span", "text-gray-300", { text: "vs" }));
            players.appendChild(player0El);

            const playButton = createButton({
                text: START,
                tw: `${CONST.FONT.BODY_XXS} bg-gray-100 px-2 py-1 mt-1 hover:bg-gray-400`,
                click: () => {
                    const { controller } = tournamentStore.get();
                    controller?.startMatch(match.gameId);
                },
            });

            // Only add play button if the match has not been completed
            appendChildren(matchContainer, [players, playButton]);
            roundColumn.appendChild(matchContainer);
        });

        treeWrapper.appendChild(roundColumn);
    });

    bracketContainer.appendChild(treeWrapper);

    return bracketContainer;
};

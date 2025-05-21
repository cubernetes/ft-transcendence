import { MatchState, Round, tournamentStore } from "../../modules/tournament/tournament.store";
import { determineRound } from "../../modules/tournament/tournament.utils";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";

export const buildTournamentTree = (matches: MatchState[][]): HTMLElement => {
    //TODO: Correctly implement translations for all elements.
    const { NO_TOURNAMENT, START } = CONST.TEXT;
    const bracketContainer = createEl("div", "relative w-full overflow-x-auto");

    if (!matches || matches.length === 0) {
        const emptyMessage = createEl("p", "text-center text-gray-500", {
            text: NO_TOURNAMENT,
        });
        bracketContainer.appendChild(emptyMessage);
        return bracketContainer;
    }

    const treeWrapper = createEl("div", "flex flex-row gap-16 px-10 py-6 relative");

    matches.forEach((roundMatches) => {
        const roundColumn = createEl("div", "flex flex-col items-center gap-12");
        const roundResult = determineRound(roundMatches);
        const roundTitle = createEl("h3", "text-xl font-semibold", {
            text: roundResult.isOk() ? roundResult.value : "Unknown Round",
        });
        roundColumn.appendChild(roundTitle);

        roundMatches.forEach((match) => {
            const matchContainer = createEl(
                "div",
                "match-container border p-4 rounded-lg shadow-md bg-white text-center w-40"
            );

            const player1 = createEl("p", "player-name text-sm font-semibold", {
                text: match.players[0] || "TBD",
            });

            const player2 = createEl("p", "player-name text-sm font-semibold", {
                text: match.players[1] || "TBD",
            });

            const playButton = createButton({
                text: START,
                tw: "text-xs bg-gray-100 px-2 py-1 mt-2 hover:bg-gray-400",
                click: () => {
                    const { controller } = tournamentStore.get();
                    if (controller) {
                        log.debug("Starting match...");
                        controller.startMatch(match.gameId);
                    } else {
                        log.debug("Controller not found in tournament store");
                    }
                },
            });

            const pending = createEl("p", "pending text-yellow-500 font-medium text-xs mt-1", {
                text: match.winner ? "Completed" : "Pending",
            });

            const winner = createEl("p", "winner text-green-500 font-bold text-xs mt-1", {
                text: match.winner ? `Winner: ${match.winner}` : "Winner: TBD",
            });

            appendChildren(matchContainer, [player1, player2, playButton, pending, winner]);
            roundColumn.appendChild(matchContainer);
        });

        treeWrapper.appendChild(roundColumn);
    });

    bracketContainer.appendChild(treeWrapper);

    return bracketContainer;
};

import { Round, tournamentStore } from "../../modules/tournament/tournament.store";
import { MatchState } from "../../modules/tournament/tournament.store";
import { appendChildren, createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";

const roundLabels: Record<number, Round> = {
    0: "Quarter",
    1: "Semi",
    2: "Final",
};

// export const createTournamentTree = (playerAmount: number): HTMLElement => {
//     const bracketContainer = createEl("div", "relative w-full overflow-x-auto");

//     if (![4, 8].includes(playerAmount)) {
//         const emptyMessage = createEl("p", "text-center text-gray-500", {
//             text: "Not enough players.",
//         });
//         bracketContainer.appendChild(emptyMessage);
//         return bracketContainer;
//     }

//     const treeWrapper = createEl("div", "flex flex-row gap-16 px-10 py-6 relative");

//     let roundSize = playerAmount;
//     let roundIndex = 0;

//     if (playerAmount === 4) {
//         roundIndex = 1;
//     }

//     while (roundSize > 1) {
//         const roundColumn = createEl("div", "flex flex-col items-center gap-12");

//         // Use roundLabels to fetch the round name dynamically
//         const roundTitle = createEl("h3", "text-xl font-semibold", {
//             text: roundLabels[roundIndex] || "Round " + (roundIndex + 1),
//         });
//         roundColumn.appendChild(roundTitle);

//         for (let i = 0; i < roundSize / 2; i++) {
//             const matchContainer = createEl(
//                 "div",
//                 "match-container border p-4 rounded-lg shadow-md bg-white text-center w-40"
//             );

//             const player1 = createEl("p", "player-name text-sm font-semibold", {
//                 text: "TBD",
//             });
//             const player2 = createEl("p", "player-name text-sm font-semibold", {
//                 text: "TBD",
//             });

//             const playButton = createButton("Start", "text-xs px-2 py-1 mt-2", () => {
//                 console.log("Play button clicked");
//                 const { controller } = tournamentStore.get();
//                 if (controller) {
//                     window.log.debug("Starting match...");
//                     controller.startMatch();
//                 }
//                 else {
//                     window.log.debug("Controller not found in tournament store");
//                 }
//             });
//             const pending = createEl("p", "pending text-yellow-500 font-medium text-xs mt-1", {
//                 text: "Pending",
//             });

//             const winner = createEl("p", "winner text-green-500 font-bold text-xs mt-1", {
//                 text: "Winner: TBD",
//             });

//             appendChildren(matchContainer, [player1, player2, playButton, pending, winner]);
//             roundColumn.appendChild(matchContainer);
//         }

//         treeWrapper.appendChild(roundColumn);
//         roundSize /= 2;
//         roundIndex++;
//     }

//     bracketContainer.appendChild(treeWrapper);

//     return bracketContainer;
// };

// export const updateTournamentTree = (tree: HTMLElement): void => {
//     const { matches } = tournamentStore.get();
//     if (!tree || !matches || matches.length === 0) throw new Error("Tournament tree or matches data is missing");

//     // Select all match containers in the tree
//     const matchContainers = tree.querySelectorAll(".match-container");
//     // window.log.debug(`Found ${matchContainers.length} match containers`);

//     if (matchContainers.length === 0) {
//         window.log.error("No match containers found in the tree");
//         return;
//     }

//     let matchIndex = 0;

//     // Loop over each round's matches
//     // window.log.debug(`Matches to update:`, matches);
//     matches.forEach((roundMatches, roundIdx) => {
//         // window.log.debug(`Updating round ${roundIdx} with matches:`, roundMatches);
//         roundMatches.forEach((match) => {
//             const matchEl = matchContainers[matchIndex];
//             if (!matchEl) {
//                 window.log.error(`No match element found for index ${matchIndex}`);
//                 return;
//             }
//             matchIndex++;

//             const playerEls = matchEl.querySelectorAll(".player-name");
//             // window.log.debug(
//             //     `Found ${playerEls.length} player elements in match ${matchIndex - 1}`
//             // );

//             if (playerEls.length < 2) {
//                 window.log.error("Not enough player elements found in match container");
//                 return;
//             }

//             const pendingEl = matchEl.querySelector(".pending");
//             const winnerEl = matchEl.querySelector(".winner");

//             // window.log.debug(`Match ${matchIndex - 1} players:`, match.players);
//             // window.log.debug(`Current player1 element text: "${playerEls[0].textContent}"`);
//             // window.log.debug(`Current player2 element text: "${playerEls[1].textContent}"`);

//             if (!match || match.players.length < 2) {
//                 window.log.error("Match data is invalid", match);
//                 return;
//             }

//             // Update player names - force with innerHTML to ensure update
//             playerEls[0].innerHTML = match.players[0] || "TBD";
//             playerEls[1].innerHTML = match.players[1] || "TBD";

//             // window.log.debug(`Updated player1 to: "${match.players[0]}"`);
//             // window.log.debug(`Updated player2 to: "${match.players[1]}"`);
//             if (pendingEl) {
//                 pendingEl.innerHTML = match.winner ? "Completed" : "Pending";
//             }
//             if (winnerEl) {
//                 winnerEl.innerHTML = match.winner ? `Winner: ${match.winner}` : "Winner: TBD";
//             }
//             // window.log.debug(`Updated pending status to: "${pendingEl?.innerHTML}"`);
//             // window.log.debug(`Updated winner status to: "${winnerEl?.innerHTML}"`);
//         });
//     });

//     // window.log.debug("Tournament tree update completed");
// };

export const buildTournamentTree = (matches: MatchState[][]): HTMLElement => {
    const bracketContainer = createEl("div", "relative w-full overflow-x-auto");

    if (!matches || matches.length === 0) {
        const emptyMessage = createEl("p", "text-center text-gray-500", {
            text: "Tournament not started or no matches yet.",
        });
        bracketContainer.appendChild(emptyMessage);
        return bracketContainer;
    }

    const treeWrapper = createEl("div", "flex flex-row gap-16 px-10 py-6 relative");

    matches.forEach((roundMatches, roundIdx) => {
        const roundColumn = createEl("div", "flex flex-col items-center gap-12");

        const roundTitle = createEl("h3", "text-xl font-semibold", {
            text: roundLabels[roundIdx] || `Round ${roundIdx + 1}`,
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

            const playButton = createButton("Start", "text-xs px-2 py-1 mt-2", () => {
                const { controller } = tournamentStore.get();
                if (controller) {
                    window.log.debug("Starting match...");
                    controller.startMatch();
                } else {
                    window.log.debug("Controller not found in tournament store");
                }
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

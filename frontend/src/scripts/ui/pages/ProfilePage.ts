import { showPageElements } from "../../modules/layout/layout.service";
import { createEl } from "../../utils/dom-helper";
import { Result, err, ok } from "neverthrow";

const fetchStats = async (n: number): Promise<Result<Record<string, unknown>[], Error>> => {
    try {
        const response = await fetch(`${window.cfg.url.user}/stats`);
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        // Process data into how it's typed on the leaderboard page
        const processedData = data.data
            .map((p: Record<string, any>) => ({
                id: p.id,
                name: p.username,
                wins: p.wins,
                losses: p.losses,
            }))
            .sort((a: Record<string, any>, b: Record<string, any>) => b.wins - a.wins)
            .map((p: Record<string, any>, i: number) => ({
                ...p,
                rank: i + 1,
            }));

        return ok(processedData);
    } catch (error) {
        window.log.debug("Fetch error:", error);

        return err(new Error("Fail to fetch leaderboard"));
    }
};

const createProfileSection = async (): Promise<HTMLElement> => {

    const profileSection = createEl("section", "bg-white p-6 rounded-lg shadow-md");
    const profileTitle = createEl("h2", "text-2xl font-bold mb-4", { text: "Your Profile" });
    const profileInfo = createEl("div", "space-y-4");
    const username = createEl("p", "font-semibold", { text: "Username: Player 1" });
    const stats = createEl("p", "font-semibold", { text: "Games Played: 0" });

    profileInfo.appendChild(username);
    profileInfo.appendChild(stats);
    profileSection.appendChild(profileTitle);
    profileSection.appendChild(profileInfo);

    return profileSection;
}


/*TODO: a page with stats. Graphs that visualize those stats.
Things like:
- Amount of games played.
- Amount of wins && amount of losses.
- Amount of times your paddles hit the ball. As a graph over time.
- Amount of times you missed the ball. As a graph over time.
- Ranking on Leaderboard.


Structure:
- createGraph function in Graph.ts in components.
*/
export const createProfilePage = async (): Promise<HTMLElement> => {
    showPageElements();
    const profileSection = await createProfileSection();
    const main = createEl("main", "container mx-auto p-4", { children: [profileSection] });


    main.appendChild(profileSection);

    return main;
};

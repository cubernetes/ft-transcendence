import { Err, Result, err, ok } from "neverthrow";
import { showPageElements } from "../../modules/layout/layout.service";
import { createEl } from "../../utils/dom-helper";
import { createChart } from "../components/Chart";

const fetchPlayerData = async (
    playerId: number
): Promise<Result<Record<string, unknown>, Error>> => {
    try {
        const response = await fetch(`${window.cfg.url.user}/me`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token") || "Unauthorized",
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }

        const data = await response.json();

        const processedData = {
            id: data.data.id,
            name: data.data.username,
            games: data.data.wins + data.data.losses,
            wins: data.data.wins,
            losses: data.data.losses,
            rank: data.data.rank,
        };

        return ok(processedData);
    } catch (error) {
        window.log.debug("Fetch error:", error);
        return err(new Error("Fail to fetch user"));
    }
};

const createPlayerDataSection = (
    dataResult: Result<Record<string, unknown>, Error>
): HTMLElement => {
    const playerSection = createEl("section", "text-2xl font-bold mb-4", { text: "Your Profile:" });

    if (dataResult.isErr()) {
        playerSection.appendChild(
            createEl("p", "text-red-500", { text: "Failed to query user data." })
        );
        return playerSection;
    }
    const playerInfo = createEl("div", "space-y-4");
    const username = createEl("p", "font-semibold", { text: `Username: Player 1` });
    const stats = createEl("p", "font-semibold", { text: "Games Played: 0" });

    const wrapper = createEl("div", "w-full", {
        children: [playerSection, playerInfo, username, stats],
    });

    return wrapper;
};

const createProfileSection = async (): Promise<HTMLElement> => {
    const profileSection = createEl("section", "bg-white p-6 rounded-lg shadow-md");

    const playerData = await fetchPlayerData(1);

    const playerSection = createPlayerDataSection(playerData);

    profileSection.appendChild(playerSection);

    return profileSection;
};

export const createProfilePage = async (): Promise<HTMLElement[]> => {
    showPageElements();
    const profileSection = await createProfileSection();
    const main = createEl("main", "container mx-auto p-4", { children: [profileSection] });

    main.appendChild(profileSection);

    return [main];
};

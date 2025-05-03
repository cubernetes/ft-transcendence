import { Result, err, ok } from "neverthrow";
import { GetMePayload, GetMeResponse } from "@darrenkuro/pong-core";
import { showPageElements } from "../../modules/layout/layout.service";
import { sendApiRequest } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createProfileSetting, createStatsDataSection } from "../layout/PlayerStatsModal";

const fetchPlayerData = async (): Promise<Result<GetMePayload, Error>> => {
    const tryFetch = await sendApiRequest.get<GetMeResponse>(`${CONST.API.USER}/me`);

    if (tryFetch.isErr()) {
        return err(tryFetch.error);
    }

    // Will never reach this becuase result will return Error when success is off
    // However it is difficult to come up with good type guard or ways to please ts
    // TODO: FIX
    if (!tryFetch.value.success) {
        return err(new Error("never"));
    }

    return ok(tryFetch.value.data);
};

const fetchGameStats = async (): Promise<Result<Record<string, unknown>[], Error>> => {
    const gameStats = [
        { gameId: 1, hits: 23, misses: 4 },
        { gameId: 2, hits: 18, misses: 7 },
        { gameId: 3, hits: 27, misses: 5 },
        { gameId: 4, hits: 30, misses: 3 },
        { gameId: 5, hits: 25, misses: 6 },
        { gameId: 6, hits: 29, misses: 2 },
        { gameId: 7, hits: 22, misses: 8 },
        { gameId: 8, hits: 26, misses: 4 },
        { gameId: 9, hits: 31, misses: 3 },
        { gameId: 10, hits: 24, misses: 5 },
    ];

    return ok(gameStats);
};

const createProfileSection = async (): Promise<HTMLElement> => {
    const profileSection = createEl("section", "bg-white p-6 rounded-lg shadow-md");

    const playerData = await fetchPlayerData();
    // const gameStats = await fetchGameStats();

    const playerSection = createProfileSetting(playerData);
    //const statsSection = createStatsDataSection(gameStats);

    profileSection.appendChild(playerSection);
    //profileSection.appendChild(statsSection);

    return profileSection;
};

export const createProfilePage = async (): Promise<HTMLElement[]> => {
    showPageElements();
    const profileSection = await createProfileSection();
    const main = createEl("main", "container mx-auto p-4", { children: [profileSection] });

    main.appendChild(profileSection);

    return [main];
};

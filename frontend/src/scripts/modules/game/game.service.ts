import type { ErrorCode } from "@darrenkuro/pong-core";
import { Result, err, ok } from "neverthrow";
import { sendApiRequest } from "../../utils/api";

type LobbyId = string;

// TODO: Get type
export const tryCreateLobby = async (): Promise<Result<LobbyId, ErrorCode>> => {
    const result = await sendApiRequest.post(`${CONST.API.LOBBY}/create`);

    if (result.isErr() || !result.value.success) return err("BAD_REQUEST"); // TODO change type later

    const { lobbyId } = result.value.data;
    return ok(lobbyId);
};

export const tryJoinLobby = async (payload: unknown): Promise<Result<unknown, ErrorCode>> => {
    return ok();
};

// TODO: move sendGameAction and sendGameStart here?

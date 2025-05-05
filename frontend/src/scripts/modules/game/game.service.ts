import type { ErrorCode } from "@darrenkuro/pong-core";
import { Result, err, ok } from "neverthrow";
import { sendApiRequest } from "../../utils/api";

type LobbyId = string;

// TODO: Get type
export const createLobby = async (): Promise<Result<LobbyId, ErrorCode>> => {
    const result = await sendApiRequest.post(`${CONST.API.LOBBY}/create`);

    if (result.isErr()) return err(result.error);
    if (!result.value.success) return err("UNKNOWN_ERROR"); //  Should never happen, TODO: fix type in post call

    const { lobbyId } = result.value.data;
    return ok(lobbyId);
};

export const joinLobby = async (payload: unknown): Promise<Result<unknown, ErrorCode>> => {
    return ok();
};

// export const handleLobbyUpdate = (payload)
// TODO: move sendGameAction and sendGameStart here?

import type { DbClient } from "./modules/db/db.plugin";
import type { createWsService } from "./modules/ws/ws.service";
import type { createAuthService } from "./modules/auth/auth.service";
import type { createUserService } from "./modules/user/user.service";
import type { createGameService } from "./modules/game/game.service";
import type { createTournamentService } from "./modules/tournament/tournament.service";
// import type { createFriendService } from "./modules/friend/friend.service";
// import type authRoutes from "./modules/auth/auth.routes";
import type userRoutes from "./modules/user/user.routes";
import type gameRoutes from "./modules/game/game.routes";
import type tournamentRoutes from "./modules/tournament/tournament.routes";
// import friendRoutes from "./modules/friend/friend.routes";

import type { FastifyServerOptions } from "fastify";

declare module "fastify" {
    interface FastifyInstance {
        db: DbClient;
        wsService: ReturnType<typeof createWsService>;
        authService: ReturnType<typeof createAuthService>;
        userService: ReturnType<typeof createUserService>;
        gameService: ReturnType<typeof createGameService>;
        tournamentService: ReturnType<typeof createTournamentService>;
        //friendService: ReturnType<typeof createFriendService>;
        //authRoutes: ReturnType<typeof authRoutes>;
        userRoutes: ReturnType<typeof userRoutes>;
        gameRoutes: ReturnType<typeof gameRoutes>;
        tournamentRoutes: ReturnType<typeof tournamentRoutes>;
        //friendRoutes: ReturnType<typeof friendRoutes>;
    }
}

export type Config = {
    isDev: boolean;
    port: number;
    jwtSecret: string | null;
    opts: FastifyServerOptions;
};

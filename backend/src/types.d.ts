import type { DbClient } from "./db/db.plugin.ts";
import type { Config } from "./utils/config.ts";
import type { createWsService } from "./ws/ws.service.ts";
import type { createAuthService } from "./auth/auth.service.ts";
import type { createUserService } from "./user/user.service.ts";
import type { createGameService } from "./game/game.service.ts";
import type { createTournamentService } from "./tournament/tournament.service.ts";
// import type { createFriendService } from "./friend/friend.service";
// import type authRoutes from "./auth/auth.routes";
import type userRoutes from "./user/user.routes.ts";
import type gameRoutes from "./game/game.routes.ts";
import type tournamentRoutes from "./tournament/tournament.routes.ts";
// import friendRoutes from "./friend/friend.routes";

/** Global plugin types decorations for fastify */
declare module "fastify" {
    interface FastifyInstance {
        db: DbClient;
        config: Config;
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

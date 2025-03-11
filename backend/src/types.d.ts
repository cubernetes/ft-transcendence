import type { DbClient } from "./db/db.plugin";
import type { createWsService } from "./ws/ws.service";
import type { createAuthService } from "./auth/auth.service";
import type { createUserService } from "./user/user.service";
import type { createGameService } from "./game/game.service";
import type { createTournamentService } from "./tournament/tournament.service";
// import type { createFriendService } from "./friend/friend.service";
// import type authRoutes from "./auth/auth.routes";
import type userRoutes from "./user/user.routes";
import type gameRoutes from "./game/game.routes";
import type tournamentRoutes from "./tournament/tournament.routes";
// import friendRoutes from "./friend/friend.routes";

/** Global plugin types decorations for fastify */
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

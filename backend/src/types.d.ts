import type { DbClient } from "./core/db/db.plugin.ts";
import type { AppConfig } from "./core/config/config.plugin.ts";
import type { createWsService } from "./core/ws/ws.service.ts";
import type { createAuthService } from "./core/auth/auth.service.ts";
import type { createUserService } from "./modules/user/user.service.ts";
import type { createGameService } from "./modules/game/game.service.ts";
import type { createTournamentService } from "./modules/tournament/tournament.service.ts";
import type { createPongService } from "./core/pong/pong.service.ts";
import type { WebSocket as WsWebSocket } from "ws";
// import type { createFriendService } from "./friend/friend.service";
// import type authRoutes from "./auth/auth.routes";
import type userRoutes from "./modules/user/user.routes.ts";
import type gameRoutes from "./modules/game/game.routes.ts";
import type tournamentRoutes from "./modules/tournament/tournament.routes.ts";
// import friendRoutes from "./friend/friend.routes";

/** Global plugin types decorations for fastify */
declare module "fastify" {
    interface FastifyInstance {
        db: DbClient;
        config: AppConfig;
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
        requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }

    interface FastifyRequest {
        userId: number;
    }

    interface WebSocket extends WsWebSocket {
        userId?: number;
    }
}

import type { createAuthService } from "./core/auth/auth.service.ts";
import type { AppConfig } from "./core/config/config.types.ts";
import type { DbClient } from "./core/db/db.plugin.ts";
import type { createPongService } from "./core/pong/pong.service.ts";
import type { createWsService } from "./core/ws/ws.service.ts";
import type { createGameService } from "./modules/game/game.service.ts";
// import friendRoutes from "./friend/friend.routes";
// import type { createFriendService } from "./friend/friend.service";
import type userRoutes from "./modules/user/user.routes.ts";
import type { createUserService } from "./modules/user/user.service.ts";
import type { WebSocket as WsWebSocket } from "ws";

// Global plugin types decorations for fastify
declare module "fastify" {
    interface FastifyInstance {
        db: DbClient;
        config: AppConfig;
        wsService: ReturnType<typeof createWsService>;
        authService: ReturnType<typeof createAuthService>;
        userService: ReturnType<typeof createUserService>;
        gameService: ReturnType<typeof createGameService>;
        //friendService: ReturnType<typeof createFriendService>;
        userRoutes: ReturnType<typeof userRoutes>;
        //friendRoutes: ReturnType<typeof friendRoutes>;
        requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }

    interface FastifyRequest {
        userId: number;
        username: string;
        userDisplayName: string;
    }

    interface WebSocket extends WsWebSocket {
        userId?: number;
        username?: string;
        userDisplayName?: string;
    }
}

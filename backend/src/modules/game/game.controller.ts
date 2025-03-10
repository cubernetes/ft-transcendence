// import type { FastifyReply, FastifyRequest } from "fastify";
// import GameService from "../services/game.service";
// import { CustomError } from "../../utils/errors";
// import { validateId } from "../../utils/zod-validate";

// export default class GameController {
//     constructor(private gameService: GameService) {}

//     async getAllGames(_request: FastifyRequest, reply: FastifyReply) {
//         try {
//             const games = await this.gameService.findAll();
//             return reply.send(games);
//         } catch (error) {
//             return error instanceof CustomError
//                 ? error.send(reply)
//                 : new CustomError(`Failed to fetch all games`).send(reply);
//         }
//     }

//     async getGameById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
//         try {
//             const id = validateId(request.params.id);
//             const game = await this.gameService.findById(id);
//             return reply.send(game);
//         } catch (error) {
//             return error instanceof CustomError
//                 ? error.send(reply)
//                 : new CustomError(`Failed to fetch game by ID`).send(reply);
//         }
//     }
// }

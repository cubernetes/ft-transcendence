// import type { FastifyReply, FastifyRequest } from "fastify";
// import FriendService from "../services/friend.service";
// import { CustomError } from "../../utils/errors";
// import { validateId } from "../../utils/zod-validate";

// export default class FriendController {
//     constructor(private friendService: FriendService) {}

//     async getFriendsById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
//         try {
//             const id = validateId(request.params.id);
//             const friends = await this.friendService.findAllFriendshipsById(id);
//             return reply.send(friends);
//         } catch (error) {
//             return error instanceof CustomError
//                 ? error.send(reply)
//                 : new CustomError(`Failed to fetch game by ID`).send(reply);
//         }
//     }
//     async postFriendRequest() {}
//     async acceptFriendRequest() {}
// }

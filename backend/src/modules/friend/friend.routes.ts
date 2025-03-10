// import { FastifyInstance } from "fastify";
// import type { ServiceInstance } from "../../services";
// import FriendController from "./friend.controller";

// const friendRoutes = async (fastify: FastifyInstance, options: { service: ServiceInstance }) => {
//     const controller = new FriendController(options.service.friend);

//     // TODO: Business logic for friends should be reconsidered?
//     // Involves auth middleware probably?
//     // But will refactor for now
//     fastify.get(`/:id`, controller.getFriendsById.bind(controller));
//     fastify.post(`/`, controller.postFriendRequest.bind(controller));
//     fastify.put(`/accept`, controller.acceptFriendRequest.bind(controller));
// };

// export default friendRoutes;

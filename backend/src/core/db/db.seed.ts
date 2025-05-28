import type { FastifyInstance } from "fastify";
import { Result, err, ok } from "neverthrow";
import { faker } from "@faker-js/faker";
import { OutgoingMessagePayloads as Payloads, createPongEngine } from "@darrenkuro/pong-core";
import { GameSession } from "../../modules/lobby/lobby.types";

const seedUsers = async (n: number, app: FastifyInstance) => {
    const fakeUsers = Array.from({ length: n }, () => ({
        username: faker.internet.username(),
        displayName: faker.person.firstName(),
        passwordHash: faker.internet.password(),
    }));

    app.log.info(`seeding ${n} faker users...`);

    const seedOneUser = async (newUser: (typeof fakeUsers)[number]) => {
        const user = await app.userService.create(newUser);

        if (user.isErr()) {
            return app.log.error({ err: user.error }, "failed to create user");
        }
    };

    await Promise.all(fakeUsers.map(seedOneUser));
};

const mockGameSession = async (app: FastifyInstance): Promise<Result<GameSession, string>> => {
    const userCount = await app.userService.getCount();
    if (userCount.isErr()) return err("fail to mock game session: user count error");

    let players: number[];
    let unique = false;
    do {
        const player1Id = faker.number.int({ min: 1, max: userCount.value });
        const player2Id = faker.number.int({ min: 1, max: userCount.value });
        if (player1Id !== player2Id) unique = true;

        players = [player1Id, player2Id];
    } while (!unique);

    const username1 = await app.userService.getUsernameById(players[0]);
    const username2 = await app.userService.getUsernameById(players[1]);

    if (username1.isErr() || username2.isErr())
        return err("fail to mock game session: username error");

    return ok({
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        engine: createPongEngine(),
        players,
        playerNames: [username1.value, username2.value],
        playerReady: [false, false],
    });
};

const mockGameEndPayload = (session: GameSession): Payloads["game-end"] => {
    const state = session.engine.getState();
    const player1Hits = faker.number.int({ min: 0, max: 10 });
    const player2Hits = faker.number.int({ min: 0, max: 10 });
    const winner = faker.number.int({ min: 0, max: 1 }) as 0 | 1;
    const player1Score = winner === 0 ? 11 : faker.number.int({ min: 0, max: 10 });
    const player2Score = winner === 1 ? 11 : faker.number.int({ min: 0, max: 10 });
    state.scores = [player1Score, player2Score];
    return {
        state,
        hits: [player1Hits, player2Hits],
        winner,
    };
};

export const mockGame = async (n: number, app: FastifyInstance): Promise<Result<void, string>> => {
    for (let i = 0; i < n; i++) {
        const session = await mockGameSession(app);
        if (session.isErr()) return err(session.error);
        const payload = mockGameEndPayload(session.value);
        //app.log.debug(session.value);
        //app.log.debug(payload);
        app.gameService.saveGame(session.value, payload);
    }
    return ok();
};

export const seed = async (app: FastifyInstance) => {
    const userCount = await app.userService.getCount();

    if (userCount.isErr()) {
        return app.log.error({ err: userCount.error }, "failed to get user count");
    }

    // Only seed users if there aren't a significant amount
    if (userCount.value <= 200) {
        await seedUsers(20, app);
        await mockGame(500, app);
    }
};

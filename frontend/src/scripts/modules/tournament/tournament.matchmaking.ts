export const generateMatchList = (players: HTMLInputElement[]) => {
    const playerPool = [...players];
    const match: string[] = [];
    const matches: string[][] = [];

    while (playerPool.length > 0) {
        const rand = Math.floor(Math.random() * playerPool.length);
        const player = playerPool.splice(rand, 1)[0];
        match.push(player.value);

        if (match.length === 2) {
            matches.push([...match]);
            match.length = 0;
        }
    }

    return matches;
};

export const CONTRACT_ABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "gameId",
                type: "uint256",
            },
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "_playerId1",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "_playerId2",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "_playerScore1",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "_playerScore2",
                        type: "uint256",
                    },
                ],
                internalType: "struct GameHistory.GameResult",
                name: "gameResult",
                type: "tuple",
            },
        ],
        name: "addGame",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tournamentId",
                type: "uint256",
            },
            {
                internalType: "uint256[]",
                name: "gameIds",
                type: "uint256[]",
            },
        ],
        name: "addTournamentHistory",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "gameRecord",
        outputs: [
            {
                internalType: "uint256",
                name: "_playerId1",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_playerId2",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_playerScore1",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_playerScore2",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tournamentId",
                type: "uint256",
            },
        ],
        name: "getAllGameIds",
        outputs: [
            {
                internalType: "uint256[]",
                name: "",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "gameId",
                type: "uint256",
            },
        ],
        name: "getGame",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "_playerId1",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "_playerId2",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "_playerScore1",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "_playerScore2",
                        type: "uint256",
                    },
                ],
                internalType: "struct GameHistory.GameResult",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "tournamentGameIds",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;

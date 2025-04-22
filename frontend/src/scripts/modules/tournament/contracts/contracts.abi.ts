export const CONTRACT_ABI = [
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
                        internalType: "string",
                        name: "_playerName1",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "_playerName2",
                        type: "string",
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
                components: [
                    {
                        internalType: "string",
                        name: "_playerName1",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "_playerName2",
                        type: "string",
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
                internalType: "struct GameHistory.GameResult[]",
                name: "tournamentResult",
                type: "tuple[]",
            },
        ],
        name: "addTournamentHistory",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
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
                internalType: "string",
                name: "_playerName1",
                type: "string",
            },
            {
                internalType: "string",
                name: "_playerName2",
                type: "string",
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
                components: [
                    {
                        internalType: "string",
                        name: "_playerName1",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "_playerName2",
                        type: "string",
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
                internalType: "struct GameHistory.GameResult[]",
                name: "",
                type: "tuple[]",
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
                        internalType: "string",
                        name: "_playerName1",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "_playerName2",
                        type: "string",
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
        name: "tournamentHistory",
        outputs: [
            {
                internalType: "string",
                name: "_playerName1",
                type: "string",
            },
            {
                internalType: "string",
                name: "_playerName2",
                type: "string",
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
];

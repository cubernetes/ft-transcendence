// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract GameHistory {
    struct GameResult {
        string _playerName1;
        string _playerName2;
        uint256 _playerScore1;
        uint256 _playerScore2;
    }

    mapping(uint256 => GameResult) public gameRecord;
    mapping(uint256 => GameResult[]) public tournamentHistory;

    //The constructor is redundant in our flow. This means everyone is able to call any function is this contract.
    //Solidity defaults to default constructor.
    constructor(){
    }

    function addGame(uint256 gameId, GameResult memory gameResult) public {
        gameRecord[gameId] = gameResult;
    }

    function addTournamentHistory(uint256 tournamentId, GameResult[] memory tournamentResult) public {
        for (uint i = 0; i < tournamentResult.length; i++) {
            tournamentHistory[tournamentId].push(tournamentResult[i]);
        }
    }

    function getGame(uint256 gameId) public view returns(GameResult memory) {
        return gameRecord[gameId];
    }

    function getAllGameIds(uint256 tournamentId) public view returns (GameResult[] memory) {
        return tournamentHistory[tournamentId];
    }
}
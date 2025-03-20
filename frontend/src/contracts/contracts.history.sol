// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract GameHistory {
    struct GameResult {
        //Could be more than 2 players
        uint256 _playerId1;
        uint256 _playerId2;
        uint256 _playerScore1;
        uint256 _playerScore2;
    }

    mapping(uint256 => GameResult) public gameRecord;
    mapping(uint256 => uint256[]) public tournamentGameIds;

    //The constructor is redundant in our flow. This means everyone is able to call any function is this contract.
    //Solidity defaults to default constructor.
    constructor(){
    }

    function addGame(uint256 gameId, GameResult memory gameResult) public {
        gameRecord[gameId] = gameResult;
    }

    function addTournamentHistory(uint256 tournamentId, uint256[] memory gameIds) public {
        for (uint i = 0; i < gameIds.length; i++) {
            tournamentGameIds[tournamentId].push(gameIds[i]);
            }
    }

    function getGame(uint256 gameId) public view returns(GameResult memory) {
        return gameRecord[gameId];
    }

    function getAllGameIds(uint256 tournamentId) public view returns (uint256[] memory) {
        return tournamentGameIds[tournamentId];
    }
}
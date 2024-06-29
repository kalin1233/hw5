/*
File: index.js
GUI Assignment: Creating an Interactive Dynamic Table
Kalin Toussaint, UMass Lowell Computer Science, Kalin_Toussaint@student.uml.edu
Copyright (c) 2024 by Kalin. All rights reserved. May be freely copied or
excerpted for educational purposes with credit to the author.
updated by KT on June 29, 2024
*/

$(document).ready(function() {
    // Array to keep track of tiles currently in play on the board
    const tilesInPlay = [];
    // Variable to keep track of the player's score
    let score = 0;

    // Function to initialize the game
    function initializeGame() {
        createBoard();
        dealTiles();
        initializeDragAndDrop();
        bindEventListeners();
    }

    // Function to create the Scrabble board
    function createBoard() {
        const $board = $('#board');
        boardSpaces.forEach((space, index) => {
            const $space = $('<div>').addClass('board-space').attr('id', `space-${index}`);
            if (space) {
                // Apply background image based on the bonus type (e.g., TW, DL)
                $space.css('background-image', `url(images/board/${space}.png)`);
            }
            $board.append($space);
        });
    }

    // Function to deal a set of tiles to the player's rack
    function dealTiles() {
        const $rack = $('#rack');
        $rack.empty();
        for (let i = 0; i < 7; i++) {
            const tile = getRandomTile();
            if (tile) {
                const $tile = createTileElement(tile);
                $rack.append($tile);
            }
        }
        initializeDragAndDrop();
    }

    // Function to get a random tile from the available tiles
    function getRandomTile() {
        const availableTiles = Object.entries(scrabbleData).filter(([_, data]) => data.count > 0);
        if (availableTiles.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * availableTiles.length);
        const [letter, data] = availableTiles[randomIndex];
        data.count--;
        return { letter, value: data.value };
    }

    // Function to create a tile element with the appropriate letter and value
    function createTileElement(tile) {
        const tileImageSrc = `images/tiles/${tile.letter}.png`; // Path to individual tile images
        return $('<div>')
            .addClass('tile')
            .attr('data-letter', tile.letter)
            .attr('data-value', tile.value)
            .css('background-image', `url(${tileImageSrc})`)
            .append(
                $('<span>').addClass('letter').text(tile.letter),
                $('<span>').addClass('value').text(tile.value)
            );
    }

    // Function to initialize drag-and-drop functionality for the tiles
    function initializeDragAndDrop() {
        $(".tile").draggable({
            revert: "invalid",
            cursor: "move",
            snap: ".board-space",
            snapMode: "inner",
            zIndex: 100
        });

        $(".board-space").droppable({
            accept: ".tile",
            drop: function(event, ui) {
                const $tile = ui.draggable;
                const $space = $(this);

                // Prevent placing more than one tile per board space
                if ($space.children().length > 0) {
                    $tile.draggable('option', 'revert', true);
                    return;
                }

                // Place the tile in the center of the board space
                $tile.draggable('option', 'revert', false);
                $tile.position({ of: $space, my: 'center', at: 'center' });
                $tile.detach().css({ top: 0, left: 0 }).appendTo($space);

                // Add the tile to the list of tiles in play
                tilesInPlay.push({
                    letter: $tile.data('letter'),
                    value: $tile.data('value'),
                    spaceIndex: $space.attr('id').split('-')[1]
                });
            }
        });
    }

    // Function to bind event listeners to buttons
    function bindEventListeners() {
        $('#submit-word').on('click', submitWord);
        $('#deal-tiles').on('click', dealTiles);
    }

    // Function to submit the current word formed on the board
    function submitWord() {
        if (tilesInPlay.length === 0) {
            alert("Please place some tiles on the board first.");
            return;
        }

        // Sort tiles by their position on the board
        tilesInPlay.sort((a, b) => a.spaceIndex - b.spaceIndex);
        const word = tilesInPlay.map(tile => tile.letter).join('');
        const wordScore = calculateWordScore();

        // Update the score and display it
        score += wordScore;
        $('#score-value').text(score);

        alert(`Word: ${word}\nScore: ${wordScore}\nTotal Score: ${score}`);

        // Clear played tiles and deal new ones
        clearPlayedTiles();
        dealTiles();
    }

    // Function to calculate the score of the current word
    function calculateWordScore() {
        let wordScore = 0;
        let wordMultiplier = 1;

        tilesInPlay.forEach(tile => {
            let letterScore = tile.value;
            const spaceBonus = boardSpaces[tile.spaceIndex];

            // Apply bonus based on the board space
            if (spaceBonus === 'DL') letterScore *= 2;
            else if (spaceBonus === 'TL') letterScore *= 3;
            else if (spaceBonus === 'DW') wordMultiplier *= 2;
            else if (spaceBonus === 'TW') wordMultiplier *= 3;

            wordScore += letterScore;
        });

        return wordScore * wordMultiplier;
    }

    // Function to clear the tiles that have been played on the board
    function clearPlayedTiles() {
        tilesInPlay.forEach(tile => {
            $(`#space-${tile.spaceIndex}`).empty();
        });
        tilesInPlay.length = 0;
    }
    
    initializeGame();
});

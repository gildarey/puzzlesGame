/**
 * IMPORTANT:
 * React component that represents a crossword puzzle board.
 * It handles the rendering of the board, the cells, and the interaction logic for the crossword game.
 * The component manages the state of the board, including the grid, timer, and user interactions such
 * as cell changes and word completion checks.
 * It also includes functions for generating the initial grid, placing and removing words, checking
 * word completion, and handling user actions like resetting the board and revealing letters or words.
 */

import React, {useState, useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import Cell from './Cell';
import {generateBoard} from '../utils/generateBoard';
import '../assets/Board.css';

const Board = ({t, settings, onWordComplete}) => {
    const {i18n} = useTranslation();
    const [grid, setGrid] = useState([]);
    const [solutionGrid, setSolutionGrid] = useState([]);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [currentHint, setCurrentHint] = useState('');
    const [initialData, setInitialData] = useState([]);
    const [rows, setRows] = useState(6);
    const [cols, setCols] = useState(10);
    const [lastChangedCell, setLastChangedCell] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch the initial data for the crossword puzzle board based on the settings.
     */
    useEffect(() => {
        const fetchBoardData = async () => {
            setIsLoading(true);
            setError(null);
            const timeout = setTimeout(() => {
                setError('Error: Board generation timed out');
                setIsLoading(false);
            }, 20000); // 20 seconds timeout

            try {
                const {
                    initialData,
                    boardDimensions
                } = await generateBoard(settings.language, settings.difficulty, settings.topic);

                if (!initialData || initialData.length === 0) {
                    throw new Error('No initial data available');
                }

                setInitialData(initialData);
                setRows(boardDimensions.rows);
                setCols(boardDimensions.cols);
                clearTimeout(timeout);
            } catch (err) {
                setError('Error generating board: ' + err.message);
                clearTimeout(timeout);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoardData();
    }, [settings]);

    useEffect(() => {
        if (initialData.length > 0 && rows > 0 && cols > 0) {
            const {updatedGrid, placedWords} = createInitialGrid(rows, cols, initialData);
            setGrid(updatedGrid);
            setSolutionGrid(placedWords);
        }
    }, [initialData, rows, cols]);

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    useEffect(() => {
        if (lastChangedCell) {
            const {row, col} = lastChangedCell;
            if (checkWordCompletion(grid, row, col)) {
                onWordComplete && onWordComplete();
                freezeWord(row, col);
            }
        }
    }, [lastChangedCell]);


    /**
     * Generates the initial grid for the crossword puzzle.
     * @param rows - The number of rows in the grid.
     * @param cols  - The number of columns in the grid.
     * @param initialData  - The initial data containing words and hints.
     * @returns {{updatedGrid: *[], placedWords: (*|Array|boolean)}}
     */
    const createInitialGrid = (rows, cols, initialData) => {
        const defaultGrid = Array.from({length: rows}, () =>
            Array.from({length: cols}, () => ({
                letter: '',
                frozen: true,
                isStartOfWord: false,
                wordHint: '',
                wordNumber: null,
                wordDirection: '',
                wordLength: 0,
                startPosition: ''
            }))
        );

        const placedWords = placeWords(defaultGrid, shuffleArray(initialData));
        const updatedGrid = placedWords.map(row =>
            row.map(cell => ({
                ...cell,
                letter: '', // Keep letters empty
            }))
        );
        return {updatedGrid, placedWords};
    };

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    /**
     * Checks if a word can be placed in the grid at the specified position and direction.
     * @param grid - The current grid state.
     * @param word - The word to place.
     * @param row  - The row position to place the word.
     * @param col - The column position to place the word.
     * @param direction - The direction to place the word ('h' for horizontal, 'v' for vertical).
     * @returns {boolean} - True if the word can be placed, false otherwise.
     */
    const canPlaceWord = (grid, word, row, col, direction) => {
        const N = grid.length;
        const M = grid[0].length;
        const wordLength = word.word.length;

        if (direction === 'h') {
            if (col + wordLength > M || (col > 0 && grid[row][col - 1].letter) || (col + wordLength < M && grid[row][col + wordLength].letter)) {
                return false;
            }
            for (let i = 0; i < wordLength; i++) {
                const cell = grid[row][col + i];
                if (cell.letter !== '' && cell.letter !== word.word[i]) {
                    return false;
                }
                if ((row > 0 && grid[row - 1][col + i].letter && cell.letter === '') || (row < N - 1 && grid[row + 1][col + i].letter && cell.letter === '')) {
                    return false;
                }
            }
        } else if (direction === 'v') {
            if (row + wordLength > N || (row > 0 && grid[row - 1][col].letter) || (row + wordLength < N && grid[row + wordLength][col].letter)) {
                return false;
            }
            for (let i = 0; i < wordLength; i++) {
                const cell = grid[row + i][col];
                if (cell.letter !== '' && cell.letter !== word.word[i]) {
                    return false;
                }
                if ((col > 0 && grid[row + i][col - 1].letter && cell.letter === '') || (col < M - 1 && grid[row + i][col + 1].letter && cell.letter === '')) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Places a word in the grid at the specified position and direction.
     * @param grid - The current grid state.
     * @param word - The word to place.
     * @param row - The row position to place the word.
     * @param col - The column position to place the word.
     * @param direction - The direction to place the word ('h' for horizontal, 'v' for vertical).
     * @returns {*} - The updated grid with the word placed.
     */
    const placeWord = (grid, word, row, col, direction) => {
        const newGrid = grid.map(row => row.slice());

        const wordNumber = initialData.indexOf(word) + 1;

        if (direction === 'h') {
            for (let i = 0; i < word.word.length; i++) {
                newGrid[row][col + i] = {
                    ...newGrid[row][col + i],
                    letter: word.word[i],
                    isStartOfWord: i === 0,
                    wordHint: i === 0 ? word.hint : '',
                    wordNumber: i === 0 ? wordNumber : null,
                    wordDirection: direction,
                    wordLength: word.word.length,
                    startPosition: {row, col},
                    frozen: false,
                };
            }
        } else if (direction === 'v') {
            for (let i = 0; i < word.word.length; i++) {
                newGrid[row + i][col] = {
                    ...newGrid[row + i][col],
                    letter: word.word[i],
                    isStartOfWord: i === 0,
                    wordHint: i === 0 ? word.hint : '',
                    wordNumber: i === 0 ? wordNumber : null,
                    wordDirection: direction,
                    wordLength: word.word.length,
                    startPosition: {row, col},
                    frozen: false,
                };
            }
        }
        return newGrid;
    };

    const removeWord = (grid, word, row, col, direction) => {
        const newGrid = grid.map(row => row.slice());
        if (direction === 'h') {
            for (let i = 0; i < word.word.length; i++) {
                newGrid[row][col + i] = {
                    ...newGrid[row][col + i],
                    letter: '',
                    isStartOfWord: false,
                    wordHint: '',
                    wordNumber: null,
                    wordDirection: '',
                    wordLength: 0,
                };
            }
        } else if (direction === 'v') {
            for (let i = 0; i < word.word.length; i++) {
                newGrid[row + i][col] = {
                    ...newGrid[row + i][col],
                    letter: '',
                    isStartOfWord: false,
                    wordHint: '',
                    wordNumber: null,
                    wordDirection: '',
                    wordLength: 0,
                };
            }
        }
        return newGrid;
    };

    /**
     * Finds all possible intersections for placing a word in the grid.
     * @param {Array} grid - The current grid state.
     * @param {Object} word - The word to place.
     * @returns {Array} - An array of possible intersections with row, column, and direction.
     */
    const findIntersections = (grid, word) => {
        const intersections = [];
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                for (const direction of ['h', 'v']) {
                    // Check if the word can be placed at the current cell in the specified direction
                    if (canPlaceWord(grid, word, row, col, direction)) {
                        // Add the cell's coordinates and direction to the intersections array
                        intersections.push({row, col, direction});
                    }
                }
            }
        }
        return intersections;
    };


    /**
     * Most important function in the crossword puzzle generation algorithm.
     * Recursively attempts to place words in the grid using backtracking.
     * @param {Array} grid - The current grid state.
     * @param {Array} words - The list of words to place.
     * @param {number} index - The current word index.
     * @param {number} wordNumber - The current word number.
     * @param {number} [maxDepth=1000] - The maximum recursion depth.
     * @param {number} [maxAttempts=10000] - The maximum number of attempts.
     * @param {Object} [attempts={count: 0}] - The current attempt count.
     * @returns {Array|boolean} - The updated grid if successful, false otherwise.
     */
    const backtrack = (grid, words, index, wordNumber, maxDepth = 1000, maxAttempts = 10000, attempts = {count: 0}) => {
        // Base case: if all words are placed, return the grid
        if (index === words.length) return grid;

        // Check for maximum recursion depth
        if (maxDepth <= 0) throw new Error('Exceeded maximum recursion depth');

        // Check for maximum number of attempts
        if (attempts.count >= maxAttempts) return false;

        // Get the current word to place
        const word = words[index];

        // Find all possible intersections for the current word
        const intersections = findIntersections(grid, word);

        // Try placing the word at each intersection
        for (const {row, col, direction} of intersections) {
            // Place the word in the grid
            const newGrid = placeWord(grid, word, row, col, direction, wordNumber);
            attempts.count++;

            // Recursively attempt to place the next word
            const result = backtrack(newGrid, words, index + 1, wordNumber + 1, maxDepth - 1, maxAttempts, attempts);
            if (result) return result;

            // If placing the word failed, remove it from the grid
            grid = removeWord(grid, word, row, col, direction);
        }

        // If no valid placement is found, return false
        return false;
    };

    const placeWords = (grid, words) => {
        try {
            const result = backtrack(grid, words, 0, 1);
            if (!result) {
                setError('No solution found for the given criteria');
                return grid;
            }
            return result;
        } catch (error) {
            setError('Error placing words: ' + error.message);
            return grid;
        }
    };

    const printBoard = (grid) => {
        console.log('Current Board:');
        grid.forEach(row => {
            console.log(row.map(cell => cell.letter || (cell.frozen ? '#' : '.')).join(' '));
        });
    };

    const handleCellChange = useCallback((row, col, value) => {
        if (grid[row][col].frozen) return;

        if (!isTimerRunning) {
            setIsTimerRunning(true);
        }

        const newGrid = grid.map((r, rowIndex) =>
            r.map((cell, colIndex) => {
                if (rowIndex === row && colIndex === col) {
                    return {
                        ...cell,
                        letter: value.toUpperCase()
                    };
                }
                return cell;
            })
        );

        setGrid(newGrid);
        setLastChangedCell({row, col});

        // Move to the next cell based on the direction
        let nextRow = row;
        let nextCol = col;
        if (grid[row][col].wordDirection === 'h') {
            nextCol = col + 1;
        } else if (grid[row][col].wordDirection === 'v') {
            nextRow = row + 1;
        }

        if (nextRow < grid.length && nextCol < grid[0].length) {
            const nextCell = document.getElementById(`cell-${nextRow}-${nextCol}`);
            if (nextCell) {
                nextCell.focus();
                nextCell.select();
            }
        }

    }, [grid, isTimerRunning]);

    const handleCellClick = (row, col) => {
        const cell = grid[row][col];
        if (!cell.frozen) {
            setSelectedCell({row, col});
            if (cell.isStartOfWord) {
                setCurrentHint(`(${cell.wordNumber})(${cell.wordDirection}) ${cell.wordHint}`);
            } else {
                setCurrentHint('');
            }
        }
    };

    const checkWordCompletion = (grid, row, col) => {
        if (!grid || !grid[row] || !grid[row][col]) {
            return false;
        }

        const cell = grid[row][col];

        if (cell.startPosition) {
            const {startPosition, wordDirection, wordLength} = cell;
            const {row: startRow, col: startCol} = startPosition;

            if (!solutionGrid || !solutionGrid[startRow] || !solutionGrid[startRow][startCol]) {
                console.error('Invalid solution grid or start position:', startRow, startCol);
                return false;
            }

            const extractWord = (grid, startRow, startCol, wordLength, wordDirection) => {
                let word = '';
                if (wordDirection === 'h') {
                    for (let c = 0; c < wordLength; c++) {
                        word += grid[startRow][startCol + c].letter.toUpperCase();
                    }
                } else if (wordDirection === 'v') {
                    for (let r = 0; r < wordLength; r++) {
                        word += grid[startRow + r][startCol].letter.toUpperCase();
                    }
                }
                return word;
            };

            let word = extractWord(grid, startRow, startCol, wordLength, wordDirection);

            let solutionWord = extractWord(solutionGrid, startRow, startCol, wordLength, wordDirection);

            return word === solutionWord;
        }
        return false;
    };

    const freezeWord = useCallback((row, col) => {
        const cell = grid[row][col];
        const {startPosition, wordDirection, wordLength} = cell;
        const {row: startRow, col: startCol} = startPosition;

        const newGrid = grid.map((r, rowIndex) =>
            r.map((cell, colIndex) => {
                if (wordDirection === 'h' && rowIndex === startRow && colIndex >= startCol && colIndex < startCol + wordLength) {
                    return {...cell, completed: true};
                } else if (wordDirection === 'v' && colIndex === startCol && rowIndex >= startRow && rowIndex < startRow + wordLength) {
                    return {...cell, completed: true};
                }
                return cell;
            })
        );

        setGrid(newGrid);
    }, [grid]);

    const resetBoard = () => {
        // Reset the grid to the initial state
        const {updatedGrid, placedWords} = createInitialGrid(rows, cols, initialData);
        setGrid(updatedGrid);
        setSolutionGrid(placedWords);
        setTimer(0);
        setIsTimerRunning(false);
    };

    const revealLetter = () => {
        if (selectedCell) {
            const {row, col} = selectedCell;
            const newGrid = grid.map((r, rowIndex) =>
                r.map((cell, colIndex) => {
                    // Check if the cell is not frozen and does not contain a letter
                    if (rowIndex === row && colIndex === col && !cell.frozen && !cell.letter) {
                        // Reveal the letter from the solution grid
                        return {
                            ...cell,
                            letter: solutionGrid[rowIndex][colIndex].letter,
                            completed: true
                        };
                    }
                    return cell;
                })
            );
            setGrid(newGrid);
        }
    };

    const revealWord = () => {
        if (selectedCell) {
            const {row, col} = selectedCell;
            const cell = grid[row][col];

            if (cell.startPosition) {
                const {startPosition, wordDirection, wordLength} = cell;
                const {row: startRow, col: startCol} = startPosition;

                //TODO: Refactor this into a separate function, maybe use revealLetter function
                const newGrid = grid.map((r, rowIndex) =>
                    r.map((cell, colIndex) => {
                        if (wordDirection === 'h' && rowIndex === startRow && colIndex >= startCol && colIndex < startCol + wordLength) {
                            return {
                                ...cell,
                                letter: solutionGrid[rowIndex][colIndex].letter,
                                completed: true
                            };
                        } else if (wordDirection === 'v' && colIndex === startCol && rowIndex >= startRow && rowIndex < startRow + wordLength) {
                            return {
                                ...cell,
                                letter: solutionGrid[rowIndex][colIndex].letter,
                                completed: true
                            };
                        }
                        return cell;
                    })
                );

                setGrid(newGrid);
            }
        }
    };

    const revealSolution = () => {
        const newGrid = solutionGrid.map(row =>
            row.map(cell => ({
                ...cell,
                completed: !cell.frozen
            }))
        );
        // Set the grid to the solution grid
        setGrid(newGrid);
        setIsTimerRunning(false);
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    // For styling the board, calculate the cell size and board width based on the number of rows and columns
    const maxBoardSize = Math.min(window.innerWidth, window.innerHeight) * 0.5;
    const cellSize = Math.min(60, maxBoardSize / Math.max(rows, cols));
    const boardWidth = cols * cellSize + (cols - 1) * 2;

    return (
        <div className="board-container">
            <div>
                <div className="board-header">
                    <div className="timer">{t('board.time')}: {timer}s</div>
                    <div className="buttons">
                        <button onClick={resetBoard}>{t('board.reset')}</button>
                        <button onClick={revealLetter}>{t('board.revealLetter')}</button>
                        <button onClick={revealWord}>{t('board.revealWord')}</button>
                        <button onClick={revealSolution}>{t('board.revealSolution')}</button>
                    </div>
                </div>
                <div
                    className="board"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                        width: `${boardWidth}px`,
                    }}
                >
                    {Array.from({length: cols}).map((_, colIndex) => (
                        <div key={colIndex} className="board-row">
                            {Array.from({length: rows}).map((_, rowIndex) => { //iterate over rows
                                const cellData = grid[rowIndex]?.[colIndex];
                                if (!cellData) return null; // Invalid cell
                                return (
                                    <Cell
                                        key={`${rowIndex}-${colIndex}`}
                                        data={{
                                            ...cellData,
                                            id: `cell-${rowIndex}-${colIndex}`,
                                        }}
                                        onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="hints-container">
                <div className="hint-display">{currentHint}</div>
                <div className="hints-title">Hints</div>
                {initialData.map((item, index) => (
                    <div key={index} className="hint-item">
                        {index + 1}. {item.hint}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Board;
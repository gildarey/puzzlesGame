import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Cell from './Cell';
import { generateBoard } from '../utils/generateBoard';
import '../assets/Board.css';

const Board = ({ t, settings, onWordComplete }) => {
    const { i18n } = useTranslation();
    const [grid, setGrid] = useState([]);
    const [solutionGrid, setSolutionGrid] = useState([]);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [currentHint, setCurrentHint] = useState('');
    const [initialData, setInitialData] = useState([]);
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(10);
    const [lastChangedCell, setLastChangedCell] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);

    useEffect(() => {
        const fetchBoardData = async () => {
            const { initialData, boardDimensions } = await generateBoard(settings.language, settings.difficulty, settings.topic);

            if (!initialData || initialData.length === 0) {
                return;
            }

            setInitialData(initialData);
            setRows(boardDimensions.rows);
            setCols(boardDimensions.cols);
        };

        fetchBoardData();
    }, [settings]);

    useEffect(() => {
        if (initialData.length > 0 && rows > 0 && cols > 0) {
            const { updatedGrid, placedWords } = createInitialGrid(rows, cols, initialData);
            setGrid(updatedGrid);
            setSolutionGrid(placedWords);
            printBoard(placedWords);
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
            const { row, col } = lastChangedCell;
            if (checkWordCompletion(grid, row, col)) {
                onWordComplete && onWordComplete();
                freezeWord(row, col);
            }
        }
    }, [grid, lastChangedCell]);

    const createInitialGrid = (rows, cols, initialData) => {
        const defaultGrid = Array(rows)
            .fill(null)
            .map(() =>
                Array(cols).fill({
                    letter: '',
                    frozen: true,
                    isStartOfWord: false,
                    wordHint: '',
                    wordNumber: null,
                    wordDirection: '',
                    wordLength: 0,
                    startPosition: ''
                })
            );

        const placedWords = placeWords(defaultGrid, shuffleArray(initialData));
        const updatedGrid = placedWords.map(row =>
            row.map(cell => ({
                ...cell,
                letter: '', // Keep letters empty
            }))
        );

        return { updatedGrid, placedWords };
    };

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    const canPlaceWord = (grid, word, row, col, direction) => {
        const N = grid.length;
        const M = grid[0].length;
        const wordLength = word.word.length;

        if (direction === 'horizontal') {
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
        } else if (direction === 'vertical') {
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

    const placeWord = (grid, word, row, col, direction) => {
        const newGrid = grid.map(row => row.slice());

        const wordNumber = initialData.indexOf(word) + 1;

        if (direction === 'horizontal') {
            for (let i = 0; i < word.word.length; i++) {
                newGrid[row][col + i] = {
                    ...newGrid[row][col + i],
                    letter: word.word[i],
                    isStartOfWord: i === 0,
                    wordHint: i === 0 ? word.hint : '',
                    wordNumber: i === 0 ? wordNumber : null,
                    wordDirection: direction,
                    wordLength: word.word.length,
                    startPosition: { row, col },
                    frozen: false,
                };
            }
        } else if (direction === 'vertical') {
            for (let i = 0; i < word.word.length; i++) {
                newGrid[row + i][col] = {
                    ...newGrid[row + i][col],
                    letter: word.word[i],
                    isStartOfWord: i === 0,
                    wordHint: i === 0 ? word.hint : '',
                    wordNumber: i === 0 ? wordNumber : null,
                    wordDirection: direction,
                    wordLength: word.word.length,
                    startPosition: { row, col },
                    frozen: false,
                };
            }
        }
        return newGrid;
    };

    const removeWord = (grid, word, row, col, direction) => {
        const newGrid = grid.map(row => row.slice());
        if (direction === 'horizontal') {
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
        } else if (direction === 'vertical') {
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

    const findIntersections = (grid, word) => {
        const intersections = [];
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                for (const direction of ['horizontal', 'vertical']) {
                    if (canPlaceWord(grid, word, row, col, direction)) {
                        intersections.push({ row, col, direction });
                    }
                }
            }
        }
        return intersections;
    };

    const backtrack = (grid, words, index, wordNumber) => {
        if (index === words.length) return grid;

        const word = words[index];
        const intersections = findIntersections(grid, word);
        for (const { row, col, direction } of intersections) {
            const newGrid = placeWord(grid, word, row, col, direction, wordNumber);
            const result = backtrack(newGrid, words, index + 1, wordNumber + 1);
            if (result) return result;
            grid = removeWord(grid, word, row, col, direction);
        }
        return null;
    };

    const placeWords = (grid, words) => {
        return backtrack(grid, words, 0, 1) || grid;
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
        setLastChangedCell({ row, col });

        // Move to the next cell based on the direction
        let nextRow = row;
        let nextCol = col;
        if (grid[row][col].wordDirection === 'horizontal') {
            nextCol = col + 1;
        } else if (grid[row][col].wordDirection === 'vertical') {
            nextRow = row + 1;
        }

        if (nextRow < grid.length && nextCol < grid[0].length) {
            console.log('.........:', nextRow, nextCol);
            const nextCell = document.getElementById(`cell-${nextRow}-${nextCol}`);
            if (nextCell) {
                console.log('Moving to next cell:', nextRow, nextCol);
                nextCell.focus();
                nextCell.select();
            }
        }

    }, [grid, isTimerRunning]);

    const handleCellClick = (row, col) => {
        const cell = grid[row][col];
        if (!cell.frozen) {
            setSelectedCell({ row, col });
            if (cell.isStartOfWord) {
                setCurrentHint(`(${cell.wordNumber})(${cell.wordDirection}) ${cell.wordHint}`);
            } else {
                setCurrentHint('');
            }
        }
    };

    const checkWordCompletion = (grid, row, col) => {
        if (!grid || !grid[row] || !grid[row][col]) {
            console.error('Invalid grid or cell position:', row, col);
            return false;
        }

        const cell = grid[row][col];

        if (cell.startPosition) {
            const { startPosition, wordDirection, wordLength } = cell;
            const { row: startRow, col: startCol } = startPosition;

            if (!solutionGrid || !solutionGrid[startRow] || !solutionGrid[startRow][startCol]) {
                console.error('Invalid solution grid or start position:', startRow, startCol);
                return false;
            }

            const extractWord = (grid, startRow, startCol, wordLength, wordDirection) => {
                let word = '';
                if (wordDirection === 'horizontal') {
                    for (let c = 0; c < wordLength; c++) {
                        word += grid[startRow][startCol + c].letter.toUpperCase();
                    }
                } else if (wordDirection === 'vertical') {
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

    const freezeWord = (row, col) => {
        const cell = grid[row][col];
        const { startPosition, wordDirection, wordLength } = cell;
        const { row: startRow, col: startCol } = startPosition;

        const newGrid = grid.map((r, rowIndex) =>
            r.map((cell, colIndex) => {
                if (wordDirection === 'horizontal' && rowIndex === startRow && colIndex >= startCol && colIndex < startCol + wordLength) {
                    return { ...cell, completed: true };
                } else if (wordDirection === 'vertical' && colIndex === startCol && rowIndex >= startRow && rowIndex < startRow + wordLength) {
                    return { ...cell, completed: true };
                }
                return cell;
            })
        );

        setGrid(newGrid);
    };

    const resetBoard = () => {
        const { updatedGrid, placedWords } = createInitialGrid(rows, cols, initialData);
        setGrid(updatedGrid);
        setSolutionGrid(placedWords);
        setTimer(0);
        setIsTimerRunning(false);
        printBoard(placedWords);
    };

    const revealLetter = () => {
        if (selectedCell) {
            const { row, col } = selectedCell;
            const newGrid = grid.map((r, rowIndex) =>
                r.map((cell, colIndex) => {
                    if (rowIndex === row && colIndex === col && !cell.frozen && !cell.letter) {
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
        const { row, col } = selectedCell;
        const cell = grid[row][col];

        if (cell.startPosition) {
            const { startPosition, wordDirection, wordLength } = cell;
            const { row: startRow, col: startCol } = startPosition;

            const newGrid = grid.map((r, rowIndex) =>
                r.map((cell, colIndex) => {
                    if (wordDirection === 'horizontal' && rowIndex === startRow && colIndex >= startCol && colIndex < startCol + wordLength) {
                        return {
                            ...cell,
                            letter: solutionGrid[rowIndex][colIndex].letter,
                            completed: true
                        };
                    } else if (wordDirection === 'vertical' && colIndex === startCol && rowIndex >= startRow && rowIndex < startRow + wordLength) {
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
        setGrid(newGrid);
        setIsTimerRunning(false);
    };

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
            <div className="board">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {row.map((cell, colIndex) => (
                            <Cell
                                key={`${rowIndex}-${colIndex}`}
                                data={{
                                    ...cell,
                                    id: `cell-${rowIndex}-${colIndex}`
                                }}
                                onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                            />
                        ))}
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
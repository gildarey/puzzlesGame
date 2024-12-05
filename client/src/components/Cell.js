import React from 'react';
import '../assets/Cell.css';

const CellComponent = ({ data, onChange, onClick }) => {
    const { id, letter, frozen, wordHint, wordNumber, completed } = data;
    return (
        <div className={`cell ${frozen ? 'frozen' : completed ? 'completed' : ''}`} onClick={onClick}>
            <input
                id={id}
                type="text"
                value={letter}
                onChange={(e) => onChange(e.target.value)}
                maxLength="1"
                disabled={frozen}
            />
            {wordNumber && <div className="cell-number">{wordNumber}</div>}
        </div>
    );
};

const Cell = React.memo(CellComponent);

export default Cell;
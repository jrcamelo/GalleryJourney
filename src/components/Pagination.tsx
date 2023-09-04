import React from 'react';

interface Props {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<Props> = ({ currentPage, setCurrentPage }) => {
    return (
        <div>
        <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
        <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        </div>
        );
    };
    
    export default Pagination;
    
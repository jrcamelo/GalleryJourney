import React from 'react';

interface Props {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const Pagination: React.FC<Props> = ({ currentPage, setCurrentPage, totalPages }) => {
  const range = 2;
  let start = Math.max(currentPage - range, 1);
  let end = Math.min(currentPage + range, totalPages);

  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="pagination-container">
      {start > 1 && (
        <>
          <button
            className="pagination-button"
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <span>&nbsp; ... &nbsp;</span>
        </>
      )}

      {pageNumbers.map((num) => (
        <button
          key={num}
          className={`pagination-button ${num === currentPage ? "pagination-button--current" : ""}`}
          disabled={num === currentPage}
          onClick={() => setCurrentPage(num)}
        >
          {num}
        </button>
      ))}

      {end < totalPages && (
        <>
          <span>&nbsp; ... &nbsp;</span>
          <button
            className={`pagination-button ${totalPages === currentPage ? "pagination-button--current" : ""}`}
            disabled={totalPages === currentPage}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}
    </div>
  );
};

export default Pagination;

import React from 'react';
import './Pagination.css';
import PageButton from '../components/PageButton';

interface Props {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const Pagination: React.FC<Props> = ({ currentPage, setCurrentPage, totalPages }) => {
  const range = 2;
  const start = Math.max(currentPage - range, 1);
  const end = Math.min(currentPage + range, totalPages);

  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const renderDots = () => <span className="dots">...</span>;

  const renderPageButton = (pageNumber: number) => (
    <PageButton
      key={pageNumber}
      label={pageNumber.toString()}
      isActive={pageNumber === currentPage}
      onClick={() => setCurrentPage(pageNumber)}
    />
  );

  return (
    <div className="pagination-container">
      {start > 1 && (
        <>
          {renderPageButton(1)}
          {renderDots()}
        </>
      )}

      {pageNumbers.map(pageNumber => renderPageButton(pageNumber))}

      {end < totalPages && (
        <>
          {renderDots()}
          {renderPageButton(totalPages)}
        </>
      )}
    </div>
  );
};

export default Pagination;

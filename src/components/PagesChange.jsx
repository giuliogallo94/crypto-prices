import { useState } from "react";
import PropTypes from "prop-types";

PagesChange.propTypes = {
  pageNumber: PropTypes.number.isRequired, // pageNumber deve essere un numero
  onPageChange: PropTypes.func.isRequired, // onPageChange deve essere una funzione
};

export default function PagesChange({ pageNumber, onPageChange }) {
  const [progPageNumber, setProgPageNumber] = useState(1);

  function handleNextProgPageNumber() {
    if (pageNumber > 9) {
      setProgPageNumber(pageNumber - 8);
    } else {
      setProgPageNumber(1);
    }
  }

  function handlePrevProgPageNumber() {
    if (pageNumber > 10) {
      setProgPageNumber(pageNumber - 10);
    } else {
      setProgPageNumber(1);
    }
  }

  function handlePageNumber(curPage) {
    onPageChange(curPage);
  }

  function prevPage(curPage) {
    if (curPage > 1) {
      onPageChange(curPage - 1);
    }
    handlePrevProgPageNumber();
  }

  function nextPage(curPage) {
    if (curPage < 50) {
      onPageChange(curPage + 1);
    }
    handleNextProgPageNumber();
  }

  return (
    <ol id="pages-list" className="flex justify-center items-center gap-4">
      <li>
        <button className="change-page" onClick={() => prevPage(pageNumber)}>
          &#8592;
        </button>
      </li>
      {[...Array(10)].map((_, i) => (
        <li key={i + progPageNumber}>
          <button
            className={
              pageNumber === i + progPageNumber ? "cur-page" : undefined
            }
            onClick={() => handlePageNumber(i + progPageNumber)}>
            {i + progPageNumber}
          </button>
        </li>
      ))}
      <li>
        <button className="change-page" onClick={() => nextPage(pageNumber)}>
          &#8594;
        </button>
      </li>
    </ol>
  );
}

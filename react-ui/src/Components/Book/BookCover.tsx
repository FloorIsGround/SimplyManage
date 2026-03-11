import React from 'react';

interface BookCoverProps {
  isbn: number;
  alt?: string;
}

const BookCover: React.FC<BookCoverProps> = ({ isbn, alt = 'Book Cover' }) => (
  <img
    src={`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`}
    alt={alt}
    style={{
      width: '100%',
      borderRadius: 4,
      objectFit: 'cover',
      display: 'block',
    }}
  />
);

export default BookCover;

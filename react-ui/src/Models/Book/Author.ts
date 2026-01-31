export interface Author {
  id: number;          // Unique identifier for the author
  name: string;        // Full name of the author
  bio: string;         // Short biography or description of the author
  birthDate: Date;     // Author's date of birth
  books: number[];     // Array of book IDs written by this author
}

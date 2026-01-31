export interface Library {
  id: number;          // Unique identifier for the library branch
  name: string;        // Name of the library
  address: string;     // Physical address of the library
  phoneNumber: string; // Contact phone number for the library
  books: number[];     // Array of book IDs available at this library
}


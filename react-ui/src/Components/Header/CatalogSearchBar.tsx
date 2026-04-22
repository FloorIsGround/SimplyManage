import { TextField, IconButton, useTheme } from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import type { Book } from "../../Models/Book/Book";
import axios from '../../utils/axios-api';

export interface CatalogSearchProps {
  onSearchSuccess(results: Book[]): void;
  onSearchLoading(loading: boolean): void;
  onSearchFailure(error: string): void
}

function CatalogSearchBar({ onSearchSuccess, onSearchLoading, onSearchFailure }: CatalogSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();

  const handleSearch = () => {
    onSearchLoading(true);
    axios
      .get(`/books/search/${searchQuery}`)
      .then((res) => {
        onSearchSuccess(res.data);
        onSearchLoading(false);
        setSearchQuery("");
      })
      .catch((err) => {
        console.error("Error searching for book:", err);
        onSearchLoading(false);
        onSearchFailure(err);
      });
  };

  return (
    <>
      <TextField 
        id="filled-basic" 
        placeholder="Search Catalog"
        variant="outlined" 
        value={searchQuery}
        onChange={ (event) => {
          setSearchQuery(event.target.value);
        }} 
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSearch();
          }
        }}
        sx={{ 
          width: 400, 
          '& .MuiInputBase-root': { height: 36 },
          '& input::placeholder': {
            fontSize: '0.85rem',
            color: theme.palette.text.secondary
          }
        }}
    />
    <IconButton 
      aria-label="search" 
      onClick={() => {
        handleSearch();
      }}
      sx={{ 
        backgroundColor: theme.palette.primary.main, 
        borderRadius: 1, 
        ml: 1,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: theme.palette.primary.dark
        }
      }}>
      <SearchIcon sx={{ fontSize: 20, color: 'white' }}/>
    </IconButton>
    </>
  )
}

export default CatalogSearchBar

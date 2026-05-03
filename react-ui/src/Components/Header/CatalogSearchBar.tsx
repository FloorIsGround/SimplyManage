import { TextField, IconButton, useTheme, MenuItem, Select, InputLabel, FormControl, Box, Popover, Button, Badge } from "@mui/material";
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
  const [genre, setGenre] = useState("");
  const [audience, setAudience] = useState("");
  const [rating, setRating] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleSearch = () => {
    onSearchLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("searchQuery", searchQuery);
    if (genre) params.append("genre", genre);
    if (audience) params.append("audience", audience);
    if (rating) params.append("rating", rating);
    axios
      .get(`/books/search?${params.toString()}`)
      .then((res) => {
        onSearchSuccess(res.data);
        onSearchLoading(false);
      })
      .catch((err) => {
        console.error("Error searching for book:", err);
        onSearchLoading(false);
        onSearchFailure(err);
      });
  };

  const activeFilterCount = [genre, audience, rating].filter(Boolean).length;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          width: 200, 
          '& .MuiInputBase-root': { height: 36 },
          '& input::placeholder': {
            fontSize: '0.85rem',
            color: theme.palette.text.secondary
          }
        }}
      />
      <Badge color="primary" badgeContent={activeFilterCount} invisible={activeFilterCount === 0} sx={{ '& .MuiBadge-badge': { top: 6, right: 6 } }}>
        <Button
          variant="outlined"
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{ minWidth: 90 }}
        >
          Filters
        </Button>
      </Badge>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 220 }}>
          <FormControl size="small">
            <InputLabel id="genre-label">Genre</InputLabel>
            <Select
              labelId="genre-label"
              value={genre}
              label="Genre"
              onChange={e => setGenre(e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="Fiction">Fiction</MenuItem>
              <MenuItem value="Nonfiction">Nonfiction</MenuItem>
              <MenuItem value="Mystery">Mystery</MenuItem>
              <MenuItem value="Fantasy">Fantasy</MenuItem>
              <MenuItem value="Science Fiction">Science Fiction</MenuItem>
              <MenuItem value="Biography">Biography</MenuItem>
              <MenuItem value="History">History</MenuItem>
              <MenuItem value="Children">Children</MenuItem>
              {/* Add more genres as needed */}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel id="audience-label">Audience</InputLabel>
            <Select
              labelId="audience-label"
              value={audience}
              label="Audience"
              onChange={e => setAudience(e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="Adult">Adult</MenuItem>
              <MenuItem value="Teen">Teen</MenuItem>
              <MenuItem value="Children">Children</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel id="rating-label">Rating</InputLabel>
            <Select
              labelId="rating-label"
              value={rating}
              label="Rating"
              onChange={e => setRating(e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="5">5 Stars</MenuItem>
              <MenuItem value="4">4+ Stars</MenuItem>
              <MenuItem value="3">3+ Stars</MenuItem>
              <MenuItem value="2">2+ Stars</MenuItem>
              <MenuItem value="1">1+ Stars</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              color="secondary"
              onClick={() => {
                setGenre("");
                setAudience("");
                setRating("");
              }}
              disabled={activeFilterCount === 0}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Popover>
      <IconButton 
        aria-label="search" 
        onClick={handleSearch}
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
    </Box>
  )
}

export default CatalogSearchBar

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert, MenuItem } from '@mui/material';
import { useBranches } from '../LibraryInfo/useBranches';
import axios from '../../utils/axios-api';

interface AddBookFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CONDITION_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'LOST', label: 'Lost' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const AddBookForm: React.FC<AddBookFormProps> = ({ open, onClose, onSuccess }) => {
  const initialFormState = React.useMemo(() => ({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    publicationYear: '',
    audience: '',
    numCopies: 1,
    conditionStatus: 'AVAILABLE',
    location: '',
  }), []);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState('');
  const timeoutRef = React.useRef<number | null>(null);
  const { branches, loading: branchesLoading, error: branchesError } = useBranches();

  // Reset form and messages when dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      setForm(initialFormState);
      setSuccess('');
      setError('');
      setValidationError('');
    }
    if (open) {
      setSuccess('');
      setError('');
      setValidationError('');
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [open, initialFormState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setValidationError('');
    setError('');
    setSuccess('');
    // Validate required fields
    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.audience.trim()) {
      setValidationError('Please fill in all required fields.');
      return;
    }
    if (!form.numCopies || isNaN(Number(form.numCopies)) || Number(form.numCopies) < 1) {
      setValidationError('Please enter a valid number of copies.');
      return;
    }
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      audience: form.audience.trim(),
      genre: form.genre.trim() ? form.genre.trim() : null,
      description: form.description.trim() ? form.description.trim() : null,
      publicationYear: form.publicationYear.trim() ? Number(form.publicationYear) : null,
    };
    setLoading(true);
    let bookId;
    try {
      // Try to create the book
      const res = await axios.post('/books', payload);
      bookId = res.data?.id || res.data?.bookId || res.data?._id;
    } catch (err: any) {
      // If book already exists, fetch its ID by ISBN
      if (err?.response?.status === 409) {
        try {
          const existing = await axios.get(`/books?isbn=${encodeURIComponent(form.isbn.trim())}`);
          bookId = existing.data?.id || existing.data?.bookId || existing.data?._id;
        } catch {
          setLoading(false);
          setError('Book exists but could not fetch its ID.');
          return;
        }
      } else {
        setLoading(false);
        const errorMsg =
          (err?.response?.data && JSON.stringify(err.response.data)) ||
          err?.response?.data?.message ||
          err.message ||
          'Failed to add book or copies';
        setError(errorMsg);
        console.error('AddBookForm error:', err);
        return;
      }
    }
    // Add Copies
    try {
      const copiesPayload = Array.from({ length: Number(form.numCopies) }).map(() => ({
        bookId,
        conditionStatus: form.conditionStatus,
        location: form.location || null,
      }));
      await axios.post('/copies', copiesPayload);
      setLoading(false);
      setSuccess('Book and copies added successfully!');
      if (onSuccess) onSuccess();
      timeoutRef.current = setTimeout(onClose, 1200);
    } catch (err: any) {
      setLoading(false);
      const errorMsg =
        (err?.response?.data && JSON.stringify(err.response.data)) ||
        err?.response?.data?.message ||
        err.message ||
        'Failed to add copies';
      setError(errorMsg);
      console.error('AddBookForm error:', err);
    }
  };

  // Helper for required field validation props
  const getFieldValidation = (field: keyof typeof form, label: string) => {
    const value = form[field];
    let isEmpty = false;
    if (typeof value === 'string') {
      isEmpty = !value.trim();
    } else if (typeof value === 'number') {
      isEmpty = value === undefined || value === null;
    } else {
      isEmpty = value === undefined || value === null;
    }
    return {
      required: true,
      error: !!validationError && isEmpty,
      helperText: !!validationError && isEmpty ? `${label} is required.` : '',
    };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Book</DialogTitle>
      <DialogContent sx={{ minHeight: 400 }}>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            {...getFieldValidation('title', 'Title')}
          />
          <TextField
            label="Author"
            name="author"
            value={form.author}
            onChange={handleChange}
            {...getFieldValidation('author', 'Author')}
          />
          <TextField
            label="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            {...getFieldValidation('isbn', 'ISBN')}
          />
          <TextField label="Genre" name="genre" value={form.genre} onChange={handleChange} />
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={2} />
          <TextField label="Publication Year" name="publicationYear" value={form.publicationYear} onChange={handleChange} type="number" />
          <TextField
            label="Audience"
            name="audience"
            value={form.audience}
            onChange={handleChange}
            {...getFieldValidation('audience', 'Audience')}
          />
          <TextField
            label="Number of Copies"
            name="numCopies"
            type="number"
            value={form.numCopies}
            onChange={handleChange}
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
          />
          <TextField
            select
            label="Condition Status"
            name="conditionStatus"
            value={form.conditionStatus}
            onChange={handleChange}
            sx={{ mt: 1 }}
          >
            {CONDITION_STATUSES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            sx={{ mt: 1 }}
            disabled={branchesLoading || !!branchesError}
            helperText={branchesError || ''}
            required
          >
            {branches.map(branch => (
              <MenuItem key={branch.id} value={String(branch.id)}>
                {branch.name}
              </MenuItem>
            ))}
          </TextField>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>Add Book</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBookForm;

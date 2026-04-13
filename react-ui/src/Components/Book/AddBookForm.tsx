import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert } from '@mui/material';
import axios from '../../utils/axios-api';

interface AddBookFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddBookForm: React.FC<AddBookFormProps> = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    publicationYear: '',
    audience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState('');

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
    try {
      await axios.post('/books', payload);
      setLoading(false);
      setSuccess('Book added successfully!');
      if (onSuccess) onSuccess();
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.message || 'Failed to add book');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Book</DialogTitle>
      <DialogContent sx={{ minHeight: 400 }}>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} required />
          <TextField label="Author" name="author" value={form.author} onChange={handleChange} required />
          <TextField label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} required />
          <TextField label="Genre" name="genre" value={form.genre} onChange={handleChange} />
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={2} />
          <TextField label="Publication Year" name="publicationYear" value={form.publicationYear} onChange={handleChange} type="number" />
          <TextField label="Audience" name="audience" value={form.audience} onChange={handleChange} />
          {validationError && <Alert severity="error">{validationError}</Alert>}
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

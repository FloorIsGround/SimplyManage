import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { FAQ } from "../Models/LibraryInfo/Faq";


// Sample library FAQ data
const faqsData: FAQ[] = [
  {
    question: "How do I borrow a book?",
    answer:
      "Log in, search for the book, and click 'Borrow'. You can borrow up to 5 books at a time.",
  },
  {
    question: "Can I reserve a book that is currently checked out?",
    answer:
      "Yes! Click 'Reserve' on the book page and you'll be notified when it's available.",
  },
  {
    question: "How do I renew my borrowed books?",
    answer:
      "Go to 'My Account' > 'Borrowed Books' and click 'Renew' if no one else has reserved it.",
  },
  {
    question: "Are e-books available?",
    answer:
      "Absolutely! Filter by 'E-book' in the search options to borrow instantly.",
  },
  {
    question: "How can I get help with my account?",
    answer:
      "Click 'Help' in the header to access FAQs or contact support for assistance.",
  },
];

function Faqs() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter FAQs based on search query
  const filteredFaqs = faqsData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 6, px: 2 }}>
      <Typography variant="h3" gutterBottom textAlign="center" sx={{ color: "#4E780C" }}>
        Frequently Asked Questions
      </Typography>

      {/* Search bar */}
      <Box sx={{ display: "flex", mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Accordion list */}
      {filteredFaqs.length ? (
        filteredFaqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography textAlign="center" sx={{ mt: 4 }}>
          No FAQs match your search.
        </Typography>
      )}
    </Box>
  );
}

export default Faqs;

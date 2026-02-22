import { useState, useEffect } from "react";
import axios from "axios";
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

function Faqs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch FAQs from backend
  useEffect(() => {
    axios
      .get("http://localhost:3003/api/faqs")
      .then((res) => {
        console.log("FAQ response:", res.data);
        setFaqs(res.data);
      })
      .catch((err) => {
        console.error("Error fetching FAQs:", err);
      });
  }, []);

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 6, px: 2 }}>
      <Typography
        variant="h3"
        gutterBottom
        textAlign="center"
        color= "primary"
      >
        Frequently Asked Questions
      </Typography>
      {/* Search bar */}
      <Box sx={{ display: "flex", mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search FAQs"
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

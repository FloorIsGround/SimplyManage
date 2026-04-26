import { useState } from "react";
import { Button, Typography, MenuItem, Menu, CircularProgress } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type { Copy } from "../../Models/Book/Copy";
import { useBranches } from "../LibraryInfo/useBranches";
import axios from "../../utils/axios-api";

interface CheckoutProps {
  copies: Copy[];
  onSuccess?: () => void;
  setSuccess?: (msg: string) => void;
}

function getDueDate() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
}

const Checkout: React.FC<CheckoutProps> = ({ copies, onSuccess, setSuccess }) => {
  const { branches, loading: branchesLoading } = useBranches();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAvailable = copies.some(copy => copy.conditionStatus === "AVAILABLE");
  const availableBranches = branches.filter(branch =>
    copies.some(copy => copy.branchId === branch.id && copy.conditionStatus === "AVAILABLE")
  );

  const handleCheckout = async (branchId: number) => {
    setError("");
    if (setSuccess) setSuccess("");
    setLoading(true);
    try {
      const copy = copies.find(c => c.branchId === branchId && c.conditionStatus === "AVAILABLE");
      if (!copy) {
        setError("No available copies at this branch.");
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      let userId = undefined;
      if (token) {
        try {
          const decoded: any = JSON.parse(atob(token.split('.')[1]));
          userId = decoded.id || decoded.userId || decoded._id;
        } catch {
          setError("Invalid user token.");
          setLoading(false);
          return;
        }
      }
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      const dueAt = getDueDate();
      await axios.post('/loans', {
        userId,
        copyId: copy.id,
        dueAt
      });
      if (setSuccess) {
        setSuccess(
          `Book checked out successfully!\nDue: ${new Date(dueAt).toLocaleDateString()}\nYou'll get a notification when your book is available for pickup.`
        );
      }
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Checkout failed.");
      setLoading(false);
    }
  };

  if (branchesLoading) return <CircularProgress size={24} />;

  if (!isAvailable) {
    return <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled>Not Available</Button>;
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={e => setAnchorEl(e.currentTarget)}
        disabled={loading}
        endIcon={<ArrowDropDownIcon />}
      >
        {loading ? "Checking Out..." : "Check Out"}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {availableBranches.map(branch => (
          <MenuItem
            key={branch.id}
            onClick={() => {
              setAnchorEl(null);
              handleCheckout(branch.id);
            }}
          >
            {branch.name}
          </MenuItem>
        ))}
      </Menu>
      {error && <Typography color="error">{error}</Typography>}
    </>
  );
};

export default Checkout;

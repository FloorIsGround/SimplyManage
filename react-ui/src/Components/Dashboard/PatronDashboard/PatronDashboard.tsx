import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Tabs, Tab } from "@mui/material";
import { useState, useEffect } from "react";
import type { User } from "../../../Models/User/User";
import type { Fee } from "../../../Models/User/Fee";
import type { Loan } from "../../../Models/Book/Loan";
type LoanWithBookTitle = Loan & { bookTitle?: string };
import axios from "../../../utils/axios-api";
import { jwtDecode } from "jwt-decode";

function PatronDashboard() {
  const holds = [
    { title: "To Kill a Mockingbird", status: "Ready for Pickup" },
    { title: "Brave New World", status: "Pending" },
  ];
  const notifications = [
    { type: "Due Soon", message: "'The Great Gatsby' is due in 2 days.", date: "2026-04-21" },
    { type: "Overdue", message: "'1984' is overdue! Please return it.", date: "2026-04-17" },
    { type: "Hold Ready", message: "'To Kill a Mockingbird' is ready for pickup.", date: "2026-04-19" },
  ];

  const [tab, setTab] = useState(0);
  const [activityTab, setActivityTab] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loans, setLoans] = useState<LoanWithBookTitle[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loadingFees, setLoadingFees] = useState(true);
  const [feeError, setFeeError] = useState("");
  const outstandingFeeCents = fees.reduce((sum, fee) => sum + fee.amountCents, 0);

  useEffect(() => {
    // Get token and decode userId
    const token = localStorage.getItem("token");
    if (!token) {
      setTimeout(() => {
        setUser(null);
        setLoadingUser(false);
      }, 0);
      return;
    }
    let userId = undefined;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.id || decoded.userId || decoded._id;
    } catch {
      setTimeout(() => {
        setUser(null);
        setLoadingUser(false);
      }, 0);
      return;
    }
    if (!userId) {
      setTimeout(() => {
        setUser(null);
        setLoadingUser(false);
      }, 0);
      return;
    }
    console.log('[PatronDashboard] userId from token:', userId);
    axios.get(`/users/${userId}`)
      .then((res: any) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false))
    axios.get(`/loans/user/${userId}`)
      .then((res: any) => {
        console.log('[PatronDashboard] /loans response:', res.data);
        const userLoans: LoanWithBookTitle[] = res.data || [];
        setLoans(userLoans);
      })
      .catch((err) => {
        console.log('[PatronDashboard] /loans error:', err);
        setLoans([]);
      })
      .finally(() => setLoadingLoans(false));
    axios.get(`/billing/users/${userId}/fees`)
      .then((res: any) => setFees(res.data || []))
      .catch((err) => {
        setFeeError(err?.response?.data?.error || "Failed to load fees.");
        setFees([]);
      })
      .finally(() => setLoadingFees(false));
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Patron Dashboard
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
        <Tab label="Account Summary" />
        <Tab label="Account Activity" />
      </Tabs>
      {tab === 0 && (
        <Box sx={{ maxWidth: 500, mx: "auto" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Account Summary
              </Typography>
              {loadingUser ? (
                <Typography>
                  Loading...
                </Typography>
              ) : user ? (
                <>
                  <Typography>
                    Name: { user.firstName } { user.lastName }
                  </Typography>
                  <Typography>
                    Email: { user.email }
                  </Typography>
                  <Typography>
                    Card Expiration: 2027-12-31
                  </Typography>
                  <Typography>
                    Status: { user.status }
                  </Typography>
                </>
              ) : (
                <Typography color="error">
                  Failed to load user info.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ maxWidth: 700, mx: "auto" }}>
          <Tabs value={activityTab} onChange={(_, v) => setActivityTab(v)} centered sx={{ mb: 3 }}>
            <Tab label="Loans / Loan History" />
            <Tab label="Holds" />
            <Tab label="Fines" />
            <Tab label="Notifications" />
          </Tabs>
          {activityTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Loans / Loan History
                </Typography>
                {loadingLoans ? (
                  <Typography>Loading...</Typography>
                ) : loans && loans.length > 0 ? (
                  <List>
                    {loans.map((loan, idx) => (
                      <ListItem key={loan.id || idx}>
                        <ListItemText
                          primary={loan.bookTitle || 'Book Title'}
                          secondary={
                            loan.returnedAt
                              ? `Returned: ${new Date(loan.returnedAt).toLocaleDateString()}`
                              : `Due: ${loan.dueAt ? new Date(loan.dueAt).toLocaleDateString() : 'N/A'}`
                          }
                        />
                        {loan.status === 2 && (
                          <Typography color="error" sx={{ ml: 2, fontWeight: 600 }}>
                            Overdue
                          </Typography>
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No books currently checked out.</Typography>
                )}
              </CardContent>
            </Card>
          )}
          {activityTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Holds
                </Typography>
                <List>
                  {holds.map((hold, idx) => (
                    <ListItem key={ idx } 
                    secondaryAction={
                      <Button size="small" variant="text">
                        Cancel
                      </Button>}>
                    <ListItemText
                      primary={ hold.title }
                      secondary={ hold.status }
                    />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
          {activityTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Fines
                </Typography>
                {loadingFees ? (
                  <Typography>Loading fees...</Typography>
                ) : feeError ? (
                  <Typography color="error">{feeError}</Typography>
                ) : fees.length === 0 ? (
                  <Typography>No outstanding overdue fees.</Typography>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Outstanding Fees: ${(outstandingFeeCents / 100).toFixed(2)}
                    </Typography>
                    <List>
                      {fees.map((fee) => (
                        <ListItem key={fee.id}>
                          <ListItemText
                            primary={fee.bookTitle || "Overdue library fee"}
                            secondary={`${new Date(fee.assessedAt).toLocaleDateString()} • $${(fee.amountCents / 100).toFixed(2)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Please pay at the circulation desk.
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          )}
          {activityTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Notifications
                </Typography>
                {notifications.length === 0 ? (
                  <Typography>
                    No new notifications.
                  </Typography>
                ) : (
                  <List>
                    {notifications.map((note, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={note.message}
                          secondary={`${note.type} • ${note.date}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}

export default PatronDashboard;

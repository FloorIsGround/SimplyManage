import { AppBar, Box, Button, Card, CardActions, CardContent, Popover, Toolbar, Typography, useTheme } from "@mui/material";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState, useRef, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../utils/auth";
import BookList from "../Book/BookList";
import CatalogSearchBar from "./CatalogSearchBar";
import type { Book } from "../../Models/Book/Book";

function Header() {
  const logOutButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<null | HTMLElement>(null);

  // Get user info from token
  let userLetter = "U";
  let userEmail = "";
  if (isLoggedIn) {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded: any = JSON.parse(atob(token.split(".")[1]));
        userEmail = decoded.email || "";
        userLetter = (decoded.firstName?.[0] || decoded.email?.[0] || "U").toUpperCase();
      }
    } catch {
      // catch
    }
  }

  useEffect(() => {
    if (isLoggedIn && logOutButtonRef.current) {
      logOutButtonRef.current.blur();
    }
  }, [isLoggedIn]);

  const theme = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginAnchorEl, setLoginAnchorEl] = useState<null | HTMLElement>(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFailure, setSearchFailure] = useState<string | undefined>(undefined);

  const loginOpen = Boolean(loginAnchorEl);
  const helpOpen = Boolean(helpAnchorEl);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Primary Header Bar */}
      <AppBar position='static' elevation={0} sx={{ backgroundColor: 'white', borderBottom: `2px solid ${theme.palette.primary.main}`, height: 65 }}>
        <Toolbar>
          <LocalLibraryIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />
          <Typography sx={{ ml: 2, color: theme.palette.primary.main, fontSize: 17, cursor: "pointer" }} onClick={() => { navigate("/") }} component="span">
            SimplyManage Public Library
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="text" size="large" startIcon={<LocationOnIcon />} onClick={() => { navigate("/hours-locations") }}>
              Hours & Locations
            </Button>
            <Button variant="text" size="large" endIcon={<ExpandMoreIcon />} onClick={(e) => { setHelpAnchorEl(e.currentTarget) }}>
              Help
            </Button>
            {isLoggedIn ? (
              <>
                <Avatar
                  sx={{ bgcolor: theme.palette.primary.main, cursor: 'pointer' }}
                  onClick={e => setAvatarMenuAnchor(e.currentTarget)}
                  aria-label="user-avatar"
                >
                  {userLetter}
                </Avatar>
                <Popover
                  open={Boolean(avatarMenuAnchor)}
                  anchorEl={avatarMenuAnchor}
                  onClose={() => setAvatarMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 240, boxShadow: 3 } } }}
                >
                  <Card sx={{ minWidth: 240 }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'text.primary', textAlign: 'center', mb: 1 }}>
                        {userEmail}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ flexDirection: 'column', gap: 0.5, pt: 0 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="medium"
                        onClick={() => {
                          setAvatarMenuAnchor(null);
                          const role = getUserRole();
                          if (!role) {
                            window.alert("You must be logged in to access your dashboard.");
                            return;
                          }
                          if (role === "admin" || role === "librarian") {
                            navigate("/staff-dashboard");
                          } else if (role === "patron") {
                            navigate("/patron-dashboard");
                          } else {
                            window.alert("Unknown user role. Please contact support.");
                          }
                        }}
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="text"
                        color="primary"
                        fullWidth
                        size="medium"
                        onClick={() => {
                          localStorage.removeItem("token");
                          window.location.reload();
                        }}
                        sx={{ color: 'error.main', fontWeight: 600 }}
                      >
                        Log Out
                      </Button>
                    </CardActions>
                  </Card>
                </Popover>
              </>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={(e) => { setLoginAnchorEl(e.currentTarget) }}
                sx={{ lineHeight: 'normal' }}
              >
                Log In
              </Button>
            )}
          </Box>
          {/* Help Popover */}
          <Popover
            open={helpOpen}
            anchorEl={helpAnchorEl}
            onClose={() => { setHelpAnchorEl(null) }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <Typography>
                  Help & Support
                </Typography>
                <Typography variant="body2">
                  Get help with using SimplyManage Library
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => { setHelpAnchorEl(null); navigate("/faqs") }}>
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Popover>
          {/* Login component */}
          <Login
            open={loginOpen}
            anchorEl={loginAnchorEl}
            onClose={() => setLoginAnchorEl(null)}
            redirectPath="/patron-dashboard"
            onLoginSuccess={() => {
              setIsLoggedIn(true);
            }}
          />
        </Toolbar>
      </AppBar>
      {/* Secondary Header Bar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', height: 35 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CatalogSearchBar
            onSearchSuccess={(results: Book[]) => { setSearchResults(results) }}
            onSearchLoading={(loading: boolean) => {
              setSearchLoading(loading);
              setDrawerOpen(true);
            }}
            onSearchFailure={(error: string) => { setSearchFailure(error) }}
          />
        </Toolbar>
      </AppBar>
      <BookList 
        loading={searchLoading} 
        error={searchFailure} 
        results={searchResults} 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
        showNoResults={true} />
    </>
  )
}

export default Header

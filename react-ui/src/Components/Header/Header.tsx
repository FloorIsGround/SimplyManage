import { AppBar, Box, Button, Card, CardActions, CardContent, IconButton, Popover, TextField, Toolbar, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const [searchQuery, setSearchQuery] = useState(""); // Stores the user's search input from the search bar
  // Anchor elements determine where popovers attach on the screen
  const [loginAnchorEl, setLoginAnchorEl] = useState<null | HTMLElement>(null); 
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);

  // Boolean flags for popover visibility
  const loginOpen = Boolean(loginAnchorEl);
  const helpOpen = Boolean(helpAnchorEl);

  const navigate = useNavigate();

  return(
    <>
      {/* Primary header bar: branding + navigation actions */}
      <AppBar position='static' elevation={0} sx={{ backgroundColor: 'white', borderBottom: '4px solid #4E780C', height: 65 }}>
        <Toolbar>
          <LocalLibraryIcon sx={{ fontSize: 50, color: '#4E780C' }}/>
          <Typography sx={{ ml: 2, color: '#4E780C', fontSize: 17, cursor: "pointer" }} onClick={() => { navigate("/") }} component="span">
            SimplyManage Public Library
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="text" size="large" startIcon={<LocationOnIcon />} onClick={ () => { navigate("/hours-locations") }}>
              Hours & Locations
            </Button>
            <Button variant="text" size="large" endIcon={<ExpandMoreIcon />} onClick={ (e) => { setHelpAnchorEl(e.currentTarget) }}>
              Help
            </Button>
            <Button variant="contained" size="large" onClick={ (e) => { setLoginAnchorEl(e.currentTarget) } } sx={{ lineHeight: 'normal' }}>
              Log In
            </Button>
          </Box>
          {/* Help Popover */}
          <Popover
            open={ helpOpen }
            anchorEl={ helpAnchorEl }
            onClose={ () => { setHelpAnchorEl(null) }} 
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
                <Button size="small" onClick={ () => { navigate("/faqs") }}> {/* Navigates to FAQ page */}
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Popover>
          {/* Login Popover */}
          <Popover
            open={ loginOpen }
            anchorEl={ loginAnchorEl }
            onClose={() => { setLoginAnchorEl(null)} } 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Log In to Your Account
                </Typography>
                {/* Username input */}
                <TextField 
                  id="username" 
                  label="Username" 
                  variant="outlined" 
                  fullWidth size="small" 
                  sx={{ mt: 1, mb: 0.5 }} 
                  />
                {/* Password input */}
                <TextField 
                  id="password" 
                  label="Password" 
                  type="password" 
                  variant="outlined" 
                  fullWidth size="small" 
                  sx={{ mb: 0 }} 
                  />
              </CardContent>
              <CardActions sx={{ flexDirection: 'column', gap: 0.5, pt: 0 }}>
                <Button size="medium" variant="contained" fullWidth>
                  Log In
                </Button>
                <Button size="medium" variant="text" fullWidth onClick={ () => { navigate("/sign-up") }}>
                  Sign Up
                </Button>
              </CardActions>
            </Card>
          </Popover>
        </Toolbar>
      </AppBar>
      {/* Secondary header bar: search functionality */}
      <AppBar position="static" elevation={ 0 } sx={{ backgroundColor: 'white', height: 35 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {/* Search input field */}
          <TextField 
            id="filled-basic" 
            placeholder="Search Catalog" 
            variant="outlined" 
            onChange={ (event) => {
              setSearchQuery(event.target.value);
            }} 
            sx={{ width: 400, '& .MuiInputBase-root': { height: 36 } }}/>
          <IconButton 
            aria-label="search" 
            onClick={ async() => {
              console.log(searchQuery); 
              // when connected to backend will look like const result = await post('/searchBooks', searchQuery);
            }} 
            sx={{ backgroundColor: '#4E780C', borderRadius: 1}}>
            <SearchIcon sx={{ fontSize: 20, color: 'white' }}/>
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default Header

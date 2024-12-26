import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { Menu as MenuIcon, Dashboard as DashboardIcon, FitnessCenter as WorkoutIcon, SelfImprovement as MeditationIcon, Logout as LogoutIcon, RestaurantMenu as MealsIcon } from '@mui/icons-material';
import Image from 'next/image'; // Ensure this is correctly imported
// import { logo } from "../../public/logo.png";

const drawerWidth = 240;

const menuItems = [
  { text: 'Programs', icon: <DashboardIcon />, path: '/programs' },
  { text: 'Workouts', icon: <WorkoutIcon />, path: '/workouts' },
  { text: 'Meditations', icon: <MeditationIcon />, path: '/meditations' },
  { text: 'Meals', icon: <MealsIcon />, path: '/meals' }, //
];

// Separate component for the drawer content
const DrawerContent = ({ onItemClick, selectedPath }) => (
  <List>
    {menuItems.map((item) => (
      <ListItem
        button
        key={item.text}
        onClick={() => onItemClick(item.path)}
        selected={selectedPath === item.path}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItem>
    ))}
  </List>
);

// Separate component for the app bar
const AppBarComponent = ({ onMenuClick, onLogout }) => (
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={onMenuClick}
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <Image
          src="/logo2.png" // Updated to match the path in the public directory
          alt="FastFit Logo"
          width={200}  // Adjust as needed
          height={30}  // Adjust as needed
          style={{ marginRight: '10px' }}
        />
        {/* <Typography variant="h6" noWrap component="div">
          FASTfit Admin
        </Typography> */}
      </Box>
      <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
        Logout
      </Button>
    </Toolbar>
  </AppBar>
);

const Layout = ({ children }) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarComponent onMenuClick={handleDrawerToggle} onLogout={handleLogout} />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <DrawerContent onItemClick={handleNavigation} selectedPath={router.pathname} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <Toolbar />
          <DrawerContent onItemClick={handleNavigation} selectedPath={router.pathname} />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

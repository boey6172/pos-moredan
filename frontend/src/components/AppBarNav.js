import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'POS', path: '/pos' },
  { label: 'Products', path: '/products' },
  { label: 'Categories', path: '/categories' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Sales Items', path: '/sales-items' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Reports', path: '/reports' },
  { label: 'Users', path: '/users' },
];

const AppBarNav = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            POS System
          </Typography>
          <Button color="inherit" onClick={onLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 240 }}>
          {navLinks.map(link => (
            <ListItem button key={link.path} onClick={() => handleNav(link.path)}>
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default AppBarNav; 
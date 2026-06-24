import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logOut, selectCurrentUser } from '../redux/authSlice';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation
} from '../services/notificationApi';

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Paper,
  Button
} from '@mui/material';

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalHospital as LocalHospitalIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  AccountCircle as AccountCircleIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';

const drawerWidth = 260;

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);

  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // RTK Query Notifications
  const { data: notifData } = useGetNotificationsQuery(undefined, {
    skip: !user,
    pollingInterval: 15000 // Poll every 15s
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = notifData?.data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleLogoutClick = () => {
    dispatch(logOut());
    navigate('/login');
  };

  const handleNotificationClick = async (id) => {
    await markRead(id);
  };

  const handleMarkAllNotificationsRead = async () => {
    await markAllRead();
  };

  // Define sidebar menu items based on role
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'Admin':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
          { text: 'Doctors', icon: <LocalHospitalIcon />, path: '/admin/doctors' },
          { text: 'Patients', icon: <PeopleIcon />, path: '/admin/patients' },
          { text: 'Departments', icon: <CategoryIcon />, path: '/admin/departments' },
          { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' }
        ];
      case 'Doctor':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/doctor/dashboard' },
          { text: 'Working Schedule', icon: <EventNoteIcon />, path: '/doctor/availability' },
          { text: 'Appointments', icon: <AssignmentIcon />, path: '/doctor/appointments' },
          { text: 'Patients Log', icon: <PeopleIcon />, path: '/doctor/patients' },
          { text: 'My Profile', icon: <AccountCircleIcon />, path: '/doctor/profile' }
        ];
      case 'Patient':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/patient/dashboard' },
          { text: 'Search Doctors', icon: <SearchIcon />, path: '/patient/doctors' },
          { text: 'Appointments', icon: <CalendarMonthIcon />, path: '/patient/appointments' },
          { text: 'My Profile', icon: <AccountCircleIcon />, path: '/patient/profile' }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar (Header) */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
              })
          }),
          bgcolor: 'primary.main',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleToggleDrawer}
              edge="start"
              sx={{ marginRight: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              Gorantla's Hospital
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications Menu */}
            <IconButton color="inherit" onClick={handleOpenNotifMenu}>
              <Badge badgeContent={unreadCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              PaperProps={{
                sx: { width: 320, maxHeight: 400, mt: 1.5, borderRadius: 2 }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Button size="small" onClick={handleMarkAllNotificationsRead} sx={{ fontSize: '0.75rem', p: 0 }}>
                    Mark all read
                  </Button>
                )}
              </Box>
              <Divider />
              <List sx={{ p: 0 }}>
                {notifications.length === 0 ? (
                  <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No notifications found
                    </Typography>
                  </ListItem>
                ) : (
                  notifications.map((notif) => (
                    <ListItem
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif._id)}
                      sx={{
                        borderBottom: '1px solid #f1f5f9',
                        bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                        cursor: 'pointer',
                        display: 'block',
                        py: 1,
                        px: 2,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 500 : 700, fontSize: '0.85rem' }}>
                        {notif.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                        {notif.message}
                      </Typography>
                    </ListItem>
                  ))
                )}
              </List>
            </Menu>

            {/* User Profile Quick Menu */}
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.name} src={user?.profileImage || ''} sx={{ width: 40, height: 40, bgcolor: 'secondary.main', fontWeight: 'bold' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: { borderRadius: 2, width: 200 }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.role}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate(user.role === 'Admin' ? '/admin/dashboard' : `/${user.role.toLowerCase()}/profile`); }}>
                Profile Settings
              </MenuItem>
              <MenuItem onClick={handleLogoutClick}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 72,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
              }),
            overflowX: 'hidden',
            boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
            borderRight: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            ...(!open && {
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen
                })
            })
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 2, py: 2.2 }}>
          <IconButton onClick={handleToggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                    color: isActive ? '#ffffff' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.light' : 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? '#ffffff' : 'text.secondary'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                borderRadius: 2,
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.lighter'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main'
                }}
              >
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;

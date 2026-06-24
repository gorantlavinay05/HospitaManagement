import React, { useState, useMemo } from 'react';
import { useGetAdminStatsQuery, useGetActivityLogsQuery } from '../../services/adminApi';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';

import {
  People as PatientsIcon,
  LocalHospital as DoctorsIcon,
  CalendarMonth as AppointmentsIcon,
  PendingActions as PendingIcon,
  CheckCircle as CompleteIcon,
  VpnKey as VpnKeyIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#1a365d', '#0d9488', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

const CATEGORY_MAP = {
  'Authentication': { color: 'info', icon: <VpnKeyIcon sx={{ fontSize: 18 }} />, bg: 'rgba(2, 136, 209, 0.1)' },
  'Appointments': { color: 'success', icon: <CalendarIcon sx={{ fontSize: 18 }} />, bg: 'rgba(46, 125, 50, 0.1)' },
  'User Management': { color: 'warning', icon: <PeopleIcon sx={{ fontSize: 18 }} />, bg: 'rgba(237, 108, 2, 0.1)' },
  'Departments': { color: 'secondary', icon: <CategoryIcon sx={{ fontSize: 18 }} />, bg: 'rgba(156, 39, 176, 0.1)' },
  'System': { color: 'default', icon: <SettingsIcon sx={{ fontSize: 18 }} />, bg: 'rgba(0, 0, 0, 0.05)' }
};

const AdminDashboard = () => {
  // Logs dialog and filters state
  const [openLogsModal, setOpenLogsModal] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logCategory, setLogCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Lazy query: only fetch activity logs when dialog is open
  const { data: logsData, isLoading: logsLoading } = useGetActivityLogsQuery(undefined, {
    skip: !openLogsModal
  });

  const { data, isLoading, error } = useGetAdminStatsQuery(undefined, {
    pollingInterval: 30000 // Refresh stats every 30s
  });

  const fullLogs = logsData?.data?.logs || [];

  const filteredLogs = useMemo(() => {
    return fullLogs.filter(log => {
      if (log.category === 'Authentication') {
        return false;
      }
      if (logCategory !== 'ALL' && log.category !== logCategory) {
        return false;
      }
      if (logSearch) {
        const query = logSearch.toLowerCase();
        const userName = log.userId?.name?.toLowerCase() || '';
        const userEmail = log.userId?.email?.toLowerCase() || '';
        const userRole = log.userId?.role?.toLowerCase() || '';
        const actionDesc = log.action?.toLowerCase() || '';
        return userName.includes(query) || userEmail.includes(query) || userRole.includes(query) || actionDesc.includes(query);
      }
      return true;
    });
  }, [fullLogs, logSearch, logCategory]);

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error" variant="h6">Failed to load admin dashboard statistics.</Typography>
      </Box>
    );
  }

  const { counts, departmentStats, monthlyStats, recentActivities } = data.data.stats;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const cardData = [
    { title: 'Total Patients', value: counts.patients, icon: <PatientsIcon sx={{ fontSize: 36, color: '#3b82f6' }} />, bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Total Doctors', value: counts.doctors, icon: <DoctorsIcon sx={{ fontSize: 36, color: '#0d9488' }} />, bg: 'rgba(13, 148, 136, 0.1)' },
    { title: 'Total Appointments', value: counts.appointments, icon: <AppointmentsIcon sx={{ fontSize: 36, color: '#1a365d' }} />, bg: 'rgba(26, 54, 93, 0.1)' },
    { title: 'Pending Bookings', value: counts.pending, icon: <PendingIcon sx={{ fontSize: 36, color: '#f59e0b' }} />, bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Completed Sessions', value: counts.completed, icon: <CompleteIcon sx={{ fontSize: 36, color: '#10b981' }} />, bg: 'rgba(16, 185, 129, 0.1)' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h2" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cardData.map((card, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: card.bg, display: 'flex' }}>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Appointment Trends */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
              Appointment Booking Trends ({new Date().getFullYear()})
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} stroke="#64748b" />
                  <YAxis tickLine={false} axisLine={false} stroke="#64748b" />
                  <ChartTooltip cursor={{ fill: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="appointments" name="Appointments booked" fill="#1a365d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Doctor Department Breakdown */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
              Doctor Distribution by Dept
            </Typography>
            <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={departmentStats}
                    dataKey="doctorsCount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip formatter={(value) => [`${value} Doctors`, 'Staff count']} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Audit Trails / Recent Activity Logs */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon /> Recent Activity Audit Trail
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small" 
            onClick={() => setOpenLogsModal(true)}
            sx={{ fontWeight: 600 }}
          >
            View Full Audit Trail
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ p: 0 }}>
          {recentActivities.length === 0 ? (
            <ListItem sx={{ py: 2 }}>
              <ListItemText primary="No activities logged yet." />
            </ListItem>
          ) : (
            recentActivities.map((log) => {
              const categoryConfig = CATEGORY_MAP[log.category] || { color: 'default', icon: <SettingsIcon />, bg: 'rgba(0, 0, 0, 0.05)' };
              return (
                <React.Fragment key={log._id}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <Box sx={{ mr: 2, p: 1, borderRadius: '50%', bgcolor: categoryConfig.bg, color: `${categoryConfig.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {categoryConfig.icon}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{log.action}</Typography>
                          <Chip 
                            size="small" 
                            label={log.category || 'System'} 
                            color={categoryConfig.color} 
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body2" component="span" sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
                            Performed by: <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>{log.userId?.name || 'Unknown'}</Box> ({log.userId?.role || 'User'})
                          </Typography>
                          <Typography variant="body2" component="span" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })
          )}
        </List>
      </Paper>

      {/* Full Audit Logs Dialog */}
      <Dialog 
        open={openLogsModal} 
        onClose={() => setOpenLogsModal(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Audit Logs Manager</Typography>
          </Box>
          <IconButton onClick={() => setOpenLogsModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {/* Filters Bar */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              placeholder="Search by user, email, or action description..."
              value={logSearch}
              onChange={(e) => { setLogSearch(e.target.value); setPage(0); }}
              size="small"
              sx={{ flexGrow: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
              }}
            />
            
            <TextField
              select
              label="Event Category"
              value={logCategory}
              onChange={(e) => { setLogCategory(e.target.value); setPage(0); }}
              size="small"
              sx={{ width: 200 }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="Appointments">Appointments</MenuItem>
              <MenuItem value="User Management">User Management</MenuItem>
              <MenuItem value="Departments">Departments</MenuItem>
              <MenuItem value="System">System</MenuItem>
            </TextField>
          </Box>

          {/* Table of logs */}
          {logsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Action Performed</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        No audit logs found matching the filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLogs.map((log) => {
                      const config = CATEGORY_MAP[log.category] || { color: 'default', bg: 'rgba(0,0,0,0.05)' };
                      return (
                        <TableRow key={log._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={log.category || 'System'}
                              color={config.color}
                              sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {log.action}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {log.userId?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.userId?.email || ''}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'primary.main' }}>
                            {log.userId?.role || 'User'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {!logsLoading && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: 'none', mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenLogsModal(false)} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
            Close Log Manager
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;

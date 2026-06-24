import React, { useState } from 'react';
import { useGetDepartmentsQuery, useCreateDepartmentMutation, useUpdateDepartmentMutation, useDeleteDepartmentMutation } from '../../services/departmentApi';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const DepartmentsManagement = () => {
  const { data, isLoading } = useGetDepartmentsQuery();
  const [createDept, { isLoading: createLoading }] = useCreateDepartmentMutation();
  const [updateDept, { isLoading: updateLoading }] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const departmentsList = data?.data?.departments || [];

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedId(null);
    setName('');
    setDescription('');
    setErrorMsg('');
    setOpenModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditMode(true);
    setSelectedId(dept._id);
    setName(dept.name);
    setDescription(dept.description);
    setErrorMsg('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !description) {
      setErrorMsg('Please complete all fields');
      return;
    }

    try {
      if (editMode) {
        await updateDept({ id: selectedId, name, description }).unwrap();
      } else {
        await createDept({ name, description }).unwrap();
      }
      setOpenModal(false);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Error saving department details.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      await deleteDept(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Department Management</Typography>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create Department
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departmentsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    No departments created.
                  </TableCell>
                </TableRow>
              ) : (
                departmentsList.map((dept) => (
                  <TableRow key={dept._id}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {dept.name}
                    </TableCell>
                    <TableCell>{dept.description}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(dept)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(dept._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* dialog modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editMode ? 'Edit Department' : 'Create Department'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
            <TextField
              fullWidth
              label="Department Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="secondary" disabled={createLoading || updateLoading}>
              {(createLoading || updateLoading) ? <CircularProgress size={24} /> : 'Save Department'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DepartmentsManagement;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TableSkeleton from '../components/TableSkeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import axios from '../api/axios';

const formatCurrency = (amount) =>
  `₱${(parseFloat(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Salaries = () => {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [filterEndDate, setFilterEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [employeeEdit, setEmployeeEdit] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({ name: '', ratePerHour: '' });
  const [employeeSaving, setEmployeeSaving] = useState(false);
  const [employeeDeleting, setEmployeeDeleting] = useState(null);

  const [salaryOpen, setSalaryOpen] = useState(false);
  const [salaryEdit, setSalaryEdit] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    hoursWorked: '',
    startDate: filterStartDate,
    endDate: filterEndDate,
  });
  const [salarySaving, setSalarySaving] = useState(false);
  const [salaryDeleting, setSalaryDeleting] = useState(null);
  const [employeesExpanded, setEmployeesExpanded] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const params = { startDate: filterStartDate, endDate: filterEndDate };
      const res = await axios.get('/api/salaries', { params });
      setSalaries(res.data || []);
    } catch (err) {
      console.error('Error fetching salaries:', err);
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [filterStartDate, filterEndDate]);

  const totalSalary = salaries.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0);

  const selectedEmployee = employees.find((e) => e.id === Number(salaryForm.employeeId));
  const computedTotal =
    selectedEmployee && salaryForm.hoursWorked
      ? (parseFloat(selectedEmployee.ratePerHour) * parseFloat(salaryForm.hoursWorked)).toFixed(2)
      : '';

  const handleOpenEmployee = (emp = null) => {
    setEmployeeEdit(emp);
    setEmployeeForm(emp ? { name: emp.name, ratePerHour: emp.ratePerHour.toString() } : { name: '', ratePerHour: '' });
    setEmployeeOpen(true);
  };

  const handleCloseEmployee = () => {
    setEmployeeOpen(false);
    setEmployeeEdit(null);
    setEmployeeForm({ name: '', ratePerHour: '' });
  };

  const handleSaveEmployee = async () => {
    if (employeeSaving) return;
    if (!employeeForm.name.trim()) {
      alert('Employee name is required.');
      return;
    }
    const rate = parseFloat(employeeForm.ratePerHour);
    if (isNaN(rate) || rate < 0) {
      alert('Valid rate per hour is required.');
      return;
    }
    setEmployeeSaving(true);
    try {
      if (employeeEdit) {
        await axios.put(`/api/employees/${employeeEdit.id}`, {
          name: employeeForm.name.trim(),
          ratePerHour: rate,
        });
      } else {
        await axios.post('/api/employees', {
          name: employeeForm.name.trim(),
          ratePerHour: rate,
        });
      }
      fetchEmployees();
      handleCloseEmployee();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving employee');
    } finally {
      setEmployeeSaving(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (employeeDeleting === id) return;
    if (!window.confirm('Delete this employee? Salary records will remain but the employee cannot be selected for new entries.')) return;
    setEmployeeDeleting(id);
    try {
      await axios.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting employee');
    } finally {
      setEmployeeDeleting(null);
    }
  };

  const handleOpenSalary = (entry = null) => {
    setSalaryEdit(entry);
    if (entry) {
      setSalaryForm({
        employeeId: entry.employeeId.toString(),
        hoursWorked: entry.hoursWorked.toString(),
        startDate: entry.startDate,
        endDate: entry.endDate,
      });
    } else {
      setSalaryForm({
        employeeId: '',
        hoursWorked: '',
        startDate: filterStartDate,
        endDate: filterEndDate,
      });
    }
    setSalaryOpen(true);
  };

  const handleCloseSalary = () => {
    setSalaryOpen(false);
    setSalaryEdit(null);
    setSalaryForm({ employeeId: '', hoursWorked: '', startDate: filterStartDate, endDate: filterEndDate });
  };

  const handleSaveSalary = async () => {
    if (salarySaving) return;
    if (!salaryForm.employeeId) {
      alert('Please select an employee.');
      return;
    }
    const hours = parseFloat(salaryForm.hoursWorked);
    if (isNaN(hours) || hours <= 0) {
      alert('Valid hours worked is required.');
      return;
    }
    if (!salaryForm.startDate || !salaryForm.endDate) {
      alert('Start date and end date are required.');
      return;
    }
    setSalarySaving(true);
    try {
      const payload = {
        employeeId: Number(salaryForm.employeeId),
        hoursWorked: hours,
        startDate: salaryForm.startDate,
        endDate: salaryForm.endDate,
      };
      if (salaryEdit) {
        await axios.put(`/api/salaries/${salaryEdit.id}`, payload);
      } else {
        await axios.post('/api/salaries', payload);
      }
      fetchSalaries();
      handleCloseSalary();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving salary');
    } finally {
      setSalarySaving(false);
    }
  };

  const handleDeleteSalary = async (id) => {
    if (salaryDeleting === id) return;
    if (!window.confirm('Delete this salary entry?')) return;
    setSalaryDeleting(id);
    try {
      await axios.delete(`/api/salaries/${id}`);
      fetchSalaries();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting salary');
    } finally {
      setSalaryDeleting(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Salary
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 1, '&:last-child': { pb: 2 } }}>
          <Box
            onClick={() => setEmployeesExpanded((e) => !e)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              py: 1.5,
              '&:hover': { bgcolor: 'action.hover' },
              borderRadius: 1,
              px: 0.5,
              mx: -0.5,
            }}
            aria-expanded={employeesExpanded}
          >
            <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon /> Employees
              {employees.length > 0 && (
                <Chip label={employees.length} size="small" sx={{ ml: 0.5 }} />
              )}
            </Typography>
            <IconButton size="small" aria-label={employeesExpanded ? 'Collapse employees' : 'Expand employees'}>
              {employeesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={employeesExpanded}>
            <Box onClick={(e) => e.stopPropagation()}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add employees with name and rate per hour. They can then be selected when recording salary.
              </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenEmployee()} sx={{ mb: 2 }}>
              Add Employee
            </Button>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Rate per hour</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography color="text.secondary">No employees yet. Add one to get started.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>{formatCurrency(emp.ratePerHour)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenEmployee(emp)} aria-label={`Edit ${emp.name}`}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEmployee(emp.id)}
                            disabled={employeeDeleting === emp.id}
                            aria-label={`Delete ${emp.name}`}
                          >
                            {employeeDeleting === emp.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
            <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon /> Salary entries
            </Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                type="date"
                label="Start date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="date"
                label="End date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenSalary()} disabled={employees.length === 0}>
                Add Salary
              </Button>
            </Box>
          </Box>

          {salaries.length > 0 && (
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Total (filtered): <strong>{formatCurrency(totalSalary)}</strong>
            </Typography>
          )}

          {loading ? (
            <TableSkeleton rows={5} columns={8} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Start date</TableCell>
                    <TableCell>End date</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Rate/hour</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Created by</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaries.length > 0 ? (
                    salaries.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>{s.startDate}</TableCell>
                        <TableCell>{s.endDate}</TableCell>
                        <TableCell>
                          <Chip label={s.employee?.name || '—'} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{formatCurrency(s.employee?.ratePerHour)}</TableCell>
                        <TableCell align="right">{parseFloat(s.hoursWorked)}</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(s.totalAmount)}</strong>
                        </TableCell>
                        <TableCell>{s.creator?.username || '—'}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenSalary(s)} aria-label={`Edit salary ${s.id}`}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSalary(s.id)}
                            disabled={salaryDeleting === s.id}
                            aria-label={`Delete salary ${s.id}`}
                          >
                            {salaryDeleting === s.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" py={2}>
                          No salary entries in this date range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={employeeOpen} onClose={handleCloseEmployee} maxWidth="xs" fullWidth>
        <DialogTitle>{employeeEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={employeeForm.name}
            onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
            fullWidth
            margin="normal"
            required
            placeholder="Employee name"
          />
          <TextField
            label="Rate per hour (₱)"
            type="number"
            value={employeeForm.ratePerHour}
            onChange={(e) => setEmployeeForm({ ...employeeForm, ratePerHour: e.target.value })}
            fullWidth
            margin="normal"
            required
            inputProps={{ step: '0.01', min: '0' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmployee} disabled={employeeSaving}>Cancel</Button>
          <Button
            onClick={handleSaveEmployee}
            variant="contained"
            disabled={!employeeForm.name.trim() || employeeForm.ratePerHour === '' || employeeSaving}
          >
            {employeeSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={salaryOpen} onClose={handleCloseSalary} maxWidth="sm" fullWidth>
        <DialogTitle>{salaryEdit ? 'Edit Salary Entry' : 'Add Salary Entry'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Employee"
            value={salaryForm.employeeId}
            onChange={(e) => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
            fullWidth
            margin="normal"
            required
            SelectProps={{ native: true }}
          >
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {formatCurrency(e.ratePerHour)}/hr
              </option>
            ))}
          </TextField>
          <TextField
            label="Hours worked"
            type="number"
            value={salaryForm.hoursWorked}
            onChange={(e) => setSalaryForm({ ...salaryForm, hoursWorked: e.target.value })}
            fullWidth
            margin="normal"
            required
            inputProps={{ step: '0.01', min: '0.01' }}
          />
          <TextField
            type="date"
            label="Start date"
            value={salaryForm.startDate}
            onChange={(e) => setSalaryForm({ ...salaryForm, startDate: e.target.value })}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="End date"
            value={salaryForm.endDate}
            onChange={(e) => setSalaryForm({ ...salaryForm, endDate: e.target.value })}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          {computedTotal !== '' && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Total salary: <strong>{formatCurrency(computedTotal)}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSalary} disabled={salarySaving}>Cancel</Button>
          <Button
            onClick={handleSaveSalary}
            variant="contained"
            disabled={
              !salaryForm.employeeId ||
              !salaryForm.hoursWorked ||
              parseFloat(salaryForm.hoursWorked) <= 0 ||
              !salaryForm.startDate ||
              !salaryForm.endDate ||
              salarySaving
            }
          >
            {salarySaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Salaries;

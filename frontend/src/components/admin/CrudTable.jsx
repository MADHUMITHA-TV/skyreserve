import { useState } from "react";
import toast from "react-hot-toast";

import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import { getApiErrorMessage } from "../../api/axios";

const emptyValuesFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

// A small generic CRUD table + dialog form, reused across every admin
// entity (airlines, airports, aircraft, flights, users). Each entity
// screen just supplies its own column/field config and service calls.
export default function CrudTable({
  title,
  columns,
  rows,
  loading,
  fields = [],
  onCreate,
  onUpdate,
  onDelete,
  getRowId = (row) => row.id,
  allowCreate = true,
  allowDelete = true,
  emptyMessage = "No records found.",
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditingRow(null);
    setValues(emptyValuesFromFields(fields));
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    const initial = {};
    fields.forEach((f) => {
      initial[f.name] = f.getValue ? f.getValue(row) : row[f.name] ?? "";
    });
    setValues(initial);
    setDialogOpen(true);
  };

  const handleChange = (name) => (e) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleSave = async () => {
    for (const field of fields) {
      if (field.required && !values[field.name] && values[field.name] !== 0) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {};
      fields.forEach((f) => {
        payload[f.name] = f.parse ? f.parse(values[f.name]) : values[f.name];
      });

      if (editingRow) {
        await onUpdate(getRowId(editingRow), payload);
        toast.success(`${title} updated`);
      } else {
        await onCreate(payload);
        toast.success(`${title} created`);
      }

      setDialogOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to save changes."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await onDelete(getRowId(deleteTarget));
      toast.success(`${title} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to delete."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>

        {allowCreate && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
          >
            Add {title}
          </Button>
        )}
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Alert severity="info">{emptyMessage}</Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.label}</TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={getRowId(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}

                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(row)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>

                    {allowDelete && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingRow ? `Edit ${title}` : `Add ${title}`}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                select={field.type === "select"}
                fullWidth
                type={field.type === "select" ? "text" : field.type || "text"}
                label={field.label}
                value={values[field.name] ?? ""}
                onChange={handleChange(field.name)}
                InputLabelProps={
                  field.type === "datetime-local" ? { shrink: true } : undefined
                }
                disabled={field.disabled}
              >
                {field.type === "select" &&
                  (field.options || []).map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
              </TextField>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete {title}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {title.toLowerCase()}? This
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

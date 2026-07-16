import { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import toast from "react-hot-toast";

import CrudTable from "../../../components/admin/CrudTable";
import { getAllUsers, updateUserRole } from "../../../services/adminService";
import { getApiErrorMessage } from "../../../api/axios";
import { formatDate } from "../../../utils/format";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CrudTable
      title="User"
      loading={loading}
      rows={users}
      allowCreate={false}
      allowDelete={false}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (row) => `${row.firstName} ${row.lastName}`,
        },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone", render: (row) => row.phone || "-" },
        {
          key: "role",
          label: "Role",
          render: (row) => (
            <Chip
              size="small"
              label={row.role}
              color={row.role === "ADMIN" ? "primary" : "default"}
            />
          ),
        },
        { key: "status", label: "Status", render: (row) => row.status || "-" },
        {
          key: "createdAt",
          label: "Joined",
          render: (row) => formatDate(row.createdAt),
        },
      ]}
      fields={[
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          options: [
            { value: "USER", label: "USER" },
            { value: "ADMIN", label: "ADMIN" },
          ],
        },
      ]}
      onUpdate={async (id, payload) => {
        await updateUserRole(id, payload.role);
        load();
      }}
    />
  );
}

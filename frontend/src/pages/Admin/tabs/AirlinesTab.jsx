import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import CrudTable from "../../../components/admin/CrudTable";
import {
  getAirlines,
  createAirline,
  updateAirline,
  deleteAirline,
} from "../../../services/airlineService";
import { getApiErrorMessage } from "../../../api/axios";

export default function AirlinesTab() {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAirlines();
      setAirlines(data || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to load airlines."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CrudTable
      title="Airline"
      loading={loading}
      rows={airlines}
      columns={[
        { key: "name", label: "Name" },
        { key: "code", label: "Code" },
      ]}
      fields={[
        { name: "name", label: "Airline Name", required: true },
        { name: "code", label: "Code (2-10 chars)", required: true },
      ]}
      onCreate={async (payload) => {
        await createAirline(payload);
        load();
      }}
      onUpdate={async (id, payload) => {
        await updateAirline(id, payload);
        load();
      }}
      onDelete={async (id) => {
        await deleteAirline(id);
        load();
      }}
    />
  );
}

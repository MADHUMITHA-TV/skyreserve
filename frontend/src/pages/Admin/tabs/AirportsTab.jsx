import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import CrudTable from "../../../components/admin/CrudTable";
import {
  getAirports,
  createAirport,
  updateAirport,
  deleteAirport,
} from "../../../services/airportService";
import { getApiErrorMessage } from "../../../api/axios";

export default function AirportsTab() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAirports();
      setAirports(data || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to load airports."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CrudTable
      title="Airport"
      loading={loading}
      rows={airports}
      columns={[
        { key: "name", label: "Name" },
        { key: "code", label: "Code" },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
      ]}
      fields={[
        { name: "name", label: "Airport Name", required: true },
        { name: "code", label: "Code (3-10 chars)", required: true },
        { name: "city", label: "City", required: true },
        { name: "country", label: "Country", required: true },
      ]}
      onCreate={async (payload) => {
        await createAirport(payload);
        load();
      }}
      onUpdate={async (id, payload) => {
        await updateAirport(id, payload);
        load();
      }}
      onDelete={async (id) => {
        await deleteAirport(id);
        load();
      }}
    />
  );
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import CrudTable from "../../../components/admin/CrudTable";
import {
  getAircrafts,
  createAircraft,
  updateAircraft,
  deleteAircraft,
} from "../../../services/aircraftService";
import { getAirlines } from "../../../services/airlineService";
import { getApiErrorMessage } from "../../../api/axios";

export default function AircraftTab() {
  const [aircrafts, setAircrafts] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [aircraftData, airlineData] = await Promise.all([
        getAircrafts(),
        getAirlines(),
      ]);
      setAircrafts(aircraftData || []);
      setAirlines(airlineData || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to load aircraft."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const airlineOptions = airlines.map((a) => ({ value: a.id, label: a.name }));
  const airlineName = (id) => airlines.find((a) => a.id === id)?.name || id;

  return (
    <CrudTable
      title="Aircraft"
      loading={loading}
      rows={aircrafts}
      columns={[
        { key: "model", label: "Model" },
        { key: "registrationNumber", label: "Registration" },
        { key: "totalSeats", label: "Total Seats" },
        {
          key: "airlineId",
          label: "Airline",
          render: (row) => row.airline?.name || airlineName(row.airlineId),
        },
      ]}
      fields={[
        { name: "model", label: "Model", required: true },
        {
          name: "registrationNumber",
          label: "Registration Number",
          required: true,
        },
        {
          name: "totalSeats",
          label: "Total Seats",
          type: "number",
          required: true,
          parse: (v) => Number(v),
        },
        {
          name: "airlineId",
          label: "Airline",
          type: "select",
          required: true,
          options: airlineOptions,
        },
      ]}
      onCreate={async (payload) => {
        await createAircraft(payload);
        load();
      }}
      onUpdate={async (id, payload) => {
        await updateAircraft(id, payload);
        load();
      }}
      onDelete={async (id) => {
        await deleteAircraft(id);
        load();
      }}
    />
  );
}

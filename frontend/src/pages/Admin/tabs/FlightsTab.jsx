import { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import toast from "react-hot-toast";

import CrudTable from "../../../components/admin/CrudTable";
import {
  getFlights,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../../../services/flightService";
import { getAirlines } from "../../../services/airlineService";
import { getAircrafts } from "../../../services/aircraftService";
import { getAirports } from "../../../services/airportService";
import { getApiErrorMessage } from "../../../api/axios";
import { formatDateTime } from "../../../utils/format";

// datetime-local inputs need "YYYY-MM-DDTHH:mm"; the API gives back full
// ISO strings, so we trim them for editing and re-expand on save.
const toDatetimeLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
const toIso = (local) => (local ? new Date(local).toISOString() : "");

export default function FlightsTab() {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [flightData, airlineData, aircraftData, airportData] =
        await Promise.all([
          getFlights(),
          getAirlines(),
          getAircrafts(),
          getAirports(),
        ]);

      setFlights(flightData || []);
      setAirlines(airlineData || []);
      setAircrafts(aircraftData || []);
      setAirports(airportData || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to load flights."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const airlineOptions = airlines.map((a) => ({ value: a.id, label: a.name }));
  const aircraftOptions = aircrafts.map((a) => ({
    value: a.id,
    label: `${a.model} (${a.registrationNumber})`,
  }));
  const airportOptions = airports.map((a) => ({
    value: a.id,
    label: `${a.city} (${a.code})`,
  }));

  return (
    <CrudTable
      title="Flight"
      loading={loading}
      rows={flights}
      columns={[
        { key: "flightNumber", label: "Flight #" },
        { key: "airline", label: "Airline", render: (row) => row.airline?.name },
        {
          key: "route",
          label: "Route",
          render: (row) =>
            `${row.departureAirport?.code} → ${row.arrivalAirport?.code}`,
        },
        {
          key: "departureTime",
          label: "Departure",
          render: (row) => formatDateTime(row.departureTime),
        },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <Chip
              size="small"
              label={row.status || "SCHEDULED"}
              color={row.status === "CANCELLED" ? "error" : "success"}
            />
          ),
        },
      ]}
      fields={[
        { name: "flightNumber", label: "Flight Number", required: true },
        {
          name: "airlineId",
          label: "Airline",
          type: "select",
          required: true,
          options: airlineOptions,
        },
        {
          name: "aircraftId",
          label: "Aircraft",
          type: "select",
          required: true,
          options: aircraftOptions,
        },
        {
          name: "departureAirportId",
          label: "Departure Airport",
          type: "select",
          required: true,
          options: airportOptions,
        },
        {
          name: "arrivalAirportId",
          label: "Arrival Airport",
          type: "select",
          required: true,
          options: airportOptions,
        },
        {
          name: "departureTime",
          label: "Departure Time",
          type: "datetime-local",
          required: true,
          getValue: (row) => toDatetimeLocal(row.departureTime),
          parse: toIso,
        },
        {
          name: "arrivalTime",
          label: "Arrival Time",
          type: "datetime-local",
          required: true,
          getValue: (row) => toDatetimeLocal(row.arrivalTime),
          parse: toIso,
        },
        // Only SCHEDULED/CANCELLED are confirmed against the backend (the
        // booking service explicitly checks for "CANCELLED"). If your
        // Prisma schema defines more statuses, add them here.
        {
          name: "status",
          label: "Status",
          type: "select",
          default: "SCHEDULED",
          getValue: (row) => row.status || "SCHEDULED",
          options: [
            { value: "SCHEDULED", label: "SCHEDULED" },
            { value: "CANCELLED", label: "CANCELLED" },
          ],
        },
      ]}
      onCreate={async (payload) => {
        await createFlight(payload);
        load();
      }}
      onUpdate={async (id, payload) => {
        await updateFlight(id, payload);
        load();
      }}
      onDelete={async (id) => {
        await deleteFlight(id);
        load();
      }}
    />
  );
}

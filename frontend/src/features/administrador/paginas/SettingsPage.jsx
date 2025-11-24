import { useState, useEffect } from "react";
import {
  ClockIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import configuracionService from "../../../servicios/servicioConfiguracion";

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    horario_inicio: "08:00",
    horario_fin: "17:00",
    dias_laborales: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    zona_horaria: "America/Bogota",
    recordatorio_24h_antes: true,
    recordatorio_1h_antes: true,
  // SettingsPage eliminada: archivo convertido en stub vacío para evitar errores de importación.
  // Si deseas eliminarlo por completo, puedo borrarlo definitivamente.

  export default null;
    "Martes",

    "Miércoles",

    "Jueves",

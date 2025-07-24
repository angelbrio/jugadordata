import React from "react";
import { useLocation } from "react-router-dom";
import PorteroDashboard from "./PorteroDashboard";

function PorteroDashboardWrapper() {
  const { state } = useLocation();
  const portero = state?.portero || null;
  return <PorteroDashboard portero={portero} />;
}

export default PorteroDashboardWrapper;

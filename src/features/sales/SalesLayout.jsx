import React from "react";
import SalesManagerDashboard from "./SalesManagerDashboard";
import FinanceQueueDashboard from "./FinanceQueueDashboard";

export default function SalesLayout({ userRole }) {
  if (userRole === "Finance") {
    return <FinanceQueueDashboard />;
  }
  return <SalesManagerDashboard />;
}

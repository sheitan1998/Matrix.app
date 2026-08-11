import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PWAInstallStats() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    base44.entities.PWAInstallations.list()
      .then((records) => setCount(records.length))
      .catch(() => setCount(0));
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-card border border-border">
      <Download className="w-5 h-5 text-primary" />
      <p className="text-2xl font-black font-mono mt-3">{count ?? "..."}</p>
      <p className="text-xs text-muted-foreground mt-1">Téléchargements PWA</p>
    </div>
  );
}
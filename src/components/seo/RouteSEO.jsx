import { useLocation } from "react-router-dom";
import usePageSEO from "@/hooks/usePageSEO";
import { resolveSeo } from "@/lib/seoRoutes";

/**
 * RouteSEO — applique les métadonnées par défaut de la route courante.
 * Les pages qui appellent usePageSEO elles-mêmes prennent le dessus.
 */
export default function RouteSEO() {
  const { pathname } = useLocation();
  usePageSEO(resolveSeo(pathname));
  return null;
}
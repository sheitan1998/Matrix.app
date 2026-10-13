import React from "react";
import { useParams, Navigate } from "react-router-dom";

/**
 * Redirects from an old URL pattern to a new one, preserving the dynamic param.
 * Usage: <Route path="/old/:slug" element={<ParamRedirect to="/new" param="slug" />} />
 */
export default function ParamRedirect({ to, param = "slug" }) {
  const params = useParams();
  const value = params[param] || "";
  return <Navigate to={`${to}/${value}`} replace />;
}
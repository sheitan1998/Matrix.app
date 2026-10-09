import { base44 } from "@/api/base44Client";

/** Calls the Nexus execution engine and surfaces the server's refusal reason as the error message. */
export async function callNexusEngine(action, payload = {}) {
  try {
    const res = await base44.functions.invoke("nexusEngine", { action, ...payload });
    return res.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err?.message || "Action refusée");
  }
}
import { notFound } from "next/navigation";
import { requireCareersAdmin } from "@/lib/careers-admin";
import CareersManager from "./CareersManager";
export const dynamic="force-dynamic";
export default async function CareersAdminPage(){if(!(await requireCareersAdmin()))notFound();return <section className="space-y-5"><div><h1 className="text-2xl font-bold text-slate-900">Careers</h1><p className="text-sm text-slate-500">Open or close roles and export stored applications.</p></div><CareersManager/></section>}

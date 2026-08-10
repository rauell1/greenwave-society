import { getDb } from "@/lib/db";

// Placeholder for auth import based on project structure
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata = {
  title: "Consent Manager | Admin",
};

export default async function ConsentManagerPage() {
  // 1. Role-Based Access Control
  // Replace with actual session checking logic based on "Neon or custom auth"
  /*
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect("/admin/login");
  }
  */

  const db = getDb();

  // 2. Fetch configurations
  const config = await db.consentBannerConfig.findUnique({
    where: { id: "default" },
  });

  // 3. Fetch Consent Logs
  const logs = await db.consentLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // 4. Fetch Stats
  const total = await db.consentLog.count();
  const optIn = await db.consentLog.count({ where: { consentType: "opt-in" } });
  const optOut = await db.consentLog.count({ where: { consentType: "opt-out" } });
  const custom = await db.consentLog.count({ where: { consentType: "customized" } });

  const optInRate = total > 0 ? ((optIn / total) * 100).toFixed(1) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consent & Privacy Manager</h1>
          <p className="text-gray-500 mt-1">Manage cookie preferences, view consent logs, and ensure GDPR/CCPA compliance.</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
          Export Logs (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Consents</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Opt-In Rate</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{optInRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Full Opt-Out</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{optOut}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customized</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{custom}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Consent Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Location</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">IP Hash (Anon)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {log.countryCode || "Unknown"}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${log.consentType === 'opt-in' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${log.consentType === 'opt-out' ? 'bg-red-100 text-red-800' : ''}
                          ${log.consentType === 'customized' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {log.consentType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs truncate max-w-[150px]">
                        {log.ipHash}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" defaultValue={config?.themeColor || "#166534"} className="h-8 w-8 rounded cursor-pointer" />
                  <span className="text-sm font-mono text-gray-500">{config?.themeColor || "#166534"}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Layout Style</label>
                <select className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border" defaultValue={config?.layout || "bottom-bar"}>
                  <option value="bottom-bar">Bottom Bar</option>
                  <option value="modal">Centered Modal</option>
                  <option value="popup-card">Floating Card</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Geo-Targeting (GDPR/CCPA)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={config?.geoTargeting} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Auto-Block Scripts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={config?.autoBlock} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <button className="w-full mt-4 bg-gray-900 text-white font-medium py-2 rounded-lg hover:bg-gray-800 transition">
                Save Configuration
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Automated Scanner</h2>
            <p className="text-sm text-gray-500 mb-4">Run a headless scan to detect unclassified first and third-party trackers on your site.</p>
            <button className="w-full bg-blue-50 text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-100 transition border border-blue-200">
              Run Cookie Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

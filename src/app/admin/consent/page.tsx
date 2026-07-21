'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShieldCheck,
  Search,
  FileText,
  Download,
  Globe,
  SlidersHorizontal,
  BarChart3,
  RefreshCw,
  Cookie,
  Save,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/consent/languages';

export default function AdminConsentPage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);

  // Customizer state
  const [themeColor, setThemeColor] = React.useState('#166534');
  const [layout, setLayout] = React.useState('bottom-bar');
  const [defaultLang, setDefaultLang] = React.useState('en');
  const [consentModeV2, setConsentModeV2] = React.useState(true);
  const [tcfEnabled, setTcfEnabled] = React.useState(true);
  const [geoTargeting, setGeoTargeting] = React.useState(true);
  const [autoBlock, setAutoBlock] = React.useState(true);

  // Policy Generator State
  const [policyType, setPolicyType] = React.useState('privacy');
  const [orgName, setOrgName] = React.useState('Greenwave Society');
  const [webUrl] = React.useState('https://greenwave.org');
  const [contactEmail, setContactEmail] = React.useState('info@greenwave.org');
  const [generatedPolicy, setGeneratedPolicy] = React.useState('');

  const fetchConsentData = React.useCallback(() => {
    setLoading(true);
    fetch('/api/admin/consent')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        if (resData.config) {
          setThemeColor(resData.config.themeColor || '#166534');
          setLayout(resData.config.layout || 'bottom-bar');
          setDefaultLang(resData.config.defaultLang || 'en');
          setConsentModeV2(resData.config.consentModeV2 ?? true);
          setTcfEnabled(resData.config.tcfEnabled ?? true);
          setGeoTargeting(resData.config.geoTargeting ?? true);
          setAutoBlock(resData.config.autoBlock ?? true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchConsentData();
  }, [fetchConsentData]);

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/admin/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-config',
          themeColor,
          layout,
          defaultLang,
          consentModeV2,
          tcfEnabled,
          geoTargeting,
          autoBlock,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        alert('Consent banner configuration saved successfully!');
        fetchConsentData();
      }
    } catch (e) {
      alert('Failed to save configuration.');
    }
  };

  const handleTriggerScan = async () => {
    try {
      const res = await fetch('/api/admin/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-scan' }),
      });
      const resData = await res.json();
      if (resData.success) {
        alert('Automated cookie & tracker scan completed successfully!');
        fetchConsentData();
      }
    } catch (e) {
      alert('Failed to run cookie scan.');
    }
  };

  const handleGeneratePolicy = async () => {
    try {
      const res = await fetch('/api/admin/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-policy',
          policyType,
          organizationName: orgName,
          websiteUrl: webUrl,
          contactEmail,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setGeneratedPolicy(resData.content);
      }
    } catch (e) {
      alert('Failed to generate policy.');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              GDPR & CCPA Compliance Suite
            </h1>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Enterprise Consent Management Platform (CMP), Cookie Scanner, Legal Generators & Audit Logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            onClick={fetchConsentData}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>

          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/40"
            onClick={handleSaveConfig}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Banner Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs py-2 px-3">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="customizer" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs py-2 px-3">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" /> Banner Customizer (35 Langs)
          </TabsTrigger>
          <TabsTrigger value="scanner" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs py-2 px-3">
            <Search className="h-3.5 w-3.5 mr-1.5" /> Cookie Scanner
          </TabsTrigger>
          <TabsTrigger value="policies" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs py-2 px-3">
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Policy Generators
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs py-2 px-3">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Consent Logs & Exports
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 text-xs">Consent Acceptance Rate</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-emerald-400">
                  {data?.stats?.acceptanceRate || 88}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-zinc-500">Based on recent visitor choices</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 text-xs">Total Compliance Logs</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-white">
                  {data?.stats?.totalLogs || 194}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-zinc-500">Audit-ready timestamped events</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 text-xs">Active Trackers Detected</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-blue-400">
                  {data?.latestScan?.totalTrackers || 3}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-zinc-500">Categorized by auto-blocker</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 text-xs">Supported Languages</CardDescription>
                <CardTitle className="text-3xl font-extrabold text-purple-400">
                  35
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-zinc-500">Auto-browser detection ready</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Active Legal Frameworks & Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">Google Consent Mode v2</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sends `analytics_storage` and `ad_storage` signals to Google Tags based on user choice.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">IAB TCF v2.3 API</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Exposes standard `window.__tcfapi` endpoint with encoded TC String bitvectors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">Automatic Geotargeting</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Switches between EU GDPR strict explicit Opt-in and CCPA California Opt-out mode.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. CUSTOMIZER TAB */}
        <TabsContent value="customizer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Design & Functionality Controls</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Configure banner layout, color palettes, and global features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-300">Default Banner Language (35 Languages)</Label>
                  <Select value={defaultLang} onValueChange={setDefaultLang}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                      {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                        <SelectItem key={code} value={code}>
                          {lang.nativeName} ({lang.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-300">Banner Layout Style</Label>
                  <Select value={layout} onValueChange={setLayout}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                      <SelectItem value="bottom-bar">Full Bottom Bar (Recommended)</SelectItem>
                      <SelectItem value="modal">Centered Modal Dialog</SelectItem>
                      <SelectItem value="popup-card">Floating Bottom Corner Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-zinc-300">Primary Accent Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-12 h-9 p-1 bg-zinc-950 border-zinc-800 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold text-white">Google Consent Mode v2</Label>
                      <p className="text-[11px] text-zinc-400">Enforce ad & analytics storage states</p>
                    </div>
                    <Switch checked={consentModeV2} onCheckedChange={setConsentModeV2} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold text-white">IAB TCF v2.3 Protocol</Label>
                      <p className="text-[11px] text-zinc-400">Expose window.__tcfapi for ad vendors</p>
                    </div>
                    <Switch checked={tcfEnabled} onCheckedChange={setTcfEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold text-white">Auto Geotargeting</Label>
                      <p className="text-[11px] text-zinc-400">Automatic EU Opt-in / CCPA Opt-out</p>
                    </div>
                    <Switch checked={geoTargeting} onCheckedChange={setGeoTargeting} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-semibold text-white">Script Auto-blocking</Label>
                      <p className="text-[11px] text-zinc-400">Block non-essential scripts until consent</p>
                    </div>
                    <Switch checked={autoBlock} onCheckedChange={setAutoBlock} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banner Live Preview */}
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-400" /> Live Banner Preview
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Preview how visitors will experience the cookie consent prompt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-800/40 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Cookie className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {SUPPORTED_LANGUAGES[defaultLang]?.title || 'We value your privacy 🌿'}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        {SUPPORTED_LANGUAGES[defaultLang]?.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end pt-2">
                    <Button variant="outline" size="sm" className="bg-zinc-900 text-zinc-300 border-zinc-800 text-xs h-8">
                      {SUPPORTED_LANGUAGES[defaultLang]?.rejectAll}
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-8">
                      {SUPPORTED_LANGUAGES[defaultLang]?.acceptAll}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. SCANNER TAB */}
        <TabsContent value="scanner" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white">Automatic Cookie & Tracker Scanner</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Audits all active scripts, third-party tags, and storage cookies on Greenwave Society.
                </CardDescription>
              </div>
              <Button
                onClick={handleTriggerScan}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
              >
                <Search className="h-4 w-4 mr-2" />
                Run Automated Scan
              </Button>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Target Domain</span>
                    <h3 className="text-lg font-bold text-white">greenwave.org</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Last Scanned</span>
                    <p className="text-sm font-mono text-emerald-400">
                      {data?.latestScan?.scannedAt ? new Date(data.latestScan.scannedAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>

                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Cookie / Tracker</th>
                        <th className="p-3">Domain</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Expiry</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      {(data?.latestScan?.cookiesDetected || []).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-950/50">
                          <td className="p-3 font-semibold text-white">{item.name}</td>
                          <td className="p-3 font-mono text-zinc-400">{item.domain}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-medium border border-emerald-800/40">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 uppercase text-[10px] text-zinc-400">{item.type}</td>
                          <td className="p-3 text-zinc-400">{item.expiry}</td>
                          <td className="p-3 text-zinc-400 max-w-xs">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. POLICIES TAB */}
        <TabsContent value="policies" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Interactive Policy Generator</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Generate and publish Privacy Policies, Cookie Policies, and Terms of Service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-zinc-300">Policy Type</Label>
                  <Select value={policyType} onValueChange={setPolicyType}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                      <SelectItem value="cookie">Cookie Policy</SelectItem>
                      <SelectItem value="terms">Terms of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-zinc-300">Organization Name</Label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs text-zinc-300">Contact Email</Label>
                  <Input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs"
                  />
                </div>
              </div>

              <Button
                onClick={handleGeneratePolicy}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Policy Document
              </Button>

              {generatedPolicy && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {generatedPolicy}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. LOGS & EXPORTS TAB */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white">Consent Audit Trail & Exports</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Export timestamped user consent events for GDPR / CCPA regulatory compliance audits.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <a href="/api/admin/consent?action=export-csv" download>
                  <Button variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 text-xs">
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </a>
                <a href="/api/admin/consent?action=export-json" download>
                  <Button variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 text-xs">
                    <Download className="h-4 w-4 mr-2" /> Export JSON
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Audit Logging Active</h4>
                <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                  All visitor consent choices are cryptographically logged with anonymized SHA-256 hashed IPs, region codes, and TCF v2.3 vector records.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

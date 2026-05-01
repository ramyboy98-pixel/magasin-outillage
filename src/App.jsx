import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Menu,
  X,
  Search,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Download,
  Settings,
  Wrench,
} from "lucide-react";
import jsPDF from "jspdf";
import "./style.css";

const defaultTools = [
  { id: "T-001", name: "Clé mixte 10", serial: "CM10-001", status: "inside" },
  { id: "T-002", name: "Tournevis plat", serial: "TP-014", status: "inside" },
  { id: "T-003", name: "Pince universelle", serial: "PU-022", status: "inside" },
];

const defaultWorkers = ["Ahmed", "Mohamed", "Yacine", "Karim"];

const translations = {
  fr: {
    title: "Magasin D'outillage",
    subtitle: "Atelier Moteur & cellule",
    search: "Rechercher outil, employé, série...",
    checkout: "Sortie outil",
    returnTool: "Retour outil",
    worker: "Employé",
    tool: "Outil",
    save: "Enregistrer",
    tools: "Outils",
    journal: "Journal",
    settings: "Paramètres",
    addTool: "Ajouter outil",
    addWorker: "Ajouter employé",
    exportPdf: "Télécharger PDF",
    inside: "Disponible",
    outside: "Sorti",
    language: "Langue",
    theme: "Couleur",
    clearLog: "Vider le journal",
  },
  ar: {
    title: "مخزن العتاد",
    subtitle: "ورشة المحرك والهيكل",
    search: "ابحث عن أداة، عامل، رقم تسلسلي...",
    checkout: "إخراج أداة",
    returnTool: "إرجاع أداة",
    worker: "العامل",
    tool: "الأداة",
    save: "حفظ",
    tools: "الأدوات",
    journal: "السجل",
    settings: "الإعدادات",
    addTool: "إضافة أداة",
    addWorker: "إضافة عامل",
    exportPdf: "تحميل PDF",
    inside: "متوفرة",
    outside: "خارج المخزن",
    language: "اللغة",
    theme: "اللون",
    clearLog: "مسح السجل",
  },
  en: {
    title: "Tool Store",
    subtitle: "Engine & Airframe Workshop",
    search: "Search tool, worker, serial...",
    checkout: "Tool checkout",
    returnTool: "Tool return",
    worker: "Worker",
    tool: "Tool",
    save: "Save",
    tools: "Tools",
    journal: "Log",
    settings: "Settings",
    addTool: "Add tool",
    addWorker: "Add worker",
    exportPdf: "Download PDF",
    inside: "Available",
    outside: "Checked out",
    language: "Language",
    theme: "Theme",
    clearLog: "Clear log",
  },
};

function App() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "fr");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "blue");
  const [tools, setTools] = useState(
    JSON.parse(localStorage.getItem("tools") || "null") || defaultTools
  );
  const [workers, setWorkers] = useState(
    JSON.parse(localStorage.getItem("workers") || "null") || defaultWorkers
  );
  const [logs, setLogs] = useState(
    JSON.parse(localStorage.getItem("logs") || "[]")
  );

  const [query, setQuery] = useState("");
  const [worker, setWorker] = useState(workers[0] || "");
  const [toolId, setToolId] = useState(tools[0]?.id || "");
  const [drawer, setDrawer] = useState(false);
  const [newWorker, setNewWorker] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newSerial, setNewSerial] = useState("");

  const t = translations[lang];
  const isRtl = lang === "ar";

  useEffect(() => localStorage.setItem("lang", lang), [lang]);
  useEffect(() => localStorage.setItem("theme", theme), [theme]);
  useEffect(() => localStorage.setItem("tools", JSON.stringify(tools)), [tools]);
  useEffect(() => localStorage.setItem("workers", JSON.stringify(workers)), [workers]);
  useEffect(() => localStorage.setItem("logs", JSON.stringify(logs)), [logs]);

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase();
    return tools.filter(
      (x) =>
        x.name.toLowerCase().includes(q) ||
        x.serial.toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q)
    );
  }, [query, tools]);

  function addLog(type) {
    const selectedTool = tools.find((x) => x.id === toolId);
    if (!selectedTool || !worker) return;

    const nextStatus = type === "checkout" ? "outside" : "inside";

    setTools((prev) =>
      prev.map((x) => (x.id === toolId ? { ...x, status: nextStatus } : x))
    );

    setLogs((prev) => [
      {
        id: Date.now(),
        type,
        worker,
        toolName: selectedTool.name,
        serial: selectedTool.serial,
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  }

  function addWorker() {
    if (!newWorker.trim()) return;
    setWorkers([...workers, newWorker.trim()]);
    setWorker(newWorker.trim());
    setNewWorker("");
  }

  function addTool() {
    if (!newTool.trim()) return;
    const item = {
      id: "T-" + String(Date.now()).slice(-5),
      name: newTool.trim(),
      serial: newSerial.trim() || "SN-" + Date.now(),
      status: "inside",
    };
    setTools([...tools, item]);
    setToolId(item.id);
    setNewTool("");
    setNewSerial("");
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.text(t.title, 15, 15);
    doc.text(t.subtitle, 15, 25);
    let y = 40;

    logs.forEach((log, index) => {
      doc.text(
        `${index + 1}. ${log.date} | ${log.worker} | ${log.toolName} | ${log.serial} | ${log.type}`,
        15,
        y
      );
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("journal-outillage.pdf");
  }

  return (
    <main className={`app ${theme}`} dir={isRtl ? "rtl" : "ltr"}>
      <header className="header">
        <div className="brand">
          <div className="logo">
            <Wrench size={28} />
          </div>
          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
        </div>
        <button className="iconBtn" onClick={() => setDrawer(true)}>
          <Menu />
        </button>
      </header>

      <section className="searchBox">
        <Search size={20} />
        <input
          placeholder={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <section className="panel">
        <h2>{t.checkout}</h2>

        <label>{t.worker}</label>
        <select value={worker} onChange={(e) => setWorker(e.target.value)}>
          {workers.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>

        <label>{t.tool}</label>
        <select value={toolId} onChange={(e) => setToolId(e.target.value)}>
          {tools.map((tool) => (
            <option key={tool.id} value={tool.id}>
              {tool.name} — {tool.serial}
            </option>
          ))}
        </select>

        <div className="actions">
          <button onClick={() => addLog("checkout")}>
            <Save size={18} /> {t.checkout}
          </button>
          <button className="secondary" onClick={() => addLog("return")}>
            <RotateCcw size={18} /> {t.returnTool}
          </button>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>{t.tools}</h2>
          {filteredTools.map((tool) => (
            <div className="toolRow" key={tool.id}>
              <div>
                <strong>{tool.name}</strong>
                <span>{tool.serial}</span>
              </div>
              <b className={tool.status}>{tool.status === "inside" ? t.inside : t.outside}</b>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>{t.journal}</h2>
          {logs.length === 0 && <p className="empty">Aucun mouvement enregistré.</p>}
          {logs.map((log) => (
            <div className="logRow" key={log.id}>
              <strong>{log.worker}</strong>
              <span>{log.toolName} — {log.serial}</span>
              <small>{log.date}</small>
            </div>
          ))}
        </div>
      </section>

      {drawer && (
        <aside className="drawer">
          <div className="drawerHeader">
            <h2>
              <Settings size={20} /> {t.settings}
            </h2>
            <button className="iconBtn" onClick={() => setDrawer(false)}>
              <X />
            </button>
          </div>

          <label>{t.language}</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>

          <label>{t.theme}</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="blue">Bleu</option>
            <option value="silver">Silver</option>
            <option value="dark">Dark</option>
          </select>

          <hr />

          <h3>{t.addWorker}</h3>
          <div className="inline">
            <input value={newWorker} onChange={(e) => setNewWorker(e.target.value)} />
            <button onClick={addWorker}>
              <Plus size={16} />
            </button>
          </div>

          <h3>{t.addTool}</h3>
          <input
            placeholder="Nom outil"
            value={newTool}
            onChange={(e) => setNewTool(e.target.value)}
          />
          <input
            placeholder="Numéro série"
            value={newSerial}
            onChange={(e) => setNewSerial(e.target.value)}
          />
          <button onClick={addTool}>
            <Plus size={16} /> {t.addTool}
          </button>

          <hr />

          <button onClick={exportPdf}>
            <Download size={16} /> {t.exportPdf}
          </button>

          <button className="danger" onClick={() => setLogs([])}>
            <Trash2 size={16} /> {t.clearLog}
          </button>
        </aside>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

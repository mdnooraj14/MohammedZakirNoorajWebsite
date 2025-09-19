import React, { useMemo, Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ExternalLink, Download } from "lucide-react";

/* ---------- Theme hook (dark <-> light) ---------- */
function useTheme() {
  const getInitial = () => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const [theme, setTheme] = useState(getInitial);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

/* ---------- WebGL check ---------- */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function StaticHero() {
  const tags = ["React", "Node.js", "MongoDB", "Express", "Swagger", "ServiceNow", "MachineLearning", "DSA", "GIT"];
  return (
    <div className="h-[70vh] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/20 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 grid place-items-center">
      <div className="text-center px-4">
        <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">Tech Stack</div>
        <div className="mt-3 text-slate-600 dark:text-white/60 max-w-md mx-auto">
          Static preview (WebGL unavailable). Open in a modern browser/device to view the 3D ring animation.
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md mx-auto">
          {tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/85 dark:border-white/10"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RingLabel({ text, angle = 0, radius = 3.1, y = 0.18 }) {
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return (
    <group position={[x, y, z]} rotation={[0, -angle, 0]}>
      <Html distanceFactor={12} center>
        <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white text-slate-900 border border-black/5 shadow dark:bg-white/92">
          {text}
        </span>
      </Html>
    </group>
  );
}

/** Small glowing sphere that runs along the ring to add life */
function LightRunner({ radius = 3.1, speed = 1, size = 0.08, offset = 0, color = "#38bdf8" }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 1.4) * 0.15; // gentle bob
    if (ref.current) {
      ref.current.position.set(x, y, z);
      ref.current.rotation.y = -t;
    }
  });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.25}
        metalness={0.5}
      />
    </mesh>
  );
}

function RotatingRings({ skills }) {
  const groupOuter = useRef();
  const groupInner = useRef();

  useFrame((_, delta) => {
    if (groupOuter.current) groupOuter.current.rotation.y += delta * 0.22;
    if (groupInner.current) groupInner.current.rotation.y -= delta * 0.16;
  });

  const outerRadius = 3.1;
  const innerRadius = 2.2;

  return (
    <group>
      <group ref={groupOuter}>
        <mesh rotation={[Math.PI / 2.2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[outerRadius, 0.05, 16, 256]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.6}
            roughness={0.25}
            emissive="#0ea5e9"
            emissiveIntensity={0.28}
          />
        </mesh>

        {skills.map((s, i) => (
          <RingLabel key={s} text={s} angle={(i / skills.length) * Math.PI * 2} radius={outerRadius} />
        ))}

        {Array.from({ length: 6 }).map((_, i) => (
          <LightRunner
            key={i}
            radius={outerRadius}
            speed={0.9 + (i % 3) * 0.08}
            size={0.09}
            offset={(i / 6) * Math.PI * 2}
            color={i % 2 ? "#38bdf8" : "#a78bfa"}
          />
        ))}
      </group>

      <group ref={groupInner}>
        <mesh rotation={[Math.PI / 2.2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[innerRadius, 0.04, 16, 192]} />
          <meshStandardMaterial
            color="#a78bfa"
            metalness={0.6}
            roughness={0.28}
            emissive="#7c3aed"
            emissiveIntensity={0.22}
          />
        </mesh>

        {Array.from({ length: 4 }).map((_, i) => (
          <LightRunner
            key={`inner-${i}`}
            radius={innerRadius}
            speed={1.05 + (i % 2) * 0.1}
            size={0.07}
            offset={(i / 4) * Math.PI * 2}
            color={i % 2 ? "#22d3ee" : "#f472b6"}
          />
        ))}
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <circleGeometry args={[0.7, 64]} />
        <meshStandardMaterial color="#0b1220" metalness={0.5} roughness={0.42} />
      </mesh>
    </group>
  );
}

function Hero3D() {
  const skills = useMemo(
    () => ["React", "Node.js", "MongoDB", "Express", "Swagger", "ServiceNow", "MachineLearning", "DSA", "GIT"],
    []
  );

  return (
    <div className="h-[70vh] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/20 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Canvas shadows camera={{ position: [3.8, 2.6, 5.2], fov: 55 }}>
        <ambientLight intensity={0.62} />
        <directionalLight position={[5, 7, 6]} intensity={1.08} castShadow />
        <pointLight position={[-6, 3, -4]} intensity={0.25} color={"#60a5fa"} />
        <pointLight position={[6, -2, 4]} intensity={0.2} color={"#a78bfa"} />
        <RotatingRings skills={skills} />
        <OrbitControls enablePan={false} maxDistance={10} minDistance={3.2} />
      </Canvas>
    </div>
  );
}

/* ---------- UI primitives ---------- */
const Section = ({ id, title, children }) => (
  <section id={id} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">{title}</h2>
    <div className="grid gap-6">{children}</div>
  </section>
);

const Card = ({ children }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6 shadow-xl shadow-black/5 dark:shadow-black/20">
    {children}
  </div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/10 px-3 py-1 text-xs text-slate-700 dark:text-white mr-2 mb-2">
    {children}
  </span>
);

/* ---------- Error Boundary ---------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200">
          <div className="font-semibold">3D preview failed to load.</div>
          <div className="text-sm opacity-80">This environment may be missing WebGL or Three.js features. The rest of the site still works.</div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * MZN Assistant — lightweight, privacy-friendly chatbot
 * -----------------------------------------------------
 * - Answers portfolio-related questions from a local knowledge base.
 * - No backend needed. No tracking. Runs entirely in the browser.
 * - Floating button toggles an animated chat panel.
 */
function MZNAssistant() {
  const resumeUrl = "https://drive.google.com/file/d/1nBXouS_zcNa2kRHKVaCSbJuI3CZmWKQV/view?usp=sharing";
  const kb = {
    name: "Mohammed Zakir Nooraj",
    role: "Backend Developer & MERN Stack",
    location: "Hyderabad, India",
    email: "mdnooraj14@gmail.com",
    github: "https://github.com/mdnooraj14",
    linkedin: "https://www.linkedin.com/in/mohammed-zakir-nooraj",
    resume: resumeUrl,
    skills: [
      "Node.js","Express.js","MongoDB","React.js","Redis","REST APIs","Swagger/OpenAPI","GitHub","Postman","C++","DSA","ServiceNow","LLMs","AI Agents","Agentic Workflows","MCP Server","AIML"
    ],
    projects: [
      { name: "TechMantra", link: "https://github.com/mdnooraj14/TechMantra.co_FullStack" },
      { name: "Hybrid_RAG_LangChain_-_Gemini_-_HuggingFace_for_Resilient_PDF_Q-A", link: "https://github.com/mdnooraj14/Hybrid_RAG_LangChain_-_Gemini_-_HuggingFace_for_Resilient_PDF_Q-A" },
      { name: "Chat_to_Action_Gemini_LLM_with_MCP_for_Real_World_Weather_Data.ipynb", link: "https://github.com/mdnooraj14/Chat_to_Action_Gemini_LLM_with_MCP_for_Real_World_Weather_Data.ipynb" },
    ],
    experience: "Backend Developer (MERN) at IT4YOURBUSINESS — June 2025 to Present",
    education: [
      "BTECH in Information Technology (GMR Institute of Technology, 2020-2024)",
      "Intermediate (M.P.C) — Naryana Jr College (2018-2020)",
      "10th — Sri Chaitanya Techno School (2017-2018)",
      "Oracle Cloud Infrastructure 2023 Foundations Associate",
      "Java Full-Stack — Tech Mahindra SMART Academy"
    ]
  };

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: `Hi! I\'m MZN Assistant. Ask me about ${kb.name}\'s skills, projects, experience, or how to contact him.` },
  ]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function formatProjects() {
    return kb.projects.map(p => `• ${p.name} — ${p.link}`).join("\n");
  }

  function answer(questionRaw) {
    const q = questionRaw.toLowerCase();

    // Simple intent routing
    if (/(name|who (are|is) you|owner)/.test(q)) {
      return `I represent ${kb.name}, ${kb.role}, based in ${kb.location}.`;
    }
    if (/(location|based|where)/.test(q)) {
      return `${kb.name} is based in ${kb.location}.`;
    }
    if (/(email|contact|reach|mail)/.test(q)) {
      return `You can contact ${kb.name} at ${kb.email} or on LinkedIn (${kb.linkedin}).`;
    }
    if (/(github|code|repos)/.test(q)) {
      return `GitHub profile: ${kb.github}`;
    }
    if (/(linkedin)/.test(q)) {
      return `LinkedIn: ${kb.linkedin}`;
    }
    if (/(resume|cv|download)/.test(q)) {
      return `Here is the resume: ${kb.resume}`;
    }
    if (/(skill|stack|tech|technolog)/.test(q)) {
      return `Key skills: ${kb.skills.join(", ")}.`;
    }
    if (/(project|portfolio|work)/.test(q)) {
      return `Recent projects:\n${formatProjects()}`;
    }
    if (/(experience|job|work history)/.test(q)) {
      return `${kb.experience}. Core responsibilities: Node.js/Express services, Redis caching/sessions, horizontal scaling, and API integration in Agile squads.`;
    }
    if (/(education|cert|degree|college|school)/.test(q)) {
      return `Education & Certifications:\n• ${kb.education.join("\n• ")}`;
    }
    if (/help|what can you do|commands?/.test(q)) {
      return `Try asking: \n• "What are your skills?"\n• "Show projects"\n• "How can I contact you?"\n• "Download resume"\n• "Where are you based?"`;
    }

    // fallback: lightly fuzzy match keywords present in kb
    const maybeSkill = kb.skills.find(s => q.includes(s.toLowerCase().replace(/\W+/g, "")));
    if (maybeSkill) {
      return `Yes, ${kb.name} works with ${maybeSkill}. Full stack: ${kb.skills.join(", ")}.`;
    }

    return "I couldn't find that in the portfolio. Try asking about skills, projects, experience, education, GitHub, LinkedIn, or resume.";
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    // "Think" briefly (simulated)
    const reply = answer(text);
    setTimeout(() => setMessages((m) => [...m, { role: "bot", text: reply }]), 150);
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-label="Open MZN Assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition"
      >
        <MessageCircle size={18} /> MZN Assistant
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 right-6 w-[min(92vw,380px)] h-[520px] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="font-semibold">MZN Assistant</div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
           {/* Messages */}
<div className="flex-1 overflow-y-auto p-3 space-y-3">
  {messages.map((m, i) => (
    <div
      key={i}
      className={`min-w-0 max-w-[85%] ${m.role === "bot" ? "mr-auto" : "ml-auto"}`}
    >
      <div
        className={`${
          m.role === "bot" ? "bg-white/10" : "bg-sky-500"
        } text-white px-3 py-2 rounded-xl whitespace-pre-wrap break-words text-sm border border-white/10`}
      >
        {m.text}
      </div>
    </div>
  ))}

  {/* Quick chips */}
  <div className="flex flex-wrap gap-2 mt-2">
    {["Show projects","Download resume","Contact info","What are your skills?","Where are you based?"].map(q => (
      <button
        key={q}
        onClick={() => { setInput(q); setTimeout(send, 0); }}
        className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/80 hover:bg-white/10"
      >
        {q}
      </button>
    ))}
  </div>
</div>


            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder="Ask about skills, projects, resume..."
                  className="flex-1 bg-transparent outline-none rounded-xl border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
                />
                <button onClick={send} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2 text-sm font-semibold text-white">
                  <Send size={16} />
                </button>
              </div>
              <div className="text-[10px] text-white/50 mt-2">Local Q&A — no data leaves your browser.</div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ---------- MZN Assistant ---------- */
function MZNAssistant() {
  const resumeUrl = "https://drive.google.com/file/d/1nBXouS_zcNa2kRHKVaCSbJuI3CZmWKQV/view?usp=sharing";
  const kb = {
    name: "Mohammed Zakir Nooraj",
    role: "Backend Developer & MERN Stack",
    location: "Hyderabad, India",
    email: "mdnooraj14@gmail.com",
    github: "https://github.com/mdnooraj14",
    linkedin: "https://www.linkedin.com/in/mohammed-zakir-nooraj",
    resume: resumeUrl,
    skills: [
      "Node.js","Express.js","MongoDB","React.js","Redis","REST APIs","Swagger/OpenAPI","GitHub","Postman","C++","DSA","ServiceNow","LLMs","AI Agents","Agentic Workflows","MCP Server","AIML"
    ],
    projects: [
      { name: "TechMantra", link: "https://github.com/mdnooraj14/TechMantra.co_FullStack" },
      { name: "Hybrid_RAG_LangChain_-_Gemini_-_HuggingFace_for_Resilient_PDF_Q-A", link: "https://github.com/mdnooraj14/Hybrid_RAG_LangChain_-_Gemini_-_HuggingFace_for_Resilient_PDF_Q-A" },
      { name: "Chat_to_Action_Gemini_LLM_with_MCP_for_Real_World_Weather_Data.ipynb", link: "https://github.com/mdnooraj14/Chat_to_Action_Gemini_LLM_with_MCP_for_Real_World_Weather_Data.ipynb" },
    ],
    experience: "Backend Developer (MERN) at IT4YOURBUSINESS — June 2025 to Present",
    education: [
      "BTECH in Information Technology (GMR Institute of Technology, 2020-2024)",
      "Intermediate (M.P.C) — Naryana Jr College (2018-2020)",
      "10th — Sri Chaitanya Techno School (2017-2018)",
      "Oracle Cloud Infrastructure 2023 Foundations Associate",
      "Java Full-Stack — Tech Mahindra SMART Academy"
    ]
  };

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: `Hi! I\'m MZN Assistant. Ask me about ${kb.name}\'s skills, projects, experience, or how to contact him.` },
  ]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function formatProjects() {
    return kb.projects.map(p => `• ${p.name} — ${p.link}`).join("\n");
  }

  function answer(questionRaw) {
    const q = questionRaw.toLowerCase();

    if (/(name|who (are|is) you|owner)/.test(q)) {
      return `I represent ${kb.name}, ${kb.role}, based in ${kb.location}.`;
    }
    if (/(location|based|where)/.test(q)) {
      return `${kb.name} is based in ${kb.location}.`;
    }
    if (/(email|contact|reach|mail)/.test(q)) {
      return `You can contact ${kb.name} at ${kb.email} or on LinkedIn (${kb.linkedin}).`;
    }
    if (/(github|code|repos)/.test(q)) {
      return `GitHub profile: ${kb.github}`;
    }
    if (/(linkedin)/.test(q)) {
      return `LinkedIn: ${kb.linkedin}`;
    }
    if (/(resume|cv|download)/.test(q)) {
      return `Here is the resume: ${kb.resume}`;
    }
    if (/(skill|stack|tech|technolog)/.test(q)) {
      return `Key skills: ${kb.skills.join(", ")}.`;
    }
    if (/(project|portfolio|work)/.test(q)) {
      return `Recent projects:\n${formatProjects()}`;
    }
    if (/(experience|job|work history)/.test(q)) {
      return `${kb.experience}. Core responsibilities: Node.js/Express services, Redis caching/sessions, horizontal scaling, and API integration in Agile squads.`;
    }
    if (/(education|cert|degree|college|school)/.test(q)) {
      return `Education & Certifications:\n• ${kb.education.join("\n• ")}`;
    }
    if (/help|what can you do|commands?/.test(q)) {
      return `Try asking: \n• "What are your skills?"\n• "Show projects"\n• "How can I contact you?"\n• "Download resume"\n• "Where are you based?"`;
    }

    const maybeSkill = kb.skills.find(s => q.includes(s.toLowerCase().replace(/\W+/g, "")));
    if (maybeSkill) {
      return `Yes, ${kb.name} works with ${maybeSkill}. Full stack: ${kb.skills.join(", ")}.`;
    }

    return "I couldn't find that in the portfolio. Try asking about skills, projects, experience, education, GitHub, LinkedIn, or resume.";
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    const reply = answer(text);
    setTimeout(() => setMessages((m) => [...m, { role: "bot", text: reply }]), 150);
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-label="Open MZN Assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition"
      >
        <MessageCircle size={18} /> MZN Assistant
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 right-6 w-[min(92vw,380px)] h-[520px] rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <div className="font-semibold text-slate-900 dark:text-white">MZN Assistant</div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                <X size={18} className="text-slate-700 dark:text-white" />
              </button>
            </div>

            {/* Messages (with overflow fixes) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`min-w-0 max-w-[85%] ${m.role === "bot" ? "mr-auto" : "ml-auto"}`}
                >
                  <div
                    className={`${
                      m.role === "bot" ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white" : "bg-sky-500 text-white"
                    } px-3 py-2 rounded-xl whitespace-pre-wrap break-words text-sm border border-slate-200 dark:border-white/10`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Quick chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                {["Show projects","Download resume","Contact info","What are your skills?","Where are you based?"].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); setTimeout(send, 0); }}
                    className="text-xs px-3 py-1 rounded-full border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder="Ask about skills, projects, resume..."
                  className="flex-1 bg-transparent outline-none rounded-xl border border-slate-300 dark:border-white/10 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/50"
                />
                <button onClick={send} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2 text-sm font-semibold text-white">
                  <Send size={16} />
                </button>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-white/50 mt-2">Local Q&A — no data leaves your browser.</div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-white/80 via-white/70 to-slate-100/80 dark:from-slate-950/80 dark:via-indigo-950/70 dark:to-slate-900/80 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo / Name */}
          <a
            href="#top"
            className="relative font-extrabold text-2xl sm:text-3xl lg:text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-500 hover:scale-110 hover:drop-shadow-[0_0_18px_rgba(167,139,250,0.9)] transition-all duration-500"
          >
            Mohammed Zakir Nooraj
          </a>

          <nav className="hidden sm:flex gap-6 text-sm text-slate-600 dark:text-white/70">
            <a href="#about" className="hover:text-slate-900 dark:hover:text-white">About</a>
            <a href="#skills" className="hover:text-slate-900 dark:hover:text-white">Skills</a>
            <a href="#experience" className="hover:text-slate-900 dark:hover:text-white">Experience</a>
            <a href="#projects" className="hover:text-slate-900 dark:hover:text-white">Projects</a>
            <a href="#education" className="hover:text-slate-900 dark:hover:text-white">Education</a>
            <a href="#contact" className="hover:text-slate-900 dark:hover:text-white">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              {theme === "dark" ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-slate-800" />}
            </button>

            <a href="https://github.com/mdnooraj14" target="_blank" rel="noreferrer" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
              <Github size={18} className="text-slate-800 dark:text-white" />
            </a>
            <a href="https://www.linkedin.com/in/mohammed-zakir-nooraj" target="_blank" rel="noreferrer" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
              <Linkedin size={18} className="text-slate-800 dark:text-white" />
            </a>
            <a href="mailto:mdnooraj14@gmail.com" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
              <Mail size={18} className="text-slate-800 dark:text-white" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main id="top" className="pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                Backend Developer <span className="text-sky-600 dark:text-sky-400">& MERN</span> Stack
              </h1>
              <p className="mt-4 text-slate-600 dark:text-white/70">
                I build secure, scalable backends with Node.js, Express, MongoDB, and Redis. Passionate about AI agents and cloud-native architectures. Based in Hyderabad.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#contact" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
                  Contact Me <ExternalLink size={16} />
                </a>
                <a href="https://drive.google.com/file/d/1ojjLB8AYB_dleglWGO8Crklb-pM4cg8h/view?usp=sharing" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10">
                  <Download size={16} /> Download Resume
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="h-[70vh] w-full rounded-2xl border border-slate-200 dark:border-white/10 grid place-items-center">
                      <div className="text-slate-600 dark:text-white/70 text-sm">Loading 3D scene...</div>
                    </div>
                  }
                >
                  {isWebGLAvailable() ? <Hero3D /> : <StaticHero />}
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </div>
        </div>

        {/* ABOUT */}
        <Section id="about" title="About Me">
          <Card>
            <p className="text-slate-700 dark:text-white/80">
              MERN Stack Developer skilled in backend development with Node.js, Redis, and MongoDB. I focus on building secure, efficient systems and collaborating in Agile teams to ship production-ready software. I'm actively exploring AI/ML, LLMs, and agentic workflows to deliver real-world solutions.
            </p>
          </Card>
        </Section>

        {/* SKILLS */}
        <Section id="skills" title="Skills">
          <Card>
            <div className="mb-3 text-slate-600 dark:text-white/70 text-sm">Core</div>
            <div>
              {[
                "Node.js","Express.js","MongoDB","React.js","Redis","REST APIs","Swagger/OpenAPI","GitHub","Postman","C++","DSA","ServiceNow","LLMs","AI Agents","Agentic Workflows","MCP Server","AIML",
              ].map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </Card>
        </Section>

        {/* EXPERIENCE */}
        <Section id="experience" title="Experience">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Backend Developer (MERN Stack) - IT4YOURBUSINESS</h3>
                <p className="text-slate-500 dark:text-white/60">Hyderabad | June 2025 - Present</p>
              </div>
              <div className="mt-3 sm:mt-0">
                <a className="text-sky-400 hover:underline" href="#">Company Site</a>
              </div>
            </div>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-slate-700 dark:text-white/80">
              <li>Built secure, scalable backend services with Node.js &amp; Express.</li>
              <li>Implemented Redis caching &amp; session handling for faster apps.</li>
              <li>Applied horizontal scaling to support growing user load.</li>
              <li>Collaborated across frontend, DevOps, and QA in Agile sprints.</li>
              <li>Integrated backend APIs with real-time business requirements.</li>
            </ul>
          </Card>
        </Section>

        {/* PROJECTS */}
        <Section id="projects" title="Projects">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "TechMantra", desc: "Full-stack project", link: "https://github.com/mdnooraj14/TechMantra.co_FullStack" },
              { name: "Hybrid_RAG_LangChain_-_Gemini_-_HuggingFace_for_Resilient_PDF_Q-A", desc: "RAG pipeline combining Gemini and HuggingFace for robust PDF Q&A.", link: "https://github.com/mdnooraj14/Hybrid_RAG_LangChain_-_Gemini_-_HuggingFace_for_Resilient_PDF_Q-A" },
              { name: "Chat_to_Action_Gemini_LLM_with_MCP_for_Real_World_Weather_Data.ipynb", desc: "Chat-to-action agent using Gemini + MCP over live weather data.", link: "https://github.com/mdnooraj14/Chat_to_Action_Gemini_LLM_with_MCP_for_Real_World_Weather_Data.ipynb" },
            ].map((p) => (
              <Card key={p.name}>
                <div className="min-h-[180px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold break-words text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="text-slate-600 dark:text-white/70 mt-1">{p.desc}</p>
                  </div>
                  <div className="mt-3">
                    <a
                      href={p.link}
                      className="inline-flex items-center gap-2 text-sky-700 dark:text-sky-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* EDUCATION & CERTS */}
        <Section id="education" title="Education & Certifications">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold">BTECH in Information Technology</h3>
              <p className="text-white/70">2020-2024 • GMR Institute of Technology • CGPA 7.17</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">Intermediate (M.P.C)</h3>
              <p className="text-white/70">2018-2020 • Naryana Jr College • CGPA 7.54</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">10th • Sri Chaitanya Techno School</h3>
              <p className="text-white/70">2017-2018 • CGPA 9.7</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Oracle Cloud Infrastructure 2023 - Foundations Associate</h3>
              <p className="text-slate-600 dark:text-white/70">Certification</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Java Full-Stack (Tech Mahindra SMART Academy)</h3>
              <p className="text-slate-600 dark:text-white/70">Training - Hyderabad</p>
            </Card>
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contact" title="Contact">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Let's build something!</div>
                <div className="text-slate-600 dark:text-white/70">Hyderabad | Open to roles and projects.</div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="mailto:mdnooraj14@gmail.com"
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  <Mail size={16} /> Email
                </a>
                <a
                  href="https://github.com/mdnooraj14"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/20 px-4 py-2 text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <Github size={16} /> GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/mohammed-zakir-nooraj"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/20 px-4 py-2 text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <Linkedin size={16} /> LinkedIn
                </a>
              </div>
            </div>
          </Card>
        </Section>
      </main>

      <footer className="py-8 text-center text-slate-600 dark:text-white/50 text-sm">
        &copy; {new Date().getFullYear()} Mohammed Zakir Nooraj. Built with React • Three.js • Tailwind.
      </footer>

      {/* Floating Chatbot */}
      <MZNAssistant />
    </div>
  );
}

/*
  TESTS (unchanged)
  -----------------
  1) Smoke test:
  // App.test.jsx
  import { render } from "@testing-library/react";
  import App from "./App";
  it("renders without crashing", () => { render(<App />); });

  2) Navbar content test:
  import { render, screen } from "@testing-library/react";
  it("shows name in navbar", () => {
    render(<App />);
    expect(screen.getByText(/Mohammed Zakir Nooraj/i)).toBeInTheDocument();
  });

  3) ErrorBoundary fallback render:
  import React from "react";
  import { render, screen } from "@testing-library/react";
  function Boom(){ throw new Error("boom"); }
  it("shows fallback UI on error", () => {
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
*/

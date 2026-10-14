import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Factory,
  FileText,
  Flag,
  FolderKanban,
  House,
  Languages,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Wallet,
  X,
} from "lucide-react";
import {
  DEMO_DATE,
  STORAGE_KEY,
  habits,
  initialState,
  projects,
  statuses,
  trainingSteps,
} from "./data.js";

function Tooth({ size = 20, strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4c-3-3-7-1-7 3 0 3 1.2 5 1.5 8 .5 6 2.5 7 3.5 1 .6-3 3.4-3 4 0 1 6 3 5 3.5-1 .3-3 1.5-5 1.5-8 0-4-4-6-7-3Z" />
      <path d="M9 3.5c1 1 2 1.8 4 2" />
    </svg>
  );
}
const icons = {
  factory: Factory,
  tooth: Tooth,
  book: BookOpen,
  wallet: Wallet,
  house: House,
  languages: Languages,
  sun: Sun,
  moon: Moon,
};
const navItems = [
  {
    id: "dashboard",
    label: "Meu painel",
    mobile: "Painel",
    icon: LayoutDashboard,
  },
  { id: "projects", label: "Projetos", mobile: "Projetos", icon: FolderKanban },
  {
    id: "checklists",
    label: "Checklists",
    mobile: "Checklists",
    icon: ListChecks,
  },
  { id: "records", label: "Registros", mobile: "Registros", icon: FileText },
  { id: "rbc", label: "RBC Motores", mobile: "RBC", icon: Factory },
];
const projectById = (id) => projects.find((p) => p.id === id) || projects[0];
const dateObject = (date) => new Date(`${date}T12:00:00`);
const shortDate = (date) =>
  dateObject(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
const fullDate = (date) =>
  dateObject(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const percentage = (items) =>
  items.length
    ? Math.round((items.filter((i) => i.done).length / items.length) * 100)
    : 0;
const initials = (name) =>
  name
    .split(/\s|\+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
const matches = (task, query) =>
  `${task.title} ${task.owner} ${projectById(task.project).name} ${task.nextAction}`
    .toLocaleLowerCase("pt-BR")
    .includes(query.toLocaleLowerCase("pt-BR"));
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: initialState(), error: "" };
    const data = JSON.parse(raw);
    if (
      !Array.isArray(data.tasks) ||
      !Array.isArray(data.records) ||
      !Array.isArray(data.orders) ||
      !data.habits ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
    )
      throw new Error("invalid");
    return { data, error: "" };
  } catch {
    return {
      data: initialState(),
      error:
        "Não foi possível ler os dados locais. A demonstração foi aberta; os dados anteriores não foram sobrescritos.",
    };
  }
}
function ProjectIcon({ project, size = 20 }) {
  const Icon = icons[project.icon];
  return (
    <span
      className="project-icon"
      style={{ color: project.color, background: project.tint }}
    >
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}
function Status({ status }) {
  return (
    <span className={`status status-${statuses.indexOf(status)}`}>
      <i />
      {status}
    </span>
  );
}
function Avatar({ name, tone = 0 }) {
  return (
    <span className={`avatar avatar-${tone % 3}`} title={name}>
      {initials(name)}
    </span>
  );
}
function Empty({ icon: Icon = ClipboardCheck, title, text, children }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={26} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
function Modal({ title, eyebrow, children, close, wide = false }) {
  const dialog = useRef(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const rect = dialog.current.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            closeRef.current();
        }
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 id="dialog-title">{title}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Fechar janela"
          onClick={close}
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default function App() {
  const [loaded] = useState(loadState);
  const [data, setData] = useState(loaded.data);
  const dataRef = useRef(data);
  const [storageError, setStorageError] = useState(loaded.error);
  const [page, setPage] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (!mobileMenu) return;
    const previous = document.activeElement;
    const sidebar = sidebarRef.current;
    sidebar.querySelector(".mobile-close").focus();
    function handleKey(event) {
      if (event.key === "Escape") {
        setMobileMenu(false);
        return;
      }
      if (event.key !== "Tab") return;
      const buttons = [...sidebar.querySelectorAll("button, a[href]")].filter(
        (el) => el.getClientRects().length,
      );
      const first = buttons[0],
        last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    sidebar.addEventListener("keydown", handleKey);
    return () => {
      sidebar.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [mobileMenu]);
  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  function notify(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4000);
  }
  function commit(updater) {
    const next =
      typeof updater === "function" ? updater(dataRef.current) : updater;
    dataRef.current = next;
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "O armazenamento local está indisponível ou cheio. As alterações estão apenas nesta sessão; exporte seus dados antes de sair.",
      );
      return false;
    }
  }
  function go(next, project = "all") {
    setPage(next);
    setProjectFilter(project);
    setStatusFilter("all");
    setQuery("");
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function saveTask(task) {
    const saved = commit((s) => ({
      ...s,
      tasks: s.tasks.some((t) => t.id === task.id)
        ? s.tasks.map((t) => (t.id === task.id ? task : t))
        : [...s.tasks, task],
    }));
    setModal(null);
    if (saved) notify("Tarefa salva neste dispositivo.");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(dataRef.current, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `junior-gestao-${data.date}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Exportação de dados preparada.");
  }
  const daily = data.tasks.filter((t) => t.priority && t.due === data.date);
  const completed = daily.filter((t) => t.status === "Concluído").length;
  const waiting = data.tasks.filter((t) => t.status === "Aguardando");
  const dailyHabits = data.habits[data.date] || [];
  const filteredTasks = data.tasks.filter(
    (t) =>
      (projectFilter === "all" || t.project === projectFilter) &&
      (statusFilter === "all" || t.status === statusFilter) &&
      matches(t, query),
  );
  const navTitle = navItems.find((n) => n.id === page)?.label;
  const setDate = (date) => {
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      !Number.isNaN(dateObject(date).getTime())
    )
      commit((s) => ({ ...s, date }));
  };
  const changeDay = (days) => {
    const date = dateObject(data.date);
    date.setDate(date.getDate() + days);
    setDate(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    );
  };
  const newTask = () =>
    setModal({
      type: "task",
      task: {
        id: crypto.randomUUID(),
        title: "",
        project: projectFilter === "all" ? "rbc" : projectFilter,
        owner: "Júnior",
        due: data.date,
        status: "A fazer",
        priority: daily.length < 3,
        nextAction: "",
        evidence: "",
        checklist: [],
      },
      isNew: true,
    });
  const taskOpen = (task) => setModal({ type: "task", task });
  const recordOpen = () => setModal({ type: "record" });

  return (
    <div className="app-shell">
      <aside
        id="sidebar"
        ref={sidebarRef}
        className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}
      >
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("dashboard");
          }}
          aria-label="Júnior Gestão, painel inicial"
        >
          <span className="brand-mark">
            j<span />
          </span>
          <span className="brand-name">
            júnior<span>gestão</span>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        >
          <X size={22} />
        </button>
        <div className="workspace-label">SEU ESPAÇO</div>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => go(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "rbc" ? (
                <span className="nav-tag">BASE</span>
              ) : page === id ? (
                <span className="nav-dot" />
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">
          SUAS FRENTES <span>6</span>
        </div>
        <nav className="fronts-nav" aria-label="Frentes de trabalho">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => go("projects", p.id)}
              className={
                page === "projects" && projectFilter === p.id ? "selected" : ""
              }
            >
              <span className="front-dot" style={{ background: p.color }} />
              {p.name}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span>
              <Sparkles size={16} /> MENOS DISPERSÃO
            </span>
            <p>
              Uma próxima ação.
              <br />
              Um avanço de cada vez.
            </p>
            <div className="note-decoration">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <button
            className="help-link"
            onClick={() => setModal({ type: "help" })}
          >
            <CircleHelp size={18} />
            Como usar o Júnior Gestão
            <ArrowUpRight size={15} />
          </button>
          <div className="profile">
            <Avatar name="Júnior Rosivaldo" />
            <div>
              <strong>Júnior Rosivaldo</strong>
              <span>Meu espaço pessoal</span>
            </div>
            <span className="profile-status" />
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="menu-scrim"
          aria-label="Fechar menu lateral"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="main-shell" inert={mobileMenu}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Abrir menu"
              aria-expanded={mobileMenu}
              aria-controls="sidebar"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={23} />
            </button>
            <span>Meu espaço</span>
            <ChevronRight size={14} />
            <strong>{navTitle}</strong>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Buscar tarefas e responsáveis"
                placeholder="Buscar algo no seu espaço..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Limpar busca" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
              <span className="search-hint">BUSCAR</span>
            </label>
            <button
              className="icon-button pending-shortcut"
              aria-label={`Ver ${waiting.length} pendências aguardando`}
              onClick={() => {
                go("projects");
                setStatusFilter("Aguardando");
              }}
            >
              <Clock3 size={20} />
              <span className="notification-dot" />
            </button>
            <span className="topbar-separator" />
            <Avatar name="Júnior Rosivaldo" />
          </div>
        </header>
        <main id="main-content">
          <div className="demo-strip">
            <span>
              <span className="demo-dot" />
              ESPAÇO DE DEMONSTRAÇÃO
            </span>
            <p>
              Um ponto de partida para a sua organização. Dados ilustrativos.
            </p>
            <button onClick={() => setModal({ type: "help" })}>
              Saiba mais <ArrowUpRight size={13} />
            </button>
          </div>
          {storageError && (
            <div className="storage-warning" role="alert">
              {storageError}
              <button onClick={exportData}>Exportar dados</button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "dashboard"
                  ? "CLAREZA PARA O QUE IMPORTA"
                  : page === "rbc"
                    ? "DA ORGANIZAÇÃO À OPERAÇÃO"
                    : "UM PASSO DE CADA VEZ"}
              </div>
              <h1>
                {page === "dashboard"
                  ? "Seu dia, com direção."
                  : page === "projects"
                    ? "Cada frente, um próximo passo."
                    : page === "checklists"
                      ? "Pequenos passos. Avanços reais."
                      : page === "records"
                        ? "O que avançou fica registrado."
                        : "RBC Motores."}
              </h1>
              <p>
                {page === "dashboard"
                  ? "Escolha o essencial, acompanhe suas frentes e avance com constância."
                  : page === "projects"
                    ? "Seis frentes conectadas. Uma lista para manter tudo à vista."
                    : page === "checklists"
                      ? "Transforme uma entrega grande em ações que cabem no seu dia."
                      : page === "records"
                        ? "Guarde decisões, resultados e o primeiro passo de amanhã."
                        : "Uma base para acompanhar a produção, os processos e a equipe."}
              </p>
            </div>
            <button
              className="button primary heading-button"
              onClick={page === "records" ? recordOpen : newTask}
            >
              <Plus size={18} />
              {page === "records" ? "Novo registro" : "Nova tarefa"}
            </button>
          </div>

          {query && (
            <section className="search-results panel">
              <div className="section-heading">
                <h2>
                  Resultados para “{query}”{" "}
                  <span className="count">
                    {data.tasks.filter((t) => matches(t, query)).length}
                  </span>
                </h2>
                <button className="text-button" onClick={() => setQuery("")}>
                  Limpar busca
                </button>
              </div>
              <div className="task-list">
                {data.tasks
                  .filter((t) => matches(t, query))
                  .map((t) => (
                    <TaskRow task={t} key={t.id} open={taskOpen} />
                  ))}
                {!data.tasks.some((t) => matches(t, query)) && (
                  <Empty
                    icon={Search}
                    title="Nenhuma tarefa encontrada"
                    text="Tente o nome de uma frente, tarefa ou responsável."
                  />
                )}
              </div>
            </section>
          )}

          {page === "dashboard" && (
            <>
              <section className="focus-banner">
                <div className="focus-content">
                  <div className="focus-label">
                    <Sun size={16} />
                    UM DIA DE CADA VEZ
                  </div>
                  <h2>
                    Menos na lista.
                    <br />
                    <span>Mais no que importa.</span>
                  </h2>
                  <p>
                    Até três entregas hoje. Os pequenos hábitos
                    <br className="desktop-break" /> ajudam a manter o restante
                    em movimento.
                  </p>
                </div>
                <div className="focus-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <span className="art-dot art-dot-one" />
                  <span className="art-dot art-dot-two" />
                  <div className="art-card">
                    <span className="art-check">
                      <Check size={28} strokeWidth={3} />
                    </span>
                    <div className="art-line" />
                    <div className="art-line short" />
                    <div className="art-ticks">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                  <span className="art-spark">
                    <Sparkles size={22} />
                  </span>
                </div>
                <div className="day-progress">
                  <div className="date-controls">
                    <button
                      aria-label="Dia anterior"
                      onClick={() => changeDay(-1)}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <label className="date-label">
                      <CalendarDays size={15} />
                      <span>{shortDate(data.date)}</span>
                      <input
                        type="date"
                        aria-label="Data do painel"
                        value={data.date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </label>
                    <button
                      aria-label="Próximo dia"
                      onClick={() => changeDay(1)}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                  <div
                    className="day-ring"
                    style={{
                      "--progress": `${daily.length ? (completed / daily.length) * 100 : 0}%`,
                    }}
                  >
                    <div>
                      <strong>
                        {completed}
                        <span>/{daily.length}</span>
                      </strong>
                      <small>entregas feitas</small>
                    </div>
                  </div>
                  <p>
                    {fullDate(data.date).split(",")[0]}
                    <span>
                      {dateObject(data.date).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </p>
                </div>
              </section>
              <section className="priorities-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      <Target size={20} />
                      As três prioridades de hoje{" "}
                      <span className="count">{daily.length}/3</span>
                    </h2>
                    <p>
                      Uma entrega concreta, um responsável e um próximo passo.
                    </p>
                  </div>
                  <span className="muted section-aside">
                    {fullDate(data.date)}
                  </span>
                </div>
                <div className="priority-grid">
                  {daily.map((t, index) => (
                    <PriorityCard
                      key={t.id}
                      task={t}
                      index={index}
                      open={taskOpen}
                    />
                  ))}
                  {Array.from(
                    { length: Math.max(0, 3 - daily.length) },
                    (_, i) => (
                      <button
                        key={i}
                        className="priority-placeholder"
                        onClick={newTask}
                      >
                        <span>
                          <Plus size={23} />
                        </span>
                        <strong>Escolher uma entrega</strong>
                        <p>O que merece sua atenção hoje?</p>
                      </button>
                    ),
                  )}
                </div>
              </section>
              <div className="dashboard-columns">
                <div className="dashboard-left">
                  <section className="panel projects-panel">
                    <div className="section-heading">
                      <div>
                        <h2>
                          Suas frentes <span className="count">6</span>
                        </h2>
                        <p>Cada projeto no seu ritmo.</p>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => go("projects")}
                      >
                        Ver projetos <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="front-grid">
                      {projects.map((p) => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          tasks={data.tasks.filter((t) => t.project === p.id)}
                          open={() => go("projects", p.id)}
                        />
                      ))}
                    </div>
                  </section>
                  <section className="panel waiting-panel">
                    <div className="section-heading">
                      <div>
                        <h2>
                          <Clock3 size={19} />
                          Aguardando um próximo passo{" "}
                          <span className="count amber">{waiting.length}</span>
                        </h2>
                        <p>Pendências com dono e data de retorno.</p>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => {
                          go("projects");
                          setStatusFilter("Aguardando");
                        }}
                      >
                        Ver todas <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="waiting-list">
                      {waiting.slice(0, 3).map((t) => (
                        <button
                          className="waiting-row"
                          key={t.id}
                          onClick={() => taskOpen(t)}
                        >
                          <span className="waiting-symbol">
                            <Clock3 size={17} />
                          </span>
                          <div>
                            <strong>{t.title}</strong>
                            <p>{t.owner}</p>
                          </div>
                          <span className="waiting-date">
                            Rever em<strong>{shortDate(t.due)}</strong>
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                      {!waiting.length && (
                        <Empty
                          title="Tudo em movimento"
                          text="Nenhuma tarefa está aguardando uma resposta."
                        />
                      )}
                    </div>
                  </section>
                </div>
                <div className="dashboard-right">
                  <section className="panel habits-panel">
                    <div className="section-heading">
                      <div>
                        <h2>
                          Pequenos hábitos{" "}
                          <span className="habit-count">
                            {dailyHabits.length}/{habits.length}
                          </span>
                        </h2>
                        <p>Constância vale mais que intensidade.</p>
                      </div>
                    </div>
                    <div className="habit-progress">
                      <div
                        style={{
                          width: `${(dailyHabits.length / habits.length) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="habits-list">
                      {habits.map((h) => {
                        const Icon = icons[h.icon];
                        const done = dailyHabits.includes(h.id);
                        return (
                          <button
                            key={h.id}
                            className={`habit ${done ? "habit-done" : ""}`}
                            aria-pressed={done}
                            onClick={() => {
                              commit((s) => {
                                const current = s.habits[s.date] || [];
                                return {
                                  ...s,
                                  habits: {
                                    ...s.habits,
                                    [s.date]: done
                                      ? current.filter((id) => id !== h.id)
                                      : [...current, h.id],
                                  },
                                };
                              });
                            }}
                          >
                            <span className="habit-icon">
                              <Icon size={18} />
                            </span>
                            <span className="habit-text">
                              <strong>{h.title}</strong>
                              <small>{h.detail}</small>
                            </span>
                            <span className="habit-time">{h.time}</span>
                            <span className="checkbox">
                              {done && <Check size={13} strokeWidth={3} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="habits-total">
                      <Clock3 size={14} />
                      <span>60 min distribuídos ao longo do dia</span>
                    </div>
                  </section>
                  <section className="closing-card">
                    <span className="closing-icon">
                      <FileText size={23} />
                    </span>
                    <div className="eyebrow">FECHAR O DIA COM CLAREZA</div>
                    <h2>O que você avançou hoje?</h2>
                    <p>
                      Registre um resultado, um bloqueio
                      <br />
                      ou por onde começar amanhã.
                    </p>
                    <button onClick={recordOpen}>
                      Fazer um registro <ArrowRight size={17} />
                    </button>
                  </section>
                  <div className="week-note">
                    <span>
                      <CalendarDays size={18} />
                    </span>
                    <p>
                      <strong>Domingo é dia de revisão.</strong>20 minutos para
                      ajustar a rota e preparar a próxima semana.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {page === "projects" && (
            <>
              <div className="project-tabs" aria-label="Filtrar por frente">
                <button
                  className={projectFilter === "all" ? "selected" : ""}
                  onClick={() => setProjectFilter("all")}
                >
                  Todas as frentes <span>6</span>
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    className={projectFilter === p.id ? "selected" : ""}
                    onClick={() => setProjectFilter(p.id)}
                  >
                    <span
                      className="front-dot"
                      style={{ background: p.color }}
                    />
                    {p.short}
                  </button>
                ))}
              </div>
              {projectFilter !== "all" && (
                <div className="project-detail-banner">
                  <ProjectIcon project={projectById(projectFilter)} size={28} />
                  <div>
                    <h2>{projectById(projectFilter).name}</h2>
                    <p>{projectById(projectFilter).description}</p>
                  </div>
                  <span>
                    {
                      data.tasks.filter(
                        (t) =>
                          t.project === projectFilter &&
                          t.status !== "Concluído",
                      ).length
                    }{" "}
                    tarefas abertas
                  </span>
                </div>
              )}
              {projectFilter === "all" && (
                <div className="projects-overview">
                  {projects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      tasks={data.tasks.filter((t) => t.project === p.id)}
                      open={() => setProjectFilter(p.id)}
                    />
                  ))}
                </div>
              )}
              <section className="panel">
                <div className="section-heading">
                  <h2>
                    Lista central de tarefas{" "}
                    <span className="count">{filteredTasks.length}</span>
                  </h2>
                  <label className="filter-select">
                    <span className="sr-only">Filtrar situação</span>
                    <select
                      aria-label="Filtrar situação"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Todas as situações</option>
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} />
                  </label>
                </div>
                <div className="task-list">
                  {filteredTasks.map((t) => (
                    <TaskRow key={t.id} task={t} open={taskOpen} />
                  ))}
                  {!filteredTasks.length && (
                    <Empty
                      title="Uma lista com espaço para começar"
                      text="Crie uma tarefa ou escolha outra situação para ver suas entregas."
                    >
                      <button className="button primary" onClick={newTask}>
                        <Plus size={16} />
                        Nova tarefa
                      </button>
                    </Empty>
                  )}
                </div>
              </section>
            </>
          )}

          {page === "checklists" && (
            <>
              <div className="info-callout">
                <ListChecks size={20} />
                <p>
                  Marcar etapas mostra progresso. Para concluir a entrega,
                  registre também uma evidência.
                </p>
              </div>
              <div className="checklist-grid">
                {filteredTasks
                  .filter((t) => t.checklist.length)
                  .map((t) => {
                    const project = projectById(t.project);
                    const progress = percentage(t.checklist);
                    return (
                      <button
                        className="panel checklist-card"
                        key={t.id}
                        onClick={() => taskOpen(t)}
                      >
                        <div className="card-top">
                          <ProjectIcon project={project} />
                          <span
                            className="project-label"
                            style={{
                              color: project.textColor || project.color,
                            }}
                          >
                            {project.name}
                          </span>
                          <ArrowUpRight size={17} />
                        </div>
                        <h2>{t.title}</h2>
                        <p>{t.owner}</p>
                        <ul>
                          {t.checklist.slice(0, 3).map((step) => (
                            <li
                              key={step.id}
                              className={step.done ? "checked" : ""}
                            >
                              <span className="checkbox">
                                {step.done && <Check size={12} />}
                              </span>
                              {step.text}
                            </li>
                          ))}
                        </ul>
                        <div className="checklist-footer">
                          <span>
                            {t.checklist.filter((i) => i.done).length} de{" "}
                            {t.checklist.length} etapas
                          </span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="progress-track">
                          <div
                            style={{
                              width: `${progress}%`,
                              background: project.color,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
              </div>
              {!filteredTasks.some((t) => t.checklist.length) && (
                <Empty
                  title="Nenhum checklist encontrado"
                  text="Adicione etapas ao criar ou editar uma tarefa."
                />
              )}
            </>
          )}

          {page === "records" && (
            <>
              <div className="records-toolbar">
                <label className="date-field">
                  Data dos registros
                  <input
                    aria-label="Data dos registros"
                    type="date"
                    value={data.date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <button className="button secondary" onClick={exportData}>
                  <ArrowDownToLine size={16} />
                  Exportar dados
                </button>
              </div>
              <section className="panel records-panel">
                <div className="section-heading">
                  <div>
                    <h2>
                      Diário de avanços{" "}
                      <span className="count">
                        {
                          data.records.filter((r) => r.date === data.date)
                            .length
                        }
                      </span>
                    </h2>
                    <p>{fullDate(data.date)}</p>
                  </div>
                  <span className="local-badge">
                    <ShieldCheck size={14} />
                    Neste dispositivo
                  </span>
                </div>
                {data.records.filter((r) => r.date === data.date).length ? (
                  <div className="records-list">
                    {data.records
                      .filter((r) => r.date === data.date)
                      .slice()
                      .reverse()
                      .map((r) => (
                        <article className="record" key={r.id}>
                          <span className="record-icon">
                            <FileText size={19} />
                          </span>
                          <div>
                            <div className="record-meta">
                              <span>{r.kind}</span>
                              <span>·</span>
                              <span>{projectById(r.project).name}</span>
                              <span>·</span>
                              <time>{shortDate(r.date)}</time>
                            </div>
                            <h3>{r.title}</h3>
                            <p>{r.body}</p>
                            {r.tomorrow && (
                              <div className="tomorrow">
                                <ArrowRight size={14} />
                                <strong>Próximo passo:</strong> {r.tomorrow}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                  </div>
                ) : (
                  <Empty
                    icon={FileText}
                    title="Seu avanço merece um registro."
                    text="Uma decisão, um resultado ou um bloqueio: comece pelo que aconteceu de verdade."
                  >
                    <button className="button primary" onClick={recordOpen}>
                      <Plus size={16} />
                      Criar primeiro registro
                    </button>
                  </Empty>
                )}
              </section>
              <div className="info-callout">
                <ShieldCheck size={20} />
                <p>
                  Os registros ficam salvos apenas neste navegador. Exporte seus
                  dados para manter uma cópia. Compartilhamento e sincronização
                  ficam para uma próxima etapa.
                </p>
              </div>
            </>
          )}

          {page === "rbc" && (
            <>
              <section className="rbc-banner">
                <span className="rbc-logo">
                  <Factory size={31} />
                </span>
                <div>
                  <span className="eyebrow">
                    RBC MOTORES · BASE DE ADAPTAÇÃO
                  </span>
                  <h2>O processo ganha visibilidade.</h2>
                  <p>
                    Ordens de serviço, três fotos por processo e treinamento na
                    prática.
                  </p>
                </div>
                <span className="rbc-badge">Protótipo local</span>
              </section>
              <div className="rbc-metrics">
                <div>
                  <span>
                    <Factory size={20} />
                  </span>
                  <p>
                    Ordens de demonstração
                    <strong>
                      {data.orders.length.toString().padStart(2, "0")}
                    </strong>
                  </p>
                </div>
                <div>
                  <span>
                    <Camera size={20} />
                  </span>
                  <p>
                    Fotos registradas
                    <strong>
                      {data.orders
                        .reduce((n, o) => n + Object.keys(o.photos).length, 0)
                        .toString()
                        .padStart(2, "0")}
                    </strong>
                  </p>
                </div>
                <div>
                  <span>
                    <ClipboardCheck size={20} />
                  </span>
                  <p>
                    Treinamentos concluídos
                    <strong>
                      {data.orders
                        .filter(
                          (o) => o.training.length === trainingSteps.length,
                        )
                        .length.toString()
                        .padStart(2, "0")}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="section-heading">
                <div>
                  <h2>Ordens de serviço</h2>
                  <p>Exemplos para testar a organização da operação.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => go("projects", "rbc")}
                >
                  Ver tarefas RBC <ArrowRight size={15} />
                </button>
              </div>
              <div className="orders-grid">
                {data.orders
                  .filter((o) =>
                    `${o.id} ${o.customer} ${o.equipment} ${o.owner}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((o) => (
                    <button
                      className="panel order-card"
                      key={o.id}
                      onClick={() => setModal({ type: "order", id: o.id })}
                    >
                      <div className="card-top">
                        <span className="order-number">OS {o.id}</span>
                        <span className="order-stage">{o.stage}</span>
                      </div>
                      <h2>{o.equipment}</h2>
                      <p>
                        {o.customer} <span>·</span> {o.owner}
                      </p>
                      <div className="order-note">
                        <Clock3 size={15} />
                        {o.note}
                      </div>
                      <div className="photo-steps">
                        {["Antes", "Processo", "Final"].map((stage) => (
                          <div
                            key={stage}
                            className={o.photos[stage] ? "has-photo" : ""}
                          >
                            {o.photos[stage] ? (
                              <Check size={16} />
                            ) : (
                              <Camera size={16} />
                            )}
                            <span>{stage}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <span>
                          <ListChecks size={15} />
                          {o.training.length}/{trainingSteps.length} etapas de
                          treinamento
                        </span>
                        <ArrowUpRight size={17} />
                      </div>
                    </button>
                  ))}
              </div>
              <div className="info-callout">
                <ShieldCheck size={20} />
                <p>
                  Esta área prepara a adaptação à RBC. OS e etapas são
                  demonstrativas, não um controle de produção validado. Fotos
                  adicionadas ficam apenas neste dispositivo.
                </p>
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>
              <span className="footer-dot" />
              Júnior Gestão
            </span>
            <p>Organizar para avançar. Cuidar para continuar.</p>
            <span className="footer-local">
              <ShieldCheck size={13} />
              Dados locais
            </span>
          </footer>
        </main>
      </div>
      <nav
        className="mobile-nav"
        inert={mobileMenu}
        aria-label="Navegação no celular"
      >
        {navItems.map(({ id, mobile, icon: Icon }) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            aria-current={page === id ? "page" : undefined}
            onClick={() => go(id)}
          >
            <Icon size={20} />
            <span>{mobile}</span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <CheckCheck size={18} />
          {toast}
          <button aria-label="Fechar aviso" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {modal?.type === "task" && (
        <TaskModal
          task={modal.task}
          isNew={modal.isNew}
          tasks={data.tasks}
          save={saveTask}
          close={() => setModal(null)}
        />
      )}
      {modal?.type === "record" && (
        <RecordModal
          date={data.date}
          close={() => setModal(null)}
          save={(record) => {
            const saved = commit((s) => ({
              ...s,
              records: [...s.records, record],
            }));
            setModal(null);
            if (saved) notify("Registro salvo neste dispositivo.");
          }}
        />
      )}
      {modal?.type === "order" && (
        <OrderModal
          order={data.orders.find((o) => o.id === modal.id)}
          close={() => setModal(null)}
          update={(order) => {
            const saved = commit((s) => ({
              ...s,
              orders: s.orders.map((o) => (o.id === order.id ? order : o)),
            }));
            if (saved) notify("Ordem atualizada neste dispositivo.");
          }}
        />
      )}
      {modal?.type === "help" && (
        <Modal
          title="Clareza para avançar."
          eyebrow="BEM-VINDO AO JÚNIOR GESTÃO"
          close={() => setModal(null)}
        >
          <div className="help-content">
            <p>
              Este é um espaço de demonstração inspirado no Plano de Foco de
              13/10/2026. As datas, responsáveis e tarefas iniciais são exemplos
              editáveis, não confirmações de execução.
            </p>
            <ol>
              <li>
                <strong>Escolha até três prioridades.</strong> Defina a entrega,
                o responsável e a primeira ação para a data do painel.
              </li>
              <li>
                <strong>Divida em etapas.</strong> Use os checklists. Para
                concluir uma tarefa, registre uma evidência.
              </li>
              <li>
                <strong>Deixe os bloqueios visíveis.</strong> A situação
                “Aguardando” mantém responsável, próxima ação e data de retorno.
              </li>
              <li>
                <strong>Cuide da constância.</strong> Os hábitos são separados
                por dia. Registre avanços e revise a semana.
              </li>
            </ol>
            <div className="info-callout">
              <ShieldCheck size={21} />
              <p>
                Dados salvos no navegador, sem conta ou sincronização. A
                exportação JSON guarda uma cópia; a importação ainda não está
                disponível. A área RBC é uma base para futura adaptação.
              </p>
            </div>
            <button className="button secondary" onClick={exportData}>
              <ArrowDownToLine size={16} />
              Exportar meus dados
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PriorityCard({ task, index, open }) {
  const project = projectById(task.project);
  const progress = percentage(task.checklist);
  return (
    <button
      className={`priority-card ${task.status === "Concluído" ? "priority-done" : ""}`}
      onClick={() => open(task)}
      style={{ "--project-color": project.color }}
    >
      <div className="card-top">
        <span className="priority-number">0{index + 1}</span>
        <span className="priority-project">
          <span className="front-dot" style={{ background: project.color }} />
          {project.name}
        </span>
        <ArrowUpRight size={17} />
      </div>
      <h3>{task.title}</h3>
      <p className="priority-next">{task.nextAction}</p>
      <div className="priority-owner">
        <Avatar name={task.owner} />
        <span>{task.owner}</span>
      </div>
      <div className="priority-bottom">
        <Status status={task.status} />
        <span>
          <ListChecks size={14} />
          {task.checklist.filter((i) => i.done).length}/{task.checklist.length}
        </span>
      </div>
      <div className="progress-track">
        <div
          style={{ width: `${task.status === "Concluído" ? 100 : progress}%` }}
        />
      </div>
    </button>
  );
}
function ProjectCard({ project, tasks, open }) {
  const done = tasks.filter((t) => t.status === "Concluído").length;
  return (
    <button className="front-card" onClick={open}>
      <div className="front-card-top">
        <ProjectIcon project={project} />
        <ArrowUpRight size={15} />
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className="front-card-bottom">
        <span>
          {tasks.length - done}{" "}
          {tasks.length - done === 1 ? "tarefa aberta" : "tarefas abertas"}
        </span>
        <span className="avatar-stack">
          {project.people.map((name, index) => (
            <Avatar key={name} name={name} tone={index} />
          ))}
        </span>
      </div>
      <div className="progress-track">
        <div
          style={{
            width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`,
            background: project.color,
          }}
        />
      </div>
    </button>
  );
}
function TaskRow({ task, open }) {
  const project = projectById(task.project);
  return (
    <button className="task-row" onClick={() => open(task)}>
      <ProjectIcon project={project} />
      <div className="task-row-text">
        <strong>
          {task.title}
          {task.priority && <Flag size={12} aria-label="Prioridade" />}
        </strong>
        <p>
          {project.name} <span>·</span> {task.owner}
        </p>
      </div>
      <Status status={task.status} />
      <span className="task-row-date">
        <CalendarDays size={14} />
        {shortDate(task.due)}
      </span>
      <ChevronRight size={16} />
    </button>
  );
}

function TaskModal({ task, isNew, tasks, save, close }) {
  const [draft, setDraft] = useState(() => structuredClone(task));
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const field = (name, value) => setDraft((s) => ({ ...s, [name]: value }));
  function submit(e) {
    e.preventDefault();
    if (
      draft.priority &&
      tasks.filter(
        (t) => t.id !== draft.id && t.priority && t.due === draft.due,
      ).length >= 3
    ) {
      setError(
        "Esta data já tem três prioridades. Desmarque “Prioridade do dia” ou escolha outra data.",
      );
      return;
    }
    if (draft.status === "Concluído" && !draft.evidence.trim()) {
      setError("Registre uma evidência antes de concluir a tarefa.");
      return;
    }
    if (
      ![draft.title, draft.owner, draft.nextAction, draft.due].every((v) =>
        v.trim(),
      )
    ) {
      setError("Preencha a entrega, o responsável, a data e o próximo passo.");
      return;
    }
    save({
      ...draft,
      title: draft.title.trim(),
      owner: draft.owner.trim(),
      nextAction: draft.nextAction.trim(),
      evidence: draft.evidence.trim(),
    });
  }
  function addStep() {
    if (!step.trim()) return;
    field("checklist", [
      ...draft.checklist,
      { id: crypto.randomUUID(), text: step.trim(), done: false },
    ]);
    setStep("");
  }
  return (
    <Modal
      title={isNew ? "Uma nova entrega." : "Uma entrega, um próximo passo."}
      eyebrow={
        isNew ? "NOVA TAREFA" : projectById(draft.project).name.toUpperCase()
      }
      close={close}
      wide
    >
      <form className="edit-form" onSubmit={submit}>
        <label>
          O que precisa ser entregue?
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => field("title", e.target.value)}
            placeholder="Uma entrega concreta e possível"
            required
            maxLength={160}
          />
        </label>
        <div className="form-row">
          <label>
            Frente
            <select
              value={draft.project}
              onChange={(e) => field("project", e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Situação
            <select
              aria-label="Situação"
              value={draft.status}
              onChange={(e) => field("status", e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Responsável
            <input
              value={draft.owner}
              onChange={(e) => field("owner", e.target.value)}
              required
              maxLength={100}
            />
          </label>
          <label>
            {draft.status === "Aguardando"
              ? "Data de retorno"
              : "Data da entrega"}
            <input
              type="date"
              value={draft.due}
              onChange={(e) => field("due", e.target.value)}
              required
            />
          </label>
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={draft.priority}
            onChange={(e) => field("priority", e.target.checked)}
          />
          <span>
            <strong>Prioridade do dia</strong>
            <small>Até três entregas para a data escolhida.</small>
          </span>
        </label>
        <label>
          {draft.status === "Aguardando"
            ? "O que falta e quem destrava?"
            : "Qual é o próximo passo?"}
          <textarea
            value={draft.nextAction}
            onChange={(e) => field("nextAction", e.target.value)}
            placeholder="Deixe a primeira ação clara."
            required
            rows={2}
            maxLength={800}
          />
        </label>
        <div className="form-checklist">
          <div className="section-heading">
            <h3>
              <ListChecks size={17} />
              Checklist da entrega
            </h3>
            <span>
              {draft.checklist.filter((i) => i.done).length}/
              {draft.checklist.length}
            </span>
          </div>
          {draft.checklist.map((item) => (
            <div className="edit-step" key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) =>
                    field(
                      "checklist",
                      draft.checklist.map((i) =>
                        i.id === item.id ? { ...i, done: e.target.checked } : i,
                      ),
                    )
                  }
                />
                <span className={item.done ? "line-through" : ""}>
                  {item.text}
                </span>
              </label>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remover etapa: ${item.text}`}
                onClick={() =>
                  field(
                    "checklist",
                    draft.checklist.filter((i) => i.id !== item.id),
                  )
                }
              >
                <X size={15} />
              </button>
            </div>
          ))}
          <div className="add-step">
            <input
              aria-label="Nova etapa do checklist"
              value={step}
              onChange={(e) => setStep(e.target.value)}
              placeholder="Adicionar uma pequena etapa..."
              maxLength={200}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addStep();
                }
              }}
            />
            <button
              type="button"
              className="button secondary"
              onClick={addStep}
              disabled={!step.trim()}
            >
              <Plus size={17} />
              Adicionar
            </button>
          </div>
        </div>
        <label>
          Evidência de conclusão{" "}
          {draft.status !== "Concluído" && (
            <span className="optional">(ao concluir)</span>
          )}
          <textarea
            value={draft.evidence}
            onChange={(e) => field("evidence", e.target.value)}
            required={draft.status === "Concluído"}
            placeholder="Qual registro, documento ou resultado comprova a entrega?"
            rows={2}
            maxLength={1500}
          />
        </label>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-footer">
          <span>
            <ShieldCheck size={14} />
            Salvo neste dispositivo
          </span>
          <div>
            <button type="button" className="button secondary" onClick={close}>
              Cancelar
            </button>
            <button type="submit" className="button primary">
              <Check size={17} />
              Salvar tarefa
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
function RecordModal({ date, close, save }) {
  const [draft, setDraft] = useState({
    id: crypto.randomUUID(),
    date,
    kind: "Avanço",
    project: "rbc",
    title: "",
    body: "",
    tomorrow: "",
  });
  const field = (name, value) => setDraft((s) => ({ ...s, [name]: value }));
  return (
    <Modal
      title="Guarde o que aconteceu."
      eyebrow="NOVO REGISTRO"
      close={close}
    >
      <form
        className="edit-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.title.trim() && draft.body.trim())
            save({
              ...draft,
              title: draft.title.trim(),
              body: draft.body.trim(),
              tomorrow: draft.tomorrow.trim(),
            });
        }}
      >
        <div className="form-row">
          <label>
            Data
            <input
              type="date"
              value={draft.date}
              onChange={(e) => field("date", e.target.value)}
              required
            />
          </label>
          <label>
            Tipo de registro
            <select
              value={draft.kind}
              onChange={(e) => field("kind", e.target.value)}
            >
              {["Avanço", "Decisão", "Bloqueio", "Fechamento do dia"].map(
                (kind) => (
                  <option key={kind}>{kind}</option>
                ),
              )}
            </select>
          </label>
        </div>
        <label>
          Frente
          <select
            value={draft.project}
            onChange={(e) => field("project", e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Título
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => field("title", e.target.value)}
            placeholder="O que merece ficar registrado?"
            required
            maxLength={160}
          />
        </label>
        <label>
          O que aconteceu?
          <textarea
            value={draft.body}
            onChange={(e) => field("body", e.target.value)}
            placeholder="Descreva o resultado, a decisão ou o que impediu o avanço."
            rows={4}
            required
            maxLength={3000}
          />
        </label>
        <label>
          Amanhã começo por <span className="optional">(opcional)</span>
          <input
            value={draft.tomorrow}
            onChange={(e) => field("tomorrow", e.target.value)}
            placeholder="Um próximo passo possível"
            maxLength={300}
          />
        </label>
        <div className="modal-footer">
          <span>
            <ShieldCheck size={14} />
            Registro local
          </span>
          <div>
            <button className="button secondary" type="button" onClick={close}>
              Cancelar
            </button>
            <button className="button primary" type="submit">
              <Check size={16} />
              Salvar registro
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
function OrderModal({ order, close, update }) {
  const [tab, setTab] = useState("photos");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const latest = useRef(order);
  latest.current = order;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function upload(stage, file) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("Escolha uma imagem JPG, PNG ou WebP de até 2 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      // Reduce local storage usage without changing the original uploaded file.
      const image = new Image();
      image.src = result;
      await image.decode();
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas
        .getContext("2d")
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      if (mounted.current)
        update({
          ...latest.current,
          photos: {
            ...latest.current.photos,
            [stage]: {
              src: canvas.toDataURL("image/jpeg", 0.72),
              name: file.name,
            },
          },
        });
    } catch {
      if (mounted.current)
        setError("Não foi possível ler esta imagem. Tente outro arquivo.");
    } finally {
      if (mounted.current) setUploading(false);
    }
  }
  return (
    <Modal
      title={`OS ${order.id} · ${order.equipment}`}
      eyebrow={`${order.customer} · DEMONSTRAÇÃO`}
      close={close}
      wide
    >
      <div className="order-modal-body">
        <div className="order-summary">
          <span className="order-stage">{order.stage}</span>
          <span>{order.owner}</span>
          <p>{order.note}</p>
        </div>
        <div className="modal-tabs">
          <button
            className={tab === "photos" ? "selected" : ""}
            onClick={() => setTab("photos")}
          >
            <Camera size={17} />
            Fotos do processo
          </button>
          <button
            className={tab === "training" ? "selected" : ""}
            onClick={() => setTab("training")}
          >
            <ClipboardCheck size={17} />
            Treinamento
          </button>
        </div>
        {tab === "photos" ? (
          <>
            <p className="modal-description">
              Três momentos para tornar o processo visível: antes, durante e
              depois.
            </p>
            <div className="photo-upload-grid">
              {["Antes", "Processo", "Final"].map((stage, index) => (
                <div className="photo-upload" key={stage}>
                  <span className="photo-stage">
                    0{index + 1} <strong>{stage}</strong>
                  </span>
                  {order.photos[stage] ? (
                    <>
                      <img
                        src={order.photos[stage].src}
                        alt={`OS ${order.id}: ${stage.toLowerCase()} do serviço`}
                      />
                      <p title={order.photos[stage].name}>
                        {order.photos[stage].name}
                      </p>
                      <button
                        className="text-button danger"
                        onClick={() => {
                          const photos = { ...order.photos };
                          delete photos[stage];
                          update({ ...order, photos });
                        }}
                      >
                        Remover foto
                      </button>
                    </>
                  ) : (
                    <div className="photo-empty">
                      <Camera size={30} />
                      <span>Ainda sem foto</span>
                    </div>
                  )}
                  <label
                    className={`button secondary upload-button ${uploading ? "disabled" : ""}`}
                  >
                    <Plus size={15} />
                    {uploading
                      ? "Processando…"
                      : order.photos[stage]
                        ? "Trocar foto"
                        : "Adicionar foto"}
                    <input
                      type="file"
                      aria-label={`Adicionar foto: ${stage}`}
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      onChange={(e) => {
                        upload(stage, e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
            <p className="muted upload-note">
              JPG, PNG ou WebP · até 2 MB por arquivo · cópias reduzidas salvas
              no navegador.
            </p>
          </>
        ) : (
          <>
            <p className="modal-description">
              Checklist de demonstração para acompanhar o treinamento de
              rebobinamento. A aplicação real exige a validação do responsável
              técnico.
            </p>
            <div className="training-progress">
              <strong>
                {order.training.length}/{trainingSteps.length} etapas conferidas
              </strong>
              <div className="progress-track">
                <div
                  style={{
                    width: `${(order.training.length / trainingSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="training-list">
              {trainingSteps.map((step, i) => (
                <label className="training-step" key={step}>
                  <input
                    type="checkbox"
                    checked={order.training.includes(i)}
                    onChange={(e) =>
                      update({
                        ...order,
                        training: e.target.checked
                          ? [...order.training, i]
                          : order.training.filter((n) => n !== i),
                      })
                    }
                  />
                  <span>
                    <small>ETAPA 0{i + 1}</small>
                    <strong>{step}</strong>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-footer">
          <span>
            <ShieldCheck size={14} />
            Dados locais · base de adaptação
          </span>
          <button className="button primary" onClick={close}>
            Concluir consulta
          </button>
        </div>
      </div>
    </Modal>
  );
}

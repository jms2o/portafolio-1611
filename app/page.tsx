import {
  ArrowDown,
  ArrowUpRight,
  Braces,
  CalendarClock,
  CloudCog,
  Code2,
  Database,
  Download,
  FileCheck2,
  GraduationCap,
  Link,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Sparkles,
  UsersRound,
  Wrench,
} from "lucide-react";
import { OrbitalScene } from "./orbital-scene";

const projects = [
  {
    id: "01",
    type: "Trámites digitales",
    title: "TramitexFederal",
    summary: "Plataforma con áreas separadas para clientes y personal, cinco flujos de trámite, documentos y seguimiento de estados.",
    result: "Roles, permisos, propiedad de recursos, recuperación segura y validaciones antes del despliegue.",
    stack: ["Next.js 16", "React 19", "PostgreSQL", "Prisma"],
    icon: FileCheck2,
    tone: "lime",
  },
  {
    id: "02",
    type: "Gestión clínica",
    title: "EndoCare",
    summary: "Panel para consultorio dental con agenda, pacientes, especialistas, finanzas y notas posteriores al procedimiento.",
    result: "Recordatorios automáticos por WhatsApp cinco y un día antes de cada cita.",
    stack: ["Agenda", "Roles", "Twilio", "WhatsApp"],
    icon: CalendarClock,
    tone: "blue",
  },
  {
    id: "03",
    type: "Streaming + voz",
    title: "Lector para TikTok Live",
    summary: "Aplicación que recibe comentarios del directo, muestra la conexión y convierte mensajes en voz durante la transmisión.",
    result: "Configuración segura, despliegue en Hostinger y validación con comentarios reales.",
    stack: ["JavaScript", "Euler Stream", "TTS"],
    icon: MessageSquareText,
    tone: "violet",
  },
  {
    id: "04",
    type: "Automatización + IA",
    title: "Agente de IA para video",
    summary: "Pipeline que convierte una idea en video corto mediante guion, síntesis de voz, fondos y subtítulos sincronizados.",
    result: "Menos edición manual y contenido adaptable a redes sociales.",
    stack: ["Node.js", "IA", "Multimedia"],
    icon: Sparkles,
    tone: "amber",
  },
  {
    id: "05",
    type: "Sistema administrativo",
    title: "CRM multi-oficina",
    summary: "CRM con roles, clientes, documentos, notas, pendientes, metas e historial de acciones para múltiples oficinas.",
    result: "Dashboards, indicadores, filtros y seguimiento operativo y de cobros.",
    stack: ["PHP", "JavaScript", "MySQL"],
    icon: Database,
    tone: "cyan",
  },
  {
    id: "06",
    type: "Marketplace",
    title: "ServiHogar",
    summary: "Plataforma que conecta clientes y profesionales mediante solicitudes, ofertas privadas, chat, estados y calificaciones.",
    result: "Autenticación por perfil y flujos reutilizables para ambos tipos de usuario.",
    stack: ["React", "Node.js", "Firestore"],
    icon: UsersRound,
    tone: "pink",
  },
];

const skillGroups = [
  { code: "A1", title: "Interfaces", icon: Braces, items: "React · Next.js · TypeScript · Tailwind CSS · UI responsive" },
  { code: "B2", title: "Servicios", icon: CloudCog, items: "Node.js · PHP · APIs REST · autenticación · arquitectura cliente-servidor" },
  { code: "C3", title: "Datos", icon: Database, items: "PostgreSQL · MySQL · Supabase · Firebase Firestore · Prisma" },
  { code: "D4", title: "IA y operación", icon: Wrench, items: "Python · IA aplicada · PLN · TTS · Git · Hostinger · Vercel · soporte TI" },
];

export default function Home() {
  return (
    <main>
      <div className="noise" aria-hidden="true" />

      <header className="nav-shell">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">JM<span>/26</span></a>
        <nav aria-label="Navegación principal">
          <a href="#perfil">Perfil</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#stack">Stack</a>
        </nav>
        <a className="nav-cta" href="#contacto">Contacto <ArrowUpRight size={15} /></a>
      </header>

      <section className="hero shell" id="inicio">
        <div className="hero-copy">
          <div className="status-line"><i /> Disponible para oportunidades junior <span>MX / REMOTO</span></div>
          <p className="hero-index">PORTAFOLIO PROFESIONAL — 2026</p>
          <h1>Joel<br /><span>Martínez</span></h1>
          <p className="hero-role">Desarrollo web <b>+</b> soporte TI <b>+</b> soluciones con IA</p>
          <p className="hero-intro">Construyo productos digitales completos: desde una interfaz clara hasta la lógica, los datos y el despliegue que los mantienen funcionando.</p>
          <div className="hero-actions">
            <a className="action primary" href="#proyectos">Explorar trabajo <ArrowDown size={17} /></a>
            <a className="action secondary" href="/CV_Joel_Martinez.pdf" download><Download size={17} /> Descargar CV</a>
          </div>
        </div>

        <OrbitalScene />

        <div className="hero-strip" aria-label="Resumen profesional">
          <div><span>01 / FORMACIÓN</span><strong>Ingeniería en Sistemas · UAS</strong></div>
          <div><span>02 / EXPERIENCIA</span><strong>Freelance desde 2023</strong></div>
          <div><span>03 / UBICACIÓN</span><strong>Mexicali, Baja California</strong></div>
        </div>
      </section>

      <section className="profile shell" id="perfil">
        <div className="section-code"><span>01</span><p>Perfil / sistema</p></div>
        <div className="profile-main">
          <p className="section-kicker">ENFOQUE DE TRABAJO</p>
          <h2>Pienso la interfaz, el flujo y la infraestructura como <em>un solo sistema.</em></h2>
          <div className="profile-grid">
            <p>Desarrollo soluciones de extremo a extremo: levanto requisitos, diseño experiencias responsive, conecto APIs y bases de datos, pruebo, despliego y doy soporte.</p>
            <div className="profile-data">
              <div><span>BASE</span><strong>JavaScript / TypeScript / SQL</strong></div>
              <div><span>OBJETIVO</span><strong>Desarrollo web Jr. · Soporte TI · Datos e IA</strong></div>
              <div><span>IDIOMAS</span><strong>Español nativo · Inglés intermedio</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="research shell" aria-labelledby="research-title">
        <div className="research-orbit" aria-hidden="true"><span>LUDICON</span></div>
        <div className="research-copy">
          <div className="section-code"><span>02</span><p>Investigación / 2026</p></div>
          <p className="section-kicker">PONENCIA ACADÉMICA</p>
          <h2 id="research-title">IA para recursos educativos personalizados con <em>supervisión docente.</em></h2>
          <p>Presenté una arquitectura que une contenido, procesamiento con IA y PLN, generación audiovisual y validación humana para adaptar recursos al nivel cognitivo del estudiante.</p>
          <div className="research-flow" aria-label="Flujo de la propuesta">
            <span>Contenido</span><i>→</i><span>IA + PLN</span><i>→</i><span>Multimedia</span><i>→</i><span>Validación</span>
          </div>
        </div>
      </section>

      <section className="projects shell" id="proyectos">
        <header className="projects-heading">
          <div className="section-code"><span>03</span><p>Archivo de proyectos</p></div>
          <div><p className="section-kicker">TRABAJO SELECCIONADO</p><h2>Seis soluciones construidas para <em>operar en el mundo real.</em></h2></div>
        </header>
        <div className="project-deck">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <article className={`project-module tone-${project.tone}`} key={project.title}>
                <div className="module-top">
                  <span className="module-id">{project.id}</span>
                  <span className="module-icon"><Icon size={23} strokeWidth={1.7} /></span>
                </div>
                <div className="module-copy">
                  <p className="module-type">{project.type}</p>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>
                <div className="module-result"><span>RESULTADO</span><p>{project.result}</p></div>
                <ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="stack-section" id="stack">
        <div className="shell">
          <header className="stack-heading">
            <div className="section-code light"><span>04</span><p>Capacidades</p></div>
            <h2>Herramientas para pasar de una idea a un <em>producto desplegado.</em></h2>
          </header>
          <div className="stack-grid">
            {skillGroups.map((group) => {
              const Icon = group.icon;
              return <article key={group.code}><div><span>{group.code}</span><Icon size={22} /></div><h3>{group.title}</h3><p>{group.items}</p></article>;
            })}
          </div>
        </div>
        <div className="marquee" aria-hidden="true"><div>REACT · NEXT.JS · TYPESCRIPT · NODE.JS · POSTGRESQL · PYTHON · IA APLICADA · SOPORTE TI · REACT · NEXT.JS · TYPESCRIPT · NODE.JS · POSTGRESQL · PYTHON · IA APLICADA · SOPORTE TI ·</div></div>
      </section>

      <section className="contact shell" id="contacto">
        <div className="contact-copy">
          <div className="section-code"><span>05</span><p>Contacto</p></div>
          <p className="section-kicker">SIGUIENTE MISIÓN</p>
          <h2>¿Tu equipo necesita construir, mejorar o automatizar algo? <em>Hablemos.</em></h2>
        </div>
        <div className="contact-console">
          <div className="console-bar"><span>CONTACT_CHANNEL.EXE</span><i /></div>
          <a href="mailto:joelmartinezs11.jm@gmail.com"><Mail size={18} /> joelmartinezs11.jm@gmail.com <ArrowUpRight size={17} /></a>
          <div className="contact-lines">
            <span><MapPin size={16} /> Mexicali, Baja California</span>
            <a href="tel:+526691596984"><Phone size={16} /> +52 669 159 6984</a>
            <a href="tel:+526694498281"><Phone size={16} /> +52 669 449 8281</a>
          </div>
          <div className="socials"><a href="https://github.com/jms2o" target="_blank" rel="noreferrer"><Code2 size={17} /> GitHub</a><a href="https://linkedin.com/in/joelmartinez1701" target="_blank" rel="noreferrer"><Link size={17} /> LinkedIn</a></div>
        </div>
      </section>

      <footer className="shell"><span>JM / PORTAFOLIO 2026</span><span><GraduationCap size={15} /> Ingeniería en Sistemas de la Información</span><a href="#inicio">Volver arriba ↑</a></footer>
    </main>
  );
}

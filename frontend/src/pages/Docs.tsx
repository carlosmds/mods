import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

// Listas de arquivos por locale (hardcoded)
const DOCS_BY_LOCALE: Record<string, { label: string; file: string }[]> = {
  'pt-BR': [
    { label: 'Termos de Uso e Privacidade', file: '/docs/pt-BR/Termos_de_Uso_e_Privacidade_PT.md' },
    { label: 'PRD (Requisitos do Produto)', file: '/docs/pt-BR/PRD-mods.ctrls.online.md' },
    { label: 'ADR (Arquitetura Backend)', file: '/docs/pt-BR/ADR-001-arquitetura-backend.md' },
  ],
  'en': [
    { label: 'Terms of Use and Privacy', file: '/docs/en/Terms_of_Use_and_Privacy_EN.md' },
    { label: 'PRD (Product Requirements)', file: '/docs/en/PRD-mods.ctrls.online.md' },
    { label: 'ADR (Backend Architecture)', file: '/docs/en/ADR-001-backend-architecture.md' },
  ],
};

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 56;

const Docs: React.FC = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : 'en';
  const DOCS = DOCS_BY_LOCALE[locale] || [];
  const [selectedDoc, setSelectedDoc] = useState(DOCS[0]?.file || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = window.innerWidth < 768;
  const isDesktop = window.innerWidth >= 1024;

  useEffect(() => {
    setLoading(true);
    if (selectedDoc) {
      fetch(selectedDoc)
        .then((res) => res.text())
        .then((text) => setContent(text))
        .finally(() => setLoading(false));
    }
  }, [selectedDoc]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const showOverlay = isMobile && sidebarOpen;

  return (
    <div className={`w-full min-h-screen bg-black relative ${isDesktop ? 'flex flex-row' : 'flex'}`}>
      {/* Overlay em mobile */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-30" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside
        id="sidebar-docs"
        className={`z-40 top-0 left-0 h-full bg-black border-r border-gray-800 text-white flex flex-col transition-all duration-300
          fixed md:static
          ${isMobile
            ? sidebarOpen
              ? 'w-[80vw] max-w-xs'
              : 'w-14'
            : sidebarCollapsed
              ? 'w-14'
              : 'w-[260px]'}
          shadow-xl overflow-hidden`}
        style={{ width: isMobile ? (sidebarOpen ? '80vw' : SIDEBAR_COLLAPSED) : (sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH) }}
        onClick={() => {
          if (isMobile && !sidebarOpen) setSidebarOpen(true);
        }}
      >
        {/* Botão de colapso/expandir sempre visível */}
        <button
          className="p-3 m-2 focus:outline-none text-xl self-end md:self-center bg-black rounded-lg hover:bg-gray-900 border border-gray-800 transition"
          onClick={e => {
            e.stopPropagation();
            if (isMobile) setSidebarOpen(!sidebarOpen);
            else setSidebarCollapsed(!sidebarCollapsed);
          }}
          aria-label={sidebarOpen || !isMobile && !sidebarCollapsed ? 'Fechar menu' : 'Abrir menu'}
        >
          {(isMobile && sidebarOpen) || (!isMobile && !sidebarCollapsed) ? '≠' : '☰'}
        </button>
        {/* Lista de documentos */}
        <nav className={`flex-1 overflow-y-auto mt-2 ${((isMobile && sidebarOpen) || (!isMobile && !sidebarCollapsed)) ? 'block' : 'hidden'}`}>
          <ul className="space-y-2 px-2">
            {DOCS.map((doc) => (
              <li key={doc.file}>
                <button
                  className={`w-full text-left px-3 py-2 rounded transition-colors
                    ${selectedDoc === doc.file ? 'bg-blue-700 text-white font-bold' : 'hover:bg-gray-800'}`}
                  onClick={e => { e.stopPropagation(); setSelectedDoc(doc.file); if (isMobile) setSidebarOpen(false); }}
                >
                  {doc.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content (centralizado) */}
      {(!isMobile || !sidebarOpen) && (
        <main
          className={`flex flex-col items-center w-screen min-h-screen px-2 md:px-0 py-8 transition-all duration-300`}
        >
          <div className="w-full flex justify-center">
            <div className={`mx-auto w-full bg-black text-white p-6 md:p-12 rounded-lg shadow-lg border border-gray-800 mt-4 ${isMobile && !sidebarOpen ? 'ml-14 max-w-full' : 'max-w-4xl'}`}>
              <h1 className="text-3xl font-bold mb-8 text-center text-white">{DOCS.find(d => d.file === selectedDoc)?.label || 'Documento'}</h1>
              <div className="prose prose-invert prose-lg max-w-none text-white">
                {loading ? (
                  <div className="text-center text-gray-400">Carregando documento...</div>
                ) : (
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-white text-center" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 text-white" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-white" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 text-white" {...props} />,
                      li: ({node, ...props}) => <li className="mb-2 text-white" {...props} />,
                      a: ({node, ...props}) => <a className="underline text-blue-400 hover:text-blue-200" target="_blank" rel="noopener noreferrer" {...props} />
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Docs; 
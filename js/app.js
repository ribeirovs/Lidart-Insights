// Lógica Principal do Aplicativo Lídart Insights

document.addEventListener('DOMContentLoaded', () => {
  // --- ESTADO GLOBAL ---
  const state = {
    currentView: 'dashboard',
    favorites: JSON.parse(localStorage.getItem('lidart_favorites')) || [],
    searchQuery: '',
    selectedCategory: 'all',
    // Diagnóstico de Maturidade
    assessmentStep: -1, // -1: Intro, 0-5: Perguntas, 6: Resultados
    assessmentAnswers: [],
    // Calculadora de ROI
    roiInputs: {
      employees: 30,
      salary: 6000,
      hoursSaved: 4,
      licenseCost: 150,
      setupFee: 15000
    }
  };

  // --- CARREGAR DADOS SALVOS DO LOCALSTORAGE (SE HOUVER) ---
  const savedCustomData = localStorage.getItem('lidart_custom_data');
  if (savedCustomData) {
    try {
      const parsed = JSON.parse(savedCustomData);
      if (parsed.tools) lidartData.tools = parsed.tools;
      if (parsed.insights) lidartData.insights = parsed.insights;
      if (parsed.radar) lidartData.radar = parsed.radar;
      if (parsed.cases) lidartData.cases = parsed.cases;
    } catch (e) {
      console.error("Erro ao ler dados customizados:", e);
    }
  }

  // --- ELEMENTOS DOM COMUNS ---
  const viewContainer = document.getElementById('view-container');
  const viewTitle = document.getElementById('view-title');
  const viewDescription = document.getElementById('view-description');
  const navItems = document.querySelectorAll('.nav-item');
  const themeToggle = document.getElementById('theme-toggle');
  const sidebar = document.getElementById('sidebar');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

  // --- CONFIGURAÇÃO INICIAL ---
  initTheme();
  setupNavigation();
  setupMobileMenu();
  renderView(); // Renderiza a tela inicial (Dashboard)

  // --- MÉTODOS DE TEMA (CLARO / ESCURO) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('lidart_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      themeToggle.querySelector('.theme-text').textContent = 'Modo Escuro';
    } else {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      themeToggle.querySelector('.theme-text').textContent = 'Modo Claro';
    }

    themeToggle.addEventListener('click', () => {
      if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        themeToggle.querySelector('.theme-text').textContent = 'Modo Escuro';
        localStorage.setItem('lidart_theme', 'light');
      } else {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        themeToggle.querySelector('.theme-text').textContent = 'Modo Claro';
        localStorage.setItem('lidart_theme', 'dark');
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // --- NAVEGAÇÃO SPA ---
  function navigateTo(view) {
    state.currentView = view;
    
    // Remove classe ativa de todos
    navItems.forEach(n => n.classList.remove('active'));
    
    // Adiciona classe ativa no correspondente
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === view) {
        item.classList.add('active');
      }
    });
    
    // Fecha o menu lateral no mobile
    sidebar.classList.remove('active');
    
    // Reseta estados auxiliares ao navegar
    if (view !== 'assessment') {
      state.assessmentStep = -1;
      state.assessmentAnswers = [];
    }
    
    renderView();
  }

  function setupNavigation() {
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        navigateTo(view);
      });
    });
  }

  function setupMobileMenu() {
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      const menuIcon = mobileMenuToggle.querySelector('i');
      if (sidebar.classList.contains('active')) {
        menuIcon.setAttribute('data-lucide', 'x');
      } else {
        menuIcon.setAttribute('data-lucide', 'menu');
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // --- RENDERIZADOR DE VIEWS ---
  function renderView() {
    // Scroll para o topo ao trocar de aba
    document.querySelector('.main-content').scrollTop = 0;

    // Atualiza cabeçalho de acordo com a aba
    updateHeaderDetails();

    // Limpa container principal
    viewContainer.innerHTML = '';

    // Seleciona e renderiza a view
    let viewElement;
    switch (state.currentView) {
      case 'dashboard':
        viewElement = createDashboardView();
        break;
      case 'aimap':
        viewElement = createAiMapView();
        break;
      case 'methodology':
        viewElement = createMethodologyView();
        break;
      case 'tools':
        viewElement = createToolsView();
        break;
      case 'insights':
        viewElement = createInsightsView();
        break;
      case 'cases':
        viewElement = createCasesView();
        break;
      case 'radar':
        viewElement = createRadarView();
        break;
      case 'assessment':
        viewElement = createAssessmentView();
        break;
      case 'roi':
        viewElement = createRoiView();
        break;
      case 'admin':
        viewElement = createAdminView();
        break;
      default:
        viewElement = document.createElement('div');
        viewElement.textContent = 'Tela não encontrada.';
    }

    viewElement.classList.add('fade-in');
    viewContainer.appendChild(viewElement);
    
    // Recria ícones dinâmicos do Lucide
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function updateHeaderDetails() {
    const titles = {
      dashboard: { title: 'Dashboard', desc: 'Central de IA estratégica da Lidart.' },
      aimap: { title: 'Mapa de IAs por Função', desc: 'Ranking de ferramentas corporativas de Inteligência Artificial baseado em uso real por Viviane Ribeiro.' },
      methodology: { title: 'As 8 Coordenadas da IA', desc: 'A metodologia estratégica da Lídart para transição e implementação segura de Inteligência Artificial.' },
      tools: { title: 'Banco de Ferramentas', desc: 'Curadoria estratégica de tecnologias de inteligência artificial para o mercado.' },
      insights: { title: 'Insights & Conteúdo', desc: 'Artigos e estudos de tendências de IA focados em liderança empresarial e escritos por Viviane Ribeiro.' },
      cases: { title: 'Cases de Sucesso', desc: 'Como auxiliamos empresas a crescer e otimizar processos com IA na prática.' },
      radar: { title: 'Radar de Novidades', desc: 'O que está mudando no mundo da IA e como isso impacta sua empresa (China & Lançamentos).' },
      assessment: { title: 'Diagnóstico de Maturidade', desc: 'Avalie as dimensões estruturais da sua empresa em IA.' },
      roi: { title: 'Calculadora de ROI', desc: 'Simule o retorno financeiro real da implementação de IA corporativa.' },
      admin: { title: 'Gerenciar Conteúdo', desc: 'Adicione ou edite ferramentas, artigos e novidades do portal.' }
    };

    const details = titles[state.currentView];
    viewTitle.textContent = details.title;
    viewDescription.textContent = details.desc;
  }

  // --- 1. VIEW: DASHBOARD ---
  function createDashboardView() {
    const container = document.createElement('div');

    // CTA de Assessment do Topo
    const ctaCard = document.createElement('div');
    ctaCard.className = 'dashboard-cta';
    ctaCard.innerHTML = `
      <div class="cta-text">
        <h2>Sua empresa está pronta para a Era da <span>IA</span>?</h2>
        <p>Faça nosso Diagnóstico de Maturidade gratuito. Descubra os gargalos tecnológicos do seu negócio e receba recomendações estratégicas imediatas.</p>
      </div>
      <button class="cta-button" id="dash-start-assessment">
        <span>Fazer Diagnóstico</span>
        <i data-lucide="arrow-right"></i>
      </button>
    `;
    container.appendChild(ctaCard);

    // Event listener para o botão CTA
    ctaCard.querySelector('#dash-start-assessment').addEventListener('click', () => {
      navigateTo('assessment');
    });

    // Grid de métricas
    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'metrics-grid';
    metricsGrid.innerHTML = `
      <div class="metric-card" id="dash-metric-tools">
        <div class="metric-icon green">
          <i data-lucide="wrench"></i>
        </div>
        <div class="metric-info">
          <h3>${lidartData.tools.length}</h3>
          <p>Ferramentas Curadas</p>
        </div>
      </div>
      <div class="metric-card" id="dash-metric-cases">
        <div class="metric-icon gold">
          <i data-lucide="briefcase"></i>
        </div>
        <div class="metric-info">
          <h3>${lidartData.cases.length}</h3>
          <p>Cases de Sucesso</p>
        </div>
      </div>
      <div class="metric-card" id="dash-metric-radar">
        <div class="metric-icon terracotta">
          <i data-lucide="rss"></i>
        </div>
        <div class="metric-info">
          <h3>${lidartData.radar.length}</h3>
          <p>Novidades no Radar</p>
        </div>
      </div>
    `;
    container.appendChild(metricsGrid);

    // Event listeners para os cartões de métricas
    metricsGrid.querySelector('#dash-metric-tools').addEventListener('click', () => {
      navigateTo('tools');
    });
    metricsGrid.querySelector('#dash-metric-cases').addEventListener('click', () => {
      navigateTo('cases');
    });
    metricsGrid.querySelector('#dash-metric-radar').addEventListener('click', () => {
      navigateTo('radar');
    });

    // Duas colunas do Dashboard
    const sectionsGrid = document.createElement('div');
    sectionsGrid.className = 'dashboard-sections';

    // Coluna Esquerda: Novidades
    const leftSec = document.createElement('div');
    leftSec.className = 'section-box';
    
    let radarItemsHtml = '';
    lidartData.radar.slice(0, 2).forEach(item => {
      radarItemsHtml += `
        <div class="featured-card">
          <div class="featured-card-img">
            <i data-lucide="zap"></i>
          </div>
          <div class="featured-card-content">
            <div class="card-category">${item.provider} &bull; ${item.date}</div>
            <h4>${item.title}</h4>
            <p>${item.description.substring(0, 110)}...</p>
            <div class="featured-card-meta">
              <span class="meta-item"><i data-lucide="alert-circle" style="width:14px;"></i> Impacto: <strong>${item.impactLevel}</strong></span>
            </div>
          </div>
        </div>
      `;
    });

    leftSec.innerHTML = `
      <div class="section-box-header">
        <h2>Atualizações do <span>Radar</span></h2>
        <a href="#" class="see-all-link" id="dash-see-radar">Ver tudo <i data-lucide="arrow-right"></i></a>
      </div>
      <div class="featured-list">
        ${radarItemsHtml}
      </div>
    `;
    sectionsGrid.appendChild(leftSec);

    // Event listener do link do Radar
    leftSec.querySelector('#dash-see-radar').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('radar');
    });

    // Coluna Direita: Ferramentas Recomendadas
    const rightSec = document.createElement('div');
    rightSec.className = 'section-box';

    let toolsItemsHtml = '';
    lidartData.tools.slice(0, 3).forEach(tool => {
      toolsItemsHtml += `
        <div class="featured-card">
          <div class="featured-card-img" style="font-size: 1.2rem; font-weight: bold; color: var(--brand-green);">
            ${tool.name.substring(0, 2)}
          </div>
          <div class="featured-card-content">
            <div class="card-category">${tool.tag}</div>
            <h4>${tool.name}</h4>
            <p>${tool.description.substring(0, 80)}...</p>
          </div>
        </div>
      `;
    });

    rightSec.innerHTML = `
      <div class="section-box-header">
        <h2>Ferramentas em <span>Destaque</span></h2>
        <a href="#" class="see-all-link" id="dash-see-tools">Ver todas <i data-lucide="arrow-right"></i></a>
      </div>
      <div class="featured-list">
        ${toolsItemsHtml}
      </div>
    `;
    sectionsGrid.appendChild(rightSec);

    // Event listener do link de Ferramentas
    rightSec.querySelector('#dash-see-tools').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('tools');
    });

    container.appendChild(sectionsGrid);
    return container;
  }

  // --- 2. VIEW: BANCO DE FERRAMENTAS ---
  function createToolsView() {
    const container = document.createElement('div');

    // Controls: Busca e Filtros
    const controls = document.createElement('div');
    controls.className = 'controls-bar';

    // Campo de busca
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    searchBox.innerHTML = `
      <i data-lucide="search"></i>
      <input type="text" placeholder="Buscar ferramentas por nome, caso de uso..." class="search-input" id="tools-search-input" value="${state.searchQuery}">
    `;
    controls.appendChild(searchBox);

    // Filtros de categoria
    const filters = document.createElement('div');
    filters.className = 'filter-categories';
    
    const categories = [
      { id: 'all', label: 'Todas' },
      { id: 'llm', label: 'LLMs & Chats' },
      { id: 'productivity', label: 'Produtividade' },
      { id: 'media', label: 'Design & Mídia' },
      { id: 'data', label: 'Dados' },
      { id: 'development', label: 'Desenvolvimento' },
      { id: 'favs', label: 'Favoritas ❤️' }
    ];

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `cat-btn ${state.selectedCategory === cat.id ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        state.selectedCategory = cat.id;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderToolGrid(grid);
      });
      filters.appendChild(btn);
    });
    controls.appendChild(filters);
    container.appendChild(controls);

    // Grid de ferramentas
    const grid = document.createElement('div');
    grid.className = 'grid-layout';
    container.appendChild(grid);

    // Setup de eventos de busca
    const searchInput = searchBox.querySelector('#tools-search-input');
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase();
      renderToolGrid(grid);
    });

    // Renderiza a grade de ferramentas inicial
    renderToolGrid(grid);

    return container;
  }

  function renderToolGrid(gridContainer) {
    gridContainer.innerHTML = '';
    
    // Filtrar ferramentas
    const filteredTools = lidartData.tools.filter(tool => {
      // Filtro de Categoria
      let matchesCategory = false;
      if (state.selectedCategory === 'all') {
        matchesCategory = true;
      } else if (state.selectedCategory === 'favs') {
        matchesCategory = state.favorites.includes(tool.id);
      } else {
        matchesCategory = tool.category === state.selectedCategory;
      }

      // Filtro de Busca
      const matchesSearch = 
        tool.name.toLowerCase().includes(state.searchQuery) ||
        tool.description.toLowerCase().includes(state.searchQuery) ||
        tool.useCase.toLowerCase().includes(state.searchQuery) ||
        tool.provider.toLowerCase().includes(state.searchQuery);

      return matchesCategory && matchesSearch;
    });

    if (filteredTools.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.gridColumn = '1 / -1';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.padding = '3rem';
      emptyMsg.style.color = 'var(--text-muted)';
      emptyMsg.innerHTML = `
        <i data-lucide="frown" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>Nenhuma ferramenta encontrada para os filtros atuais.</p>
      `;
      gridContainer.appendChild(emptyMsg);
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    filteredTools.forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tool-card';
      
      const isFav = state.favorites.includes(tool.id);

      card.innerHTML = `
        <div>
          <div class="tool-card-header">
            <div class="tool-icon-wrapper">
              <i data-lucide="wrench"></i>
            </div>
            <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${tool.id}" aria-label="Favoritar">
              <i data-lucide="heart"></i>
            </button>
          </div>
          <div class="tool-card-body">
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            <div class="tool-tags">
              <span class="tool-tag">${tool.tag}</span>
              <span class="tool-tag tool-tag-alt">${tool.provider}</span>
              <span class="tool-tag ${tool.price.toLowerCase() === 'gratuito' ? 'price-free' : ''}">${tool.price}</span>
            </div>
          </div>
        </div>
        <div class="tool-card-footer">
          <span class="use-case-badge">
            <i data-lucide="target" style="width:14px; height:14px;"></i>
            <span>Para empresas</span>
          </span>
          <button class="visit-link view-tool-details" data-id="${tool.id}">
            <span>Detalhes</span>
            <i data-lucide="chevron-right"></i>
          </button>
        </div>
      `;

      // Event listener do botão favorito
      card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        const toolId = btn.getAttribute('data-id');
        
        if (state.favorites.includes(toolId)) {
          state.favorites = state.favorites.filter(id => id !== toolId);
          btn.classList.remove('active');
        } else {
          state.favorites.push(toolId);
          btn.classList.add('active');
        }
        localStorage.setItem('lidart_favorites', JSON.stringify(state.favorites));
        
        // Se estivermos visualizando a categoria Favoritos, re-renderiza o grid inteiro
        if (state.selectedCategory === 'favs') {
          renderToolGrid(gridContainer);
        }
      });

      // Detalhes da ferramenta (Modal)
      card.querySelector('.view-tool-details').addEventListener('click', () => {
        showToolModal(tool);
      });

      gridContainer.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function showToolModal(tool) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <h2>${tool.name}</h2>
          </div>
          <button class="modal-close"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <h4>Provedor</h4>
          <p>${tool.provider}</p>
          
          <h4>Descrição Detalhada</h4>
          <p>${tool.description}</p>
          
          <h4>Caso de Uso na Consultoria</h4>
          <p>${tool.useCase}</p>
          
          <h4>Modelo Comercial</h4>
          <p><strong>Status:</strong> ${tool.price}</p>
          
          <div style="margin-top: 2rem;">
            <a href="${tool.link}" target="_blank" class="btn-primary">
              <span>Visitar Site Oficial</span>
              <i data-lucide="external-link"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Event listener para fechar
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // --- 3. VIEW: INSIGHTS & CONTEÚDOS ---
  function createInsightsView() {
    const container = document.createElement('div');
    container.className = 'insights-layout';

    lidartData.insights.forEach(article => {
      const card = document.createElement('div');
      card.className = 'article-card';
      card.innerHTML = `
        <div class="card-img-placeholder">
          <i data-lucide="book-open"></i>
          <span class="badge">${article.category}</span>
        </div>
        <div class="article-body">
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
          <div class="card-footer-meta">
            <span>${article.date} &bull; ${article.readTime}</span>
            <button class="read-more-btn read-article" data-id="${article.id}">
              <span>Ler Artigo</span>
              <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.read-article').addEventListener('click', () => {
        showArticleModal(article);
      });

      container.appendChild(card);
    });

    return container;
  }

  function showArticleModal(article) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    // Converte quebras de linha e subtítulos simples de markdown para HTML
    let formattedContent = article.content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/\* \*\*(.*?)\*\*:/g, '<li><strong>$1</strong>: ')
      .replace(/\* (.*)/g, '<li>$1</li>');

    // Embrulha em tags de parágrafo gerais
    formattedContent = `<p>${formattedContent}</p>`;
    
    // Ajusta blocos de recomendação
    formattedContent = formattedContent.replace(
      /<p>\*Recomendação Lídart:\*(.*?)<\/p>/g,
      `<div class="impact-assessment" style="margin-top: 1.5rem;">
        <strong>Recomendação Lídart:</strong>
        $1
       </div>`
    );

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 750px;">
        <div class="modal-header">
          <div class="modal-title">
            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--brand-gold);">${article.category} &bull; ${article.date}</span>
            <h2 style="margin-top: 0.3rem; font-size: 1.4rem; line-height: 1.3;">${article.title}</h2>
          </div>
          <button class="modal-close"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" style="padding-top: 1.5rem;">
          <div class="article-rich-text">
            ${formattedContent}
          </div>
          <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); text-align: center;">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Quer discutir essa estratégia para o seu cenário específico?</p>
            <button class="btn-primary" id="article-cta-btn">Agendar Conversa Gratuita</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Event listener do botão do CTA da consultoria
    modal.querySelector('#article-cta-btn').addEventListener('click', () => {
      modal.remove();
      window.open('https://lidart.com.br', '_blank');
    });

    // Event listener para fechar
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // --- 4. VIEW: CASES DE SUCESSO ---
  function createCasesView() {
    const container = document.createElement('div');
    container.className = 'cases-layout';

    lidartData.cases.forEach(item => {
      const card = document.createElement('div');
      card.className = 'case-card';
      card.innerHTML = `
        <div class="card-img-placeholder">
          <i data-lucide="briefcase"></i>
          <span class="badge">Case Study</span>
        </div>
        <div class="case-body">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--brand-gold); margin-bottom: 0.3rem;">${item.client}</span>
          <h3>${item.title}</h3>
          <p>${item.challenge.substring(0, 110)}...</p>
          
          <div class="case-metrics-container">
            <div class="case-metric">
              <div class="case-metric-val">${item.metrics[0].value}</div>
              <div class="case-metric-label">${item.metrics[0].label}</div>
            </div>
            <div class="case-metric">
              <div class="case-metric-val">${item.metrics[1].value}</div>
              <div class="case-metric-label">${item.metrics[1].label}</div>
            </div>
          </div>

          <div class="card-footer-meta">
            <span>Metodologia Lídart</span>
            <button class="read-more-btn read-case" data-id="${item.id}">
              <span>Ver Case Completo</span>
              <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.read-case').addEventListener('click', () => {
        showCaseModal(item);
      });

      container.appendChild(card);
    });

    return container;
  }

  function showCaseModal(item) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 750px;">
        <div class="modal-header">
          <div class="modal-title">
            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--brand-gold);">${item.client}</span>
            <h2 style="font-size: 1.4rem; line-height: 1.3; margin-top: 0.3rem;">${item.title}</h2>
          </div>
          <button class="modal-close"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <div class="case-metrics-container" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 2rem; padding: 1.5rem;">
            <div class="case-metric">
              <div class="case-metric-val" style="font-size: 1.8rem;">${item.metrics[0].value}</div>
              <div class="case-metric-label" style="font-size: 0.75rem;">${item.metrics[0].label}</div>
            </div>
            <div class="case-metric">
              <div class="case-metric-val" style="font-size: 1.8rem;">${item.metrics[1].value}</div>
              <div class="case-metric-label" style="font-size: 0.75rem;">${item.metrics[1].label}</div>
            </div>
          </div>

          <h4>O Desafio Comercial</h4>
          <p>${item.challenge}</p>
          
          <h4>A Solução Desenvolvida</h4>
          <p>${item.solution}</p>

          <h4>Detalhamento Técnico e Metodológico</h4>
          <p>${item.details}</p>
          
          <h4>Impacto Final Obtido</h4>
          <p>${item.impact}</p>
          
          <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); text-align: center;">
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Quer obter resultados semelhantes na sua infraestrutura de negócios?</p>
            <button class="btn-primary" id="case-cta-btn">Agendar Diagnóstico Gratuito</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Event listener do botão do CTA da consultoria
    modal.querySelector('#case-cta-btn').addEventListener('click', () => {
      modal.remove();
      window.open('https://lidart.com.br', '_blank');
    });

    // Event listener para fechar
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // --- 5. VIEW: RADAR DE NOVIDADES ---
  function createRadarView() {
    const container = document.createElement('div');
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    lidartData.radar.forEach(news => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      
      const badgeClass = news.impactLevel === 'Alta' ? 'background-color: rgba(158, 62, 42, 0.15); color: var(--brand-terracotta); border: 1px solid rgba(158, 62, 42, 0.3);' : 'background-color: rgba(176, 125, 26, 0.15); color: var(--brand-gold); border: 1px solid rgba(176, 125, 26, 0.3);';

      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-date">${news.date}</span>
            <div>
              <span class="timeline-provider">${news.provider}</span>
              <span class="timeline-provider" style="${badgeClass}">Impacto: ${news.impactLevel}</span>
            </div>
          </div>
          <h3>${news.title}</h3>
          <p>${news.description}</p>
          <div class="impact-assessment">
            <strong>Análise de Negócio (Lídart):</strong>
            <p style="margin:0; font-size: 0.88rem; color: var(--text-muted);">${news.impactAnalysis}</p>
          </div>
        </div>
      `;
      timeline.appendChild(item);
    });

    container.appendChild(timeline);
    return container;
  }

  // --- 6. VIEW: DIAGNÓSTICO DE MATURIDADE (ASSESSMENT) ---
  const questions = [
    {
      title: "Como sua empresa coleta e estrutura os dados internos?",
      dimension: "data",
      options: [
        { text: "Não temos dados estruturados; a maior parte está em planilhas soltas e e-mails de colaboradores.", score: 1 },
        { text: "Coletamos dados em sistemas locais (ERP, CRM), mas não temos uma base de dados centralizada.", score: 2 },
        { text: "Temos um Data Warehouse/Data Lake e nossos dados principais são integrados internamente.", score: 3 },
        { text: "Nossos dados são totalmente integrados, higienizados e prontos para alimentar modelos de IA em tempo real.", score: 4 }
      ]
    },
    {
      title: "Qual é o nível de adoção de APIs e computação em nuvem na empresa?",
      dimension: "infra",
      options: [
        { text: "Nossos sistemas são legados e rodados localmente (on-premise), sem integrações modernas.", score: 1 },
        { text: "Usamos sistemas modernos em nuvem (SaaS), mas as conexões entre eles são limitadas ou manuais.", score: 2 },
        { text: "Temos APIs estruturadas para a maioria dos sistemas e usamos nuvens modernas (AWS, Azure, GCP).", score: 3 },
        { text: "Nossa infraestrutura é baseada em microsserviços modernos, com gateways prontos para IA corporativa.", score: 4 }
      ]
    },
    {
      title: "Qual é o nível de letramento e engajamento em IA da sua equipe?",
      dimension: "people",
      options: [
        { text: "A equipe não sabe usar IA ou usa apenas ferramentas gratuitas de forma oculta (Shadow AI).", score: 1 },
        { text: "Alguns colaboradores utilizam no dia a dia, mas sem treinamento formal ou diretrizes de governança.", score: 2 },
        { text: "Realizamos treinamentos básicos de IA generativa e possuímos guias básicos de boas práticas.", score: 3 },
        { text: "Temos equipes dedicadas a IA/Dados, incentivo cultural e treinamentos contínuos de prompts avançados.", score: 4 }
      ]
    },
    {
      title: "Como a empresa escolhe e prioriza onde aplicar IA nos processos?",
      dimension: "usecase",
      options: [
        { text: "Não identificamos casos de uso ou tentamos usar IA apenas porque está na mídia.", score: 1 },
        { text: "Identificamos tarefas manuais repetitivas pontuais e sugerimos aos funcionários que usem IA.", score: 2 },
        { text: "Mapeamos processos operacionais e sabemos em quais departamentos a IA geraria maior eficiência.", score: 3 },
        { text: "Temos um pipeline estruturado de projetos de IA priorizados por ROI estimado e metas estratégicas.", score: 4 }
      ]
    },
    {
      title: "Como a empresa gerencia riscos regulatórios e compliance em IA?",
      dimension: "gov",
      options: [
        { text: "Não temos nenhuma diretriz de segurança de dados ou privacidade para uso de ferramentas de IA.", score: 1 },
        { text: "Recomendamos informalmente não inserir dados sensíveis de clientes em chats públicos.", score: 2 },
        { text: "Temos uma política oficial de uso de IA, com termos assinados e auditorias jurídicas periódicas.", score: 3 },
        { text: "Possuímos comitê de governança corporativa em IA, auditoria contínua e total conformidade com a LGPD.", score: 4 }
      ]
    },
    {
      title: "Qual o nível de investimento e orçamento destinado a projetos de IA?",
      dimension: "budget",
      options: [
        { text: "Não há orçamento previsto para ferramentas de IA, testes ou capacitação tecnológica.", score: 1 },
        { text: "Financiamos ocasionalmente licenças de ferramentas individuais a pedido de alguma área.", score: 2 },
        { text: "Temos uma verba corporativa anual flexível reservada para projetos de inovação digital e tecnologia.", score: 3 },
        { text: "Possuímos orçamento dedicado anualmente exclusivo para desenvolvimento de IA e consultoria estruturada.", score: 4 }
      ]
    }
  ];

  function createAssessmentView() {
    const card = document.createElement('div');
    card.className = 'assessment-card';

    if (state.assessmentStep === -1) {
      // Tela de Introdução
      card.innerHTML = `
        <div class="assessment-intro">
          <span class="badge-result">Diagnóstico Estratégico</span>
          <h2>Avaliador de Maturidade em IA da <span style="font-family: var(--font-serif); font-style: italic; font-weight:600; color: var(--brand-gold);">Lídart</span></h2>
          <p>Entenda onde sua empresa se posiciona na jornada de transformação digital e adoção de inteligência artificial. Este questionário de 6 perguntas analisa as dimensões cruciais de tecnologia, processos, segurança e cultura organizacional.</p>
          
          <div style="background-color: var(--bg-primary); border-left: 3px solid var(--brand-green); padding: 1.2rem; border-radius: var(--border-radius-sm); margin-bottom: 2.5rem; text-align: left;">
            <h4 style="margin-bottom: 0.4rem; color: var(--text-primary);"><i data-lucide="award" style="width:18px; display:inline-block; vertical-align:middle; margin-right:5px;"></i> O que você vai receber:</h4>
            <ul style="list-style: none; font-size: 0.9rem; color: var(--text-muted); padding-left: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">
              <li>• Classificação exata do nível de maturidade corporativa da empresa.</li>
              <li>• Mapeamento visual das 6 dimensões estratégicas da empresa.</li>
              <li>• Plano preliminar de recomendações operacionais da consultoria.</li>
            </ul>
          </div>

          <button class="start-btn" id="start-assessment-btn">
            <span>Iniciar Avaliação</span>
            <i data-lucide="play"></i>
          </button>
        </div>
      `;

      card.querySelector('#start-assessment-btn').addEventListener('click', () => {
        state.assessmentStep = 0;
        state.assessmentAnswers = [];
        renderView();
      });

    } else if (state.assessmentStep >= 0 && state.assessmentStep < questions.length) {
      // Fluxo de Perguntas
      const q = questions[state.assessmentStep];
      const progress = ((state.assessmentStep) / questions.length) * 100;

      let optionsHtml = '';
      q.options.forEach((opt, idx) => {
        const isSelected = state.assessmentAnswers[state.assessmentStep] === idx;
        optionsHtml += `
          <button class="option-card ${isSelected ? 'selected' : ''}" data-index="${idx}">
            <div class="option-radio"></div>
            <div class="option-text">${opt.text}</div>
          </button>
        `;
      });

      card.innerHTML = `
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress}%;"></div>
        </div>
        
        <div class="question-block">
          <span style="font-size: 0.8rem; font-weight:700; color: var(--brand-gold); text-transform:uppercase; letter-spacing: 0.05em; display:block; margin-bottom: 0.5rem;">Pergunta ${state.assessmentStep + 1} de ${questions.length}</span>
          <h3>${q.title}</h3>
          <div class="options-list">
            ${optionsHtml}
          </div>
          
          <div class="question-navigation">
            <button class="prev-btn" id="prev-q-btn" ${state.assessmentStep === 0 ? 'disabled style="opacity:0.3; pointer-events:none;"' : ''}>
              <i data-lucide="arrow-left"></i>
              <span>Voltar</span>
            </button>
            <button class="next-btn" id="next-q-btn" disabled>
              <span>${state.assessmentStep === questions.length - 1 ? 'Ver Resultado' : 'Avançar'}</span>
              <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </div>
      `;

      // Habilitar botão Avançar se já houver resposta para esta pergunta
      const nextBtn = card.querySelector('#next-q-btn');
      if (state.assessmentAnswers[state.assessmentStep] !== undefined) {
        nextBtn.removeAttribute('disabled');
      }

      // Adicionar listeners para opções
      card.querySelectorAll('.option-card').forEach(optBtn => {
        optBtn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'));
          state.assessmentAnswers[state.assessmentStep] = idx;
          
          card.querySelectorAll('.option-card').forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          
          nextBtn.removeAttribute('disabled');
        });
      });

      // Listeners de navegação
      card.querySelector('#prev-q-btn').addEventListener('click', () => {
        state.assessmentStep--;
        renderView();
      });

      nextBtn.addEventListener('click', () => {
        state.assessmentStep++;
        renderView();
      });

    } else {
      // Tela de Resultados
      const totalScore = state.assessmentAnswers.reduce((sum, optIdx, qIdx) => {
        return sum + questions[qIdx].options[optIdx].score;
      }, 0);

      // Calcular nível
      let level = '';
      let desc = '';
      let recommendations = [];

      if (totalScore <= 10) {
        level = 'Iniciante';
        desc = 'Sua empresa está nos primeiros passos em relação à Inteligência Artificial. A adoção atual é reativa, caracterizada pelo uso de ferramentas gratuitas sem governança e dados isolados em planilhas.';
        recommendations = [
          "Realizar workshops de letramento digital em IA para líderes e gestores da empresa.",
          "Mapear e catalogar quais ferramentas os colaboradores já usam informalmente no dia a dia (Auditoria de Shadow AI).",
          "Centralizar e higienizar a base cadastral de clientes da empresa (primeiro passo para criar agentes úteis)."
        ];
      } else if (totalScore <= 15) {
        level = 'Explorador';
        desc = 'A empresa já experimenta com IA em departamentos isolados (como Marketing ou Suporte), porém a adoção não é coordenada estrategicamente e a infraestrutura de dados ainda é fragmentada.';
        recommendations = [
          "Criar um Guia de Boas Práticas e Segurança de Dados em IA para os colaboradores.",
          "Estruturar um comitê interdisciplinar de governança de IA para avaliar novos projetos.",
          "Priorizar a integração de dados internos corporativos essenciais em nuvens seguras."
        ];
      } else if (totalScore <= 20) {
        level = 'Integrador';
        desc = 'Existe uma base tecnológica sólida com dados centralizados e APIs. O foco agora deve ser automatizar processos de negócios complexos conectando dados da empresa a modelos de linguagem privados.';
        recommendations = [
          "Desenvolver um piloto de RAG (Busca com IA) conectado aos manuais e bases de dados internos para acelerar o suporte técnico.",
          "Desenhar automações complexas que conectem o CRM aos geradores de texto por IA de forma 100% automatizada.",
          "Capacitar o time de tecnologia no desenvolvimento e monitoramento de prompts corporativos estruturados."
        ];
      } else {
        level = 'Líder Aumentado';
        desc = 'Parabéns! Sua organização está na vanguarda da revolução. Há orçamento estratégico estruturado, letramento digital avançado e compliance rigoroso. O foco é otimizar ecossistemas multiagentes inteligentes.';
        recommendations = [
          "Desenvolver Agentes Autônomos de IA que tomem decisões assíncronas em processos complexos de cadeia de suprimentos e atendimento.",
          "Implementar auditorias e monitoramento automatizado de alucinações de modelos de IA em produção.",
          "Criar novos produtos e serviços baseados em IA proprietária como novos canais de monetização corporativa."
        ];
      }

      // Pontuações por dimensão (escala 1 a 4)
      const dimensions = {
        data: questions[0].options[state.assessmentAnswers[0]].score,
        infra: questions[1].options[state.assessmentAnswers[1]].score,
        people: questions[2].options[state.assessmentAnswers[2]].score,
        usecase: questions[3].options[state.assessmentAnswers[3]].score,
        gov: questions[4].options[state.assessmentAnswers[4]].score,
        budget: questions[5].options[state.assessmentAnswers[5]].score
      };

      let recsListHtml = '';
      recommendations.forEach(rec => {
        recsListHtml += `<li>${rec}</li>`;
      });

      card.innerHTML = `
        <div class="results-block">
          <span class="badge-result">Resultado da Avaliação</span>
          <h2 class="result-title">Maturidade: <span>${level}</span></h2>
          <p class="result-description">${desc}</p>
          
          <div class="score-breakdown">
            <h4>Pontuação por Dimensão Estratégica:</h4>
            
            <div class="dimension-row">
              <div class="dimension-info">
                <span>Estratégia & Qualidade de Dados</span>
                <span>${dimensions.data}/4</span>
              </div>
              <div class="dimension-bar"><div class="dimension-fill green" style="width: ${dimensions.data * 25}%"></div></div>
            </div>
            
            <div class="dimension-row">
              <div class="dimension-info">
                <span>Infraestrutura & Integração de APIs</span>
                <span>${dimensions.infra}/4</span>
              </div>
              <div class="dimension-bar"><div class="dimension-fill green" style="width: ${dimensions.infra * 25}%"></div></div>
            </div>
            
            <div class="dimension-row">
              <div class="dimension-info">
                <span>Pessoas, Cultura & Prompting</span>
                <span>${dimensions.people}/4</span>
              </div>
              <div class="dimension-bar"><div class="dimension-fill gold" style="width: ${dimensions.people * 25}%"></div></div>
            </div>
            
            <div class="dimension-row">
              <div class="dimension-info">
                <span>Identificação de Casos de Uso</span>
                <span>${dimensions.usecase}/4</span>
              </div>
              <div class="dimension-bar"><div class="dimension-fill gold" style="width: ${dimensions.usecase * 25}%"></div></div>
            </div>
            
            <div class="dimension-row">
              <div class="dimension-info">
                <span>Governança, Ética & Segurança (LGPD)</span>
                <span>${dimensions.gov}/4</span>
              </div>
              <div class="dimension-bar"><div class="dimension-fill terracotta" style="width: ${dimensions.gov * 25}%"></div></div>
            </div>
            
            <div class="dimension-row">
              <div class="dimension-info">
                <span>Orçamento & Investimento Estratégico</span>
                <span>${dimensions.budget}/4</span>
              </div>
              <div class="dimension-bar"><div class="dimension-fill terracotta" style="width: ${dimensions.budget * 25}%"></div></div>
            </div>
          </div>

          <div class="recommendations-box">
            <h4>Próximos Passos recomendados pela Lídart:</h4>
            <ul class="recommendations-list">
              ${recsListHtml}
            </ul>
          </div>
          
          <div class="actions-row">
            <button class="btn-primary" id="btn-cta-consulting-results">
              <i data-lucide="phone"></i>
              <span>Agendar Apresentação do Relatório</span>
            </button>
            <button class="btn-secondary" id="btn-restart-assessment">
              <i data-lucide="rotate-ccw"></i>
              <span>Refazer Teste</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector('#btn-cta-consulting-results').addEventListener('click', () => {
        window.open('https://lidart.com.br', '_blank');
      });

      card.querySelector('#btn-restart-assessment').addEventListener('click', () => {
        state.assessmentStep = -1;
        state.assessmentAnswers = [];
        renderView();
      });
    }

    return card;
  }

  // --- 7. VIEW: CALCULADORA DE ROI DE IA ---
  function createRoiView() {
    const card = document.createElement('div');
    card.className = 'roi-card';
    card.innerHTML = `
      <p style="color: var(--text-muted); margin-bottom: 2rem;">Ajuste os parâmetros abaixo de acordo com a realidade da sua empresa e veja o impacto financeiro anual estimado ao implementar licenças e fluxos de automação de IA.</p>
      
      <div class="roi-layout">
        <div class="roi-inputs">
          
          <!-- Nº Colaboradores -->
          <div class="input-group">
            <div class="input-label-row">
              <label for="employees-range">Nº de Colaboradores Utilizando IA</label>
              <input type="number" id="employees-num" class="input-number-box" min="5" max="300" value="${state.roiInputs.employees}">
            </div>
            <input type="range" id="employees-range" min="5" max="300" step="5" value="${state.roiInputs.employees}">
          </div>

          <!-- Salário Médio -->
          <div class="input-group">
            <div class="input-label-row">
              <label for="salary-range">Salário Médio Mensal (CLT)</label>
              <input type="number" id="salary-num" class="input-number-box" min="2000" max="25000" step="500" value="${state.roiInputs.salary}">
            </div>
            <input type="range" id="salary-range" min="2000" max="25000" step="500" value="${state.roiInputs.salary}">
          </div>

          <!-- Horas Salvas / Semana -->
          <div class="input-group">
            <div class="input-label-row">
              <label for="hours-range">Horas Economizadas por Colaborador / Semana</label>
              <input type="number" id="hours-num" class="input-number-box" min="1" max="15" step="0.5" value="${state.roiInputs.hoursSaved}">
            </div>
            <input type="range" id="hours-range" min="1" max="15" step="0.5" value="${state.roiInputs.hoursSaved}">
          </div>

          <!-- Custo Licença IA -->
          <div class="input-group">
            <div class="input-label-row">
              <label for="licensing-range">Custo Mensal da Licença de IA por Usuário</label>
              <input type="number" id="licensing-num" class="input-number-box" min="50" max="500" step="10" value="${state.roiInputs.licenseCost}">
            </div>
            <input type="range" id="licensing-range" min="50" max="500" step="10" value="${state.roiInputs.licenseCost}">
          </div>

          <!-- Custos Iniciais (Setup / Consultoria) -->
          <div class="input-group">
            <div class="input-label-row">
              <label for="setup-range">Investimento Inicial Estimado (Setup / Consultoria)</label>
              <input type="number" id="setup-num" class="input-number-box" min="5000" max="80000" step="5000" value="${state.roiInputs.setupFee}">
            </div>
            <input type="range" id="setup-range" min="5000" max="80000" step="5000" value="${state.roiInputs.setupFee}">
          </div>

        </div>
        
        <div class="roi-results-box" id="roi-results-box">
          <!-- Conteúdo gerado dinamicamente por calculateRoi() -->
        </div>
      </div>
    `;

    // Acionar o cálculo inicial e atachar os event listeners nos sliders e caixas numéricas
    const resultsContainer = card.querySelector('#roi-results-box');
    calculateRoi(resultsContainer);

    const ranges = [
      { id: 'employees', rangeEl: card.querySelector('#employees-range'), numEl: card.querySelector('#employees-num') },
      { id: 'salary', rangeEl: card.querySelector('#salary-range'), numEl: card.querySelector('#salary-num') },
      { id: 'hours', rangeEl: card.querySelector('#hours-range'), numEl: card.querySelector('#hours-num') },
      { id: 'licensing', rangeEl: card.querySelector('#licensing-range'), numEl: card.querySelector('#licensing-num') },
      { id: 'setup', rangeEl: card.querySelector('#setup-range'), numEl: card.querySelector('#setup-num') }
    ];

    ranges.forEach(item => {
      // Quando move o slider
      item.rangeEl.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.roiInputs[item.id] = val;
        item.numEl.value = val;
        calculateRoi(resultsContainer);
      });

      // Quando digita na caixa de número
      item.numEl.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        state.roiInputs[item.id] = val;
        item.rangeEl.value = val;
        calculateRoi(resultsContainer);
      });
    });

    return card;
  }

  function calculateRoi(container) {
    const inputs = state.roiInputs;
    
    // Contas de tempo e financeira
    // Supondo 4.33 semanas por mês de média
    const totalHoursSavedMonth = inputs.employees * inputs.hoursSaved * 4.33;
    
    // Custo real da hora para a empresa (salário CLT + 60% de encargos sociais aproximados)
    const employerCostMultiplier = 1.6;
    const monthlyEmployeeCost = inputs.salary * employerCostMultiplier;
    const hourlyWageCost = monthlyEmployeeCost / 176; // 176 horas de trabalho mensais padrão
    
    const valueSavedMonth = totalHoursSavedMonth * hourlyWageCost;
    
    const monthlyLicenseCost = inputs.employees * inputs.licenseCost;
    
    const monthlyNetSavings = valueSavedMonth - monthlyLicenseCost;
    const annualNetSavings = monthlyNetSavings * 12;
    
    // ROI anualizado sobre o investimento inicial + licenciamento anual
    const firstYearInvestment = inputs.setupFee + (monthlyLicenseCost * 12);
    const roiPercentage = ((annualNetSavings - inputs.setupFee) / firstYearInvestment) * 100;
    
    // Payback (Ponto de equilíbrio)
    const paybackMonths = monthlyNetSavings > 0 ? (inputs.setupFee / monthlyNetSavings) : 999;

    let paybackText = '';
    if (monthlyNetSavings <= 0) {
      paybackText = 'Negativo (Não se paga)';
    } else if (paybackMonths <= 1) {
      paybackText = 'Imediato (1º mês)';
    } else {
      paybackText = `${paybackMonths.toFixed(1)} meses`;
    }

    container.innerHTML = `
      <div class="roi-results-header">
        <h3>Projeção de Retorno</h3>
        <p>Impacto financeiro estimado para o primeiro ano.</p>
      </div>
      
      <div class="roi-metrics-stack">
        <div class="roi-metric-result">
          <span class="roi-metric-title">Economia Líquida Anual</span>
          <span class="roi-metric-value-huge" style="color: ${annualNetSavings > 0 ? 'var(--brand-green)' : 'var(--brand-terracotta)'}">
            ${annualNetSavings > 0 ? 'R$ ' + Math.round(annualNetSavings).toLocaleString('pt-BR') : 'R$ 0'}
          </span>
        </div>
        
        <div class="roi-metric-result" style="border-top: 1px solid var(--border-color); padding-top: 0.8rem;">
          <span class="roi-metric-title">ROI Projetado (1º Ano)</span>
          <span class="roi-metric-value-large" style="color: ${roiPercentage > 0 ? 'var(--brand-gold)' : 'var(--text-muted)'}">
            ${roiPercentage > 0 ? Math.round(roiPercentage) + '%' : '0%'}
          </span>
        </div>
        
        <div class="roi-metric-result" style="border-top: 1px solid var(--border-color); padding-top: 0.8rem;">
          <span class="roi-metric-title">Ponto de Equilíbrio (Payback)</span>
          <span class="roi-payback-badge" style="background-color: ${monthlyNetSavings > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(158, 62, 42, 0.1)'}; color: ${monthlyNetSavings > 0 ? '#10B981' : 'var(--brand-terracotta)'}">
            ${paybackText}
          </span>
        </div>

        <div class="roi-metric-result" style="border-top: 1px solid var(--border-color); padding-top: 0.8rem;">
          <span class="roi-metric-title">Horas Produtivas Recuperadas / Mês</span>
          <span class="roi-metric-value-large">${Math.round(totalHoursSavedMonth)} horas</span>
        </div>
      </div>
      
      <button class="roi-cta-consulting" id="roi-cta-schedule">
        <span>Garantir esse ROI com a Lídart</span>
      </button>
    `;

    container.querySelector('#roi-cta-schedule').addEventListener('click', () => {
      window.open('https://lidart.com.br', '_blank');
    });
  }

  function createAiMapView() {
    const container = document.createElement('div');

    // Cabeçalho de Legenda do Mapa
    const legend = document.createElement('div');
    legend.className = 'aimap-legend';
    legend.innerHTML = `
      <div class="legend-items">
        <div class="legend-item"><span class="rank-badge rank-1">1</span> Melhor da categoria</div>
        <div class="legend-item"><span class="rank-badge rank-2">2</span> Muito bom</div>
        <div class="legend-item"><span class="rank-badge rank-3">3</span> Referência no uso</div>
      </div>
      <div class="legend-note">Avaliação baseada em experiência de uso real da Lidart &bull; Não é ranking oficial &bull; Atualizado em 2026</div>
    `;
    container.appendChild(legend);

    // Grid do Mapa de IAs
    const grid = document.createElement('div');
    grid.className = 'aimap-grid';

    lidartData.aimap.forEach(cat => {
      const catCard = document.createElement('div');
      catCard.className = 'aimap-cat-card';

      let itemsHtml = '';
      cat.items.forEach(item => {
        itemsHtml += `
          <div class="aimap-tool-row" data-tool-id="${item.toolId}">
            <span class="rank-badge rank-${item.rank}">${item.rank}</span>
            <div class="aimap-tool-details">
              <strong class="aimap-tool-name">${item.name}</strong>
              <span class="aimap-tool-desc">${item.desc}</span>
            </div>
            <i data-lucide="chevron-right" class="aimap-row-arrow"></i>
          </div>
        `;
      });

      catCard.innerHTML = `
        <div class="aimap-cat-header">
          <i data-lucide="${cat.icon}"></i>
          <h3>${cat.category.toUpperCase()}</h3>
        </div>
        <div class="aimap-cat-items">
          ${itemsHtml}
        </div>
      `;

      // Adiciona clique interativo para abrir o modal de detalhes da ferramenta
      catCard.querySelectorAll('.aimap-tool-row').forEach(row => {
        row.addEventListener('click', (e) => {
          const toolId = e.currentTarget.getAttribute('data-tool-id');
          const tool = lidartData.tools.find(t => t.id === toolId);
          if (tool) {
            showToolModal(tool);
          }
        });
      });

      grid.appendChild(catCard);
    });

    container.appendChild(grid);
    return container;
  }

  function createMethodologyView() {
    const container = document.createElement('div');
    
    // Grid de Coordenadas
    const grid = document.createElement('div');
    grid.className = 'methodology-grid';
    
    const coordinates = [
      {
        num: "C1",
        title: "Enquadramento do Problema",
        desc: "A capacidade de definir, isolar e estruturar a causa raiz de um gargalo de negócios antes de acionar a Inteligência Artificial.",
        question: "Você sabe qual é o problema real que está tentando resolver com a IA, ou está apenas usando a tecnologia para automatizar um sintoma superficial?",
        risk: "Desenvolver soluções tecnicamente perfeitas e extremamente rápidas para o problema errado, desperdiçando recursos e mascarando a ineficiência."
      },
      {
        num: "C2",
        title: "Clareza de Intenção",
        desc: "A definição explícita do que constitui o sucesso do output e quais são as restrições inegociáveis que a máquina deve seguir.",
        question: "Você tem clareza exata de qual resultado espera da IA antes de abrir a janela do chat, ou digita instruções vagas na esperança de descobrir o que quer ao longo do caminho?",
        risk: "Submeter-se à dispersão de outputs genéricos e medianos que parecem fluentes, mas não entregam valor real aos negócios."
      },
      {
        num: "C3",
        title: "Comando de Instrução",
        desc: "A habilidade de estruturar briefings assertivos e precisos, reduzindo o tempo de retrabalho e correções.",
        question: "Você consegue traduzir suas metas corporativas em diretrizes específicas para o agente de IA, ou passa mais tempo corrigindo o que a máquina entrega do que se estivesse fazendo a tarefa manualmente?",
        risk: "Gerar uma 'Dívida de Instrução', onde a velocidade da IA é anulada pelo tempo gasto em sucessivos ciclos de ajustes ineficientes."
      },
      {
        num: "C4",
        title: "Autoridade Decisória",
        desc: "A manutenção do controle e o estabelecimento de portões de decisão humana ao longo do fluxo de processos do agente.",
        question: "Onde termina a sugestão do algoritmo e começa a sua decisão? Você confia cegamente nas recomendações e análises trazidas pela IA sem questionar?",
        risk: "Ceder passivamente a autonomia decisória a modelos estatísticos, expondo a operação a riscos operacionais invisíveis e perda de controle."
      },
      {
        num: "C5",
        title: "Julgamento do Output",
        desc: "O escrutínio analítico e a avaliação de consistência e fidedignidade da entrega do agente contra critérios de negócios.",
        question: "Você avalia a coerência, as fontes e os dados gerados pela IA com rigor analítico, ou aprova e compartilha o material baseando-se apenas na fluência e boa escrita do texto?",
        risk: "Propagar informações incorretas (alucinações) e decisões enviesadas que podem manchar a reputação técnica e comercial da sua empresa."
      },
      {
        num: "C6",
        title: "Refinamento Crítico",
        desc: "A condução de iterações conscientes com a IA com base em justificativas de negócios e raciocínio explícito.",
        question: "Quando o output não vem perfeito, você refina a IA orientando o processo com lógica executiva ou fica gerando novos prompts de forma intuitiva por tentativa e erro?",
        risk: "Estagnação do aprendizado do time, loops exaustivos de prompts ineficientes e perda da fricção cognitiva que aprimora o julgamento."
      },
      {
        num: "C7",
        title: "Governança do Processo",
        desc: "A visão macro da esteira operacional híbrida, identificando onde cada agente atua e onde o olhar humano é indispensável.",
        question: "Você tem o mapa do fluxo de trabalho da sua equipe com as IAs desenhado, ou os agentes estão soltos no departamento atuando sem governança e de forma desordenada?",
        risk: "Desalinhamento operacional, sobreposição de tarefas de IAs redundantes e vulnerabilidades em compliance e proteção de dados (Shadow AI)."
      },
      {
        num: "C8",
        title: "Soberania Autoral",
        desc: "A validação final e responsabilização ética sobre a entrega final, garantindo que o produto reflete a visão intelectual do líder.",
        question: "Antes de assinar um relatório ou proposta, você se certifica de que o documento representa o seu ponto de vista intelectual ou é apenas um editor passivo de textos gerados por terceiros?",
        risk: "Despersonalização de propostas comerciais e perda da propriedade intelectual, resultando no esvaziamento da autoridade e do diferencial competitivo."
      }
    ];

    coordinates.forEach(coord => {
      const card = document.createElement('div');
      card.className = 'coord-card';
      
      card.innerHTML = `
        <div class="coord-card-header">
          <span class="coord-num">${coord.num}</span>
          <h3>${coord.title}</h3>
        </div>
        <p class="coord-desc">${coord.desc}</p>
        <div class="coord-section">
          <span class="coord-section-label">A Pergunta</span>
          <p class="coord-question">"${coord.question}"</p>
        </div>
        <div class="coord-section" style="margin-top: 0.8rem;">
          <span class="coord-section-label risk-label">O Risco</span>
          <p class="coord-risk">${coord.risk}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    container.appendChild(grid);
    return container;
  }

  function createAdminView() {
    const container = document.createElement('div');
    container.className = 'admin-container';

    // Seção para adicionar conteúdo
    const addSection = document.createElement('div');
    addSection.className = 'section-box';
    addSection.style.marginBottom = '2.5rem';
    addSection.innerHTML = `
      <div class="section-box-header">
        <h2>Adicionar Novo <span>Conteúdo</span></h2>
      </div>
      
      <div class="admin-form-group">
        <label for="admin-content-type">Tipo de Conteúdo</label>
        <select id="admin-content-type" class="admin-select">
          <option value="tool">Ferramenta de IA (Toolbox)</option>
          <option value="insight">Artigo / Insight do LinkedIn</option>
          <option value="news">Novidade no Radar (China/Lançamentos)</option>
        </select>
      </div>

      <div id="admin-dynamic-form" style="margin-top: 1.5rem;">
        <!-- Formulário dinâmico injetado abaixo -->
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem;">
        <button class="btn-primary" id="admin-btn-save">
          <i data-lucide="plus-circle"></i>
          <span>Salvar no Portal</span>
        </button>
        <button class="btn-secondary" id="admin-btn-reset-db" style="color: var(--brand-terracotta); border-color: rgba(158,62,42,0.3);">
          <i data-lucide="trash-2"></i>
          <span>Restaurar Originais</span>
        </button>
      </div>
    `;
    container.appendChild(addSection);

    // Seção para exportação de dados
    const exportSection = document.createElement('div');
    exportSection.className = 'section-box';
    exportSection.innerHTML = `
      <div class="section-box-header">
        <h2>Código do Banco de Dados <span>(data.js)</span></h2>
        <button class="see-all-link" id="admin-btn-copy-db">
          <i data-lucide="copy"></i>
          <span>Copiar Código</span>
        </button>
      </div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Copie o código gerado no campo abaixo e substitua inteiramente o conteúdo do arquivo <code>js/data.js</code> na pasta do seu computador para salvar suas alterações de forma definitiva para todos os usuários.</p>
      <textarea id="admin-db-textarea" class="admin-textarea" readonly></textarea>
    `;
    container.appendChild(exportSection);

    // Elementos do Admin
    const typeSelect = addSection.querySelector('#admin-content-type');
    const formContainer = addSection.querySelector('#admin-dynamic-form');
    const saveBtn = addSection.querySelector('#admin-btn-save');
    const resetBtn = addSection.querySelector('#admin-btn-reset-db');
    const copyBtn = exportSection.querySelector('#admin-btn-copy-db');
    const dbTextarea = exportSection.querySelector('#admin-db-textarea');

    // Inicialização do Form Dinâmico e da Textarea
    renderDynamicForm();
    updateDbTextarea();

    // Listener para trocar de form
    typeSelect.addEventListener('change', () => {
      renderDynamicForm();
    });

    // Função de renderizar formulários dinâmicos
    function renderDynamicForm() {
      const type = typeSelect.value;
      formContainer.innerHTML = '';

      if (type === 'tool') {
        formContainer.innerHTML = `
          <div class="admin-grid-inputs">
            <div class="admin-form-group">
              <label for="tool-name">Nome da Ferramenta</label>
              <input type="text" id="tool-name" class="search-input" style="padding-left:1rem;" placeholder="Ex: Claude 4" required>
            </div>
            <div class="admin-form-group">
              <label for="tool-provider">Provedor</label>
              <input type="text" id="tool-provider" class="search-input" style="padding-left:1rem;" placeholder="Ex: Anthropic" required>
            </div>
            <div class="admin-form-group">
              <label for="tool-price">Modelo Comercial (Preço)</label>
              <input type="text" id="tool-price" class="search-input" style="padding-left:1rem;" placeholder="Ex: Freemium ou Pago" required>
            </div>
            <div class="admin-form-group">
              <label for="tool-link">Link Oficial (URL)</label>
              <input type="url" id="tool-link" class="search-input" style="padding-left:1rem;" placeholder="Ex: https://claude.ai" required>
            </div>
            <div class="admin-form-group">
              <label for="tool-category">Categoria do Mapa</label>
              <select id="tool-category" class="admin-select">
                <option value="llm">LLMs & Chats / Raciocínio</option>
                <option value="productivity">Produtividade / Slides / Síntese</option>
                <option value="media">Design / Vídeo / Imagem / Áudio</option>
                <option value="data">Dados & Planilhas</option>
                <option value="development">Desenvolvimento / Automação</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label for="tool-tag">Tag de Destaque</label>
              <input type="text" id="tool-tag" class="search-input" style="padding-left:1rem;" placeholder="Ex: Recomendada ou Novidade" required>
            </div>
          </div>
          <div class="admin-form-group" style="margin-top:1rem;">
            <label for="tool-desc">Descrição de Mercado</label>
            <textarea id="tool-desc" class="admin-textarea-field" placeholder="Descreva brevemente a ferramenta..." required></textarea>
          </div>
          <div class="admin-form-group" style="margin-top:1rem;">
            <label for="tool-usecase">Caso de Uso Específico na Consultoria</label>
            <textarea id="tool-usecase" class="admin-textarea-field" placeholder="Qual o problema que ela resolve na prática corporativa?" required></textarea>
          </div>
        `;
      } else if (type === 'insight') {
        const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        formContainer.innerHTML = `
          <div class="admin-grid-inputs">
            <div class="admin-form-group">
              <label for="art-title">Título do Artigo</label>
              <input type="text" id="art-title" class="search-input" style="padding-left:1rem;" placeholder="Ex: Como estruturar..." required>
            </div>
            <div class="admin-form-group">
              <label for="art-category">Categoria</label>
              <input type="text" id="art-category" class="search-input" style="padding-left:1rem;" placeholder="Ex: Liderança ou Estratégia" required>
            </div>
            <div class="admin-form-group">
              <label for="art-readtime">Tempo de Leitura</label>
              <input type="text" id="art-readtime" class="search-input" style="padding-left:1rem;" placeholder="Ex: 5 min de leitura" required>
            </div>
            <div class="admin-form-group">
              <label for="art-date">Data de Publicação</label>
              <input type="text" id="art-date" class="search-input" style="padding-left:1rem;" value="${todayStr}" required>
            </div>
          </div>
          <div class="admin-form-group" style="margin-top:1rem;">
            <label for="art-summary">Muted Summary (Resumo do LinkedIn)</label>
            <input type="text" id="art-summary" class="search-input" style="padding-left:1rem;" placeholder="Breve chamada explicativa para atrair leitores..." required>
          </div>
          <div class="admin-form-group" style="margin-top:1rem;">
            <label for="art-content">Conteúdo Completo do Artigo (Suporta Markdown básico)</label>
            <textarea id="art-content" class="admin-textarea-field" style="height:250px;" placeholder="Escreva as seções do artigo. Use '### Título' para tópicos e '* item' para marcadores. Use '*Recomendação Lídart:* ...' para criar caixas de destaque." required></textarea>
          </div>
        `;
      } else if (type === 'news') {
        const todayStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        formContainer.innerHTML = `
          <div class="admin-grid-inputs">
            <div class="admin-form-group">
              <label for="news-title">Título do Lançamento / Notícia</label>
              <input type="text" id="news-title" class="search-input" style="padding-left:1rem;" placeholder="Ex: DeepSeek lança..." required>
            </div>
            <div class="admin-form-group">
              <label for="news-provider">Provedor / Origem</label>
              <input type="text" id="news-provider" class="search-input" style="padding-left:1rem;" placeholder="Ex: DeepSeek (China)" required>
            </div>
            <div class="admin-form-group">
              <label for="news-date">Data</label>
              <input type="text" id="news-date" class="search-input" style="padding-left:1rem;" value="${todayStr}" required>
            </div>
            <div class="admin-form-group">
              <label for="news-impact">Nível de Impacto de Negócio</label>
              <select id="news-impact" class="admin-select">
                <option value="Alta">Impacto de Negócio: Alto 🔥</option>
                <option value="Média">Impacto de Negócio: Médio ⚡</option>
              </select>
            </div>
          </div>
          <div class="admin-form-group" style="margin-top:1rem;">
            <label for="news-desc">O que foi Lançado (Descrição da Notícia)</label>
            <textarea id="news-desc" class="admin-textarea-field" placeholder="Escreva brevemente o anúncio técnico..." required></textarea>
          </div>
          <div class="admin-form-group" style="margin-top:1rem;">
            <label for="news-analysis">Análise Executiva da Lídart (Por que isso importa para líderes?)</label>
            <textarea id="news-analysis" class="admin-textarea-field" placeholder="Qual a relevância comercial e custos disso para empresas?" required></textarea>
          </div>
        `;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Salvar novos conteúdos no banco
    saveBtn.addEventListener('click', () => {
      const type = typeSelect.value;

      if (type === 'tool') {
        const name = formContainer.querySelector('#tool-name').value;
        const provider = formContainer.querySelector('#tool-provider').value;
        const price = formContainer.querySelector('#tool-price').value;
        const link = formContainer.querySelector('#tool-link').value;
        const category = formContainer.querySelector('#tool-category').value;
        const tag = formContainer.querySelector('#tool-tag').value;
        const description = formContainer.querySelector('#tool-desc').value;
        const useCase = formContainer.querySelector('#tool-usecase').value;

        if (!name || !provider || !description) {
          alert('Preencha os campos obrigatórios!');
          return;
        }

        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const newTool = { id, name, provider, category, description, rating: 4.8, price, tag, useCase, link };
        
        lidartData.tools.unshift(newTool);
        
      } else if (type === 'insight') {
        const title = formContainer.querySelector('#art-title').value;
        const category = formContainer.querySelector('#art-category').value;
        const readTime = formContainer.querySelector('#art-readtime').value;
        const date = formContainer.querySelector('#art-date').value;
        const summary = formContainer.querySelector('#art-summary').value;
        const content = formContainer.querySelector('#art-content').value;

        if (!title || !content) {
          alert('Preencha os campos obrigatórios!');
          return;
        }

        const id = 'art-custom-' + Date.now();
        const newArt = { id, title, summary, readTime, category, date, content };
        
        lidartData.insights.unshift(newArt);

      } else if (type === 'news') {
        const title = formContainer.querySelector('#news-title').value;
        const provider = formContainer.querySelector('#news-provider').value;
        const date = formContainer.querySelector('#news-date').value;
        const impactLevel = formContainer.querySelector('#news-impact').value;
        const description = formContainer.querySelector('#news-desc').value;
        const impactAnalysis = formContainer.querySelector('#news-analysis').value;

        if (!title || !description) {
          alert('Preencha os campos obrigatórios!');
          return;
        }

        const id = 'news-custom-' + Date.now();
        const newNews = { id, date, provider, title, description, impactLevel, impactAnalysis };
        
        lidartData.radar.unshift(newNews);
      }

      // Persistir no localStorage
      localStorage.setItem('lidart_custom_data', JSON.stringify({
        tools: lidartData.tools,
        insights: lidartData.insights,
        radar: lidartData.radar,
        cases: lidartData.cases
      }));

      alert('Conteúdo adicionado com sucesso localmente! Verifique a aba correspondente.');
      
      // Limpa inputs
      renderDynamicForm();
      // Atualiza banco no textarea
      updateDbTextarea();
    });

    // Restaurar originais do portal
    resetBtn.addEventListener('click', () => {
      if (confirm('Tem certeza de que deseja apagar todas as atualizações locais e restaurar a base original da plataforma?')) {
        localStorage.removeItem('lidart_custom_data');
        window.location.reload();
      }
    });

    // Copiar código da textarea
    copyBtn.addEventListener('click', () => {
      dbTextarea.select();
      document.execCommand('copy');
      alert('Código do banco de dados copiado para a área de transferência!');
    });

    // Atualizar visualização do código
    function updateDbTextarea() {
      const dataStr = `// Banco de Dados Simulado da Plataforma Lidart Insights - Código Atualizado pelo Admin\n\nconst lidartData = ${JSON.stringify(lidartData, null, 2)};\n`;
      dbTextarea.value = dataStr;
    }

    return container;
  }
});

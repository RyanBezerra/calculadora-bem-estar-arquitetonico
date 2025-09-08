// Menu hamburguer
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-list');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('show');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Rolagem suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Animação dos cards ao entrar na viewport
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.transform = 'translateY(0)';
      entry.target.style.opacity = '1';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.visual-card, .feature-card, .benefit-item').forEach(card => {
  card.style.transform = 'translateY(20px)';
  card.style.opacity = '0';
  card.style.transition = 'all 0.6s ease';
  observer.observe(card);
});

// Calculadora de Bem-Estar Arquitetônico
function calculateScore(values) {
  const light = Number(values.light) || 0;
  const air = Number(values.air) || 0;
  const plants = Math.max(0, Number(values.plants) || 0);
  const materials = Number(values.materials) || 0;
  const noise = Number(values.noise) || 0;

  // Normalizações
  const plantsPct = Math.min(100, plants * 8); // 0-12 plantas ~ 0-100
  const noiseInv = 100 - noise; // menos ruído é melhor

  // Pesos inspirados em literatura de biofilia
  const weights = { light: 0.28, air: 0.26, plants: 0.18, materials: 0.14, noise: 0.14 };
  const score = (
    light * weights.light +
    air * weights.air +
    plantsPct * weights.plants +
    materials * weights.materials +
    noiseInv * weights.noise
  );
  return Math.round(score);
}

function buildRecommendations(values) {
  const recs = [];
  if (values.light < 60) recs.push('Aumente a luz natural: aproveite janelas, claraboias ou superfícies reflexivas.');
  if (values.air < 60) recs.push('Melhore ventilação: cruzada, exaustão ou plantas purificadoras (jiboia, espada-de-são-jorge).');
  if ((Number(values.plants) || 0) < 6) recs.push('Adicione mais plantas distribuídas pelo espaço para reduzir estresse e ruído.');
  if (values.materials < 50) recs.push('Incorpore materiais naturais: madeira aparente, pedra, fibras e tecidos texturizados.');
  if (values.noise > 40) recs.push('Trate o ruído: painéis acústicos, tapetes, cortinas e vedação de portas.');
  if (!recs.length) recs.push('Ambiente muito equilibrado! Faça manutenção contínua e monitore sazonalmente.');
  return recs;
}

function drawGainChart(canvas, currentScore) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  // Configurações do gráfico
  const margin = 40;
  const barWidth = 80;
  const maxHeight = height - margin * 2;
  const x1 = width / 2 - barWidth - 20;
  const x2 = width / 2 + 20;

  const improved = Math.min(100, Math.round(currentScore + (100 - currentScore) * 0.35));

  // Fundo do gráfico
  ctx.fillStyle = '#1a2d30';
  ctx.fillRect(0, 0, width, height);

  // Eixos
  ctx.strokeStyle = '#a8b5b3';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = margin + (i / 4) * maxHeight;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
  }

  // Função para desenhar barra
  function drawBar(x, value, color) {
    const barHeight = (value / 100) * maxHeight;
    const y = height - margin - barHeight;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 2, y + 2, barWidth, barHeight);
    
    // Barra principal
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Valor
    ctx.fillStyle = '#F0F2F0';
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(value + '/100', x + barWidth / 2, y - 8);
  }

  // Títulos
  ctx.fillStyle = '#a8b5b3';
  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Atual', x1 + barWidth / 2, height - 8);
  ctx.fillText('Após melhorias', x2 + barWidth / 2, height - 8);

  // Desenhar barras
  drawBar(x1, currentScore, '#5D8C87');
  drawBar(x2, improved, '#718C56');
}

function initCalculator() {
  const form = document.getElementById('calcForm');
  if (!form) return;
  
  const scoreEl = document.getElementById('scoreValue');
  const barEl = document.getElementById('scoreBar');
  const recsEl = document.getElementById('recsList');
  const chart = document.getElementById('gainChart');

  function getValues() {
    const data = new FormData(form);
    return {
      light: Number(data.get('light')),
      air: Number(data.get('air')),
      plants: Number(data.get('plants')),
      materials: Number(data.get('materials')),
      noise: Number(data.get('noise')),
    };
  }

  function render() {
    const values = getValues();
    const score = calculateScore(values);
    
    // Atualizar score
    scoreEl.textContent = String(score);
    barEl.style.width = score + '%';
    
    // Atualizar recomendações
    recsEl.innerHTML = '';
    buildRecommendations(values).forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      recsEl.appendChild(li);
    });
    
    // Atualizar gráfico
    drawGainChart(chart, score);
  }

  // Event listeners
  form.addEventListener('submit', e => {
    e.preventDefault();
    render();
  });
  
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', render);
  });
  
  // Render inicial
  render();
}

// Inicializar calculadora quando a página carregar
document.addEventListener('DOMContentLoaded', initCalculator);

// Adicionar efeito de hover nos botões
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px)';
  });
  
  btn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// Adicionar animação de contagem nos números dos benefícios
function animateNumbers() {
  const numbers = document.querySelectorAll('.benefit-number');
  
  numbers.forEach(number => {
    const target = parseInt(number.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      const prefix = number.textContent.includes('+') ? '+' : '';
      const suffix = number.textContent.includes('%') ? '%' : '';
      number.textContent = prefix + Math.floor(current) + suffix;
    }, 16);
  });
}

// Animar números quando a seção de benefícios entrar na viewport
const benefitsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateNumbers();
      benefitsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const benefitsSection = document.querySelector('.benefits');
if (benefitsSection) {
  benefitsObserver.observe(benefitsSection);
}
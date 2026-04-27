// CLASSES (Entidades)
class Usuario {
  constructor(nome, email, senha, papel) {
    this.id = ++DB.seq.usuario;
    this.nome = nome;
    this.email = email;
    this.senhaHash = btoa(senha);
    this.papel = papel;
    this.dataCadastro = new Date().toLocaleDateString('pt-BR');
  }
}

class Categoria {
  constructor(nome, descricao) {
    this.id = ++DB.seq.categoria;
    this.nome = nome;
    this.descricao = descricao;
  }
}

class Curso {
  constructor(titulo, desc, instrutorId, categoriaId, nivel, totalAulas, totalHoras) {
    this.id = ++DB.seq.curso;
    this.titulo = titulo;
    this.descricao = desc;
    this.instrutorId = instrutorId;
    this.categoriaId = categoriaId;
    this.nivel = nivel;
    this.totalAulas = totalAulas;
    this.totalHoras = totalHoras;
    this.dataPublicacao = new Date().toLocaleDateString('pt-BR');
  }
}

class Modulo {
  constructor(cursoId, titulo, ordem) {
    this.id = ++DB.seq.modulo;
    this.cursoId = cursoId;
    this.titulo = titulo;
    this.ordem = ordem;
  }
}

class Aula {
  constructor(moduloId, titulo, tipo, url, duracao, ordem) {
    this.id = ++DB.seq.aula;
    this.moduloId = moduloId;
    this.titulo = titulo;
    this.tipo = tipo;
    this.url = url;
    this.duracao = duracao;
    this.ordem = ordem;
  }
}

class Matricula {
  constructor(usuarioId, cursoId) {
    this.id = ++DB.seq.matricula;
    this.usuarioId = usuarioId;
    this.cursoId = cursoId;
    this.dataMatricula = new Date().toLocaleDateString('pt-BR');
    this.dataConclusao = null;
  }
}

class ProgressoAula {
  constructor(usuarioId, aulaId) {
    this.usuarioId = usuarioId;
    this.aulaId = aulaId;
    this.status = 'Concluído';
    this.dataConclusao = new Date().toLocaleDateString('pt-BR');
  }
}

class Avaliacao {
  constructor(usuarioId, cursoId, nota, comentario) {
    this.id = ++DB.seq.avaliacao;
    this.usuarioId = usuarioId;
    this.cursoId = cursoId;
    this.nota = nota;
    this.comentario = comentario;
    this.dataAvaliacao = new Date().toLocaleDateString('pt-BR');
  }
}

class Trilha {
  constructor(titulo, desc, categoriaId) {
    this.id = ++DB.seq.trilha;
    this.titulo = titulo;
    this.descricao = desc;
    this.categoriaId = categoriaId;
  }
}

class TrilhaCurso {
  constructor(trilhaId, cursoId, ordem) {
    this.trilhaId = trilhaId;
    this.cursoId = cursoId;
    this.ordem = ordem;
  }
}

class Certificado {
  constructor(usuarioId, cursoId, trilhaId) {
    this.id = ++DB.seq.certificado;
    this.usuarioId = usuarioId;
    this.cursoId = cursoId;
    this.trilhaId = trilhaId || null;
    this.codigoVerificacao = 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    this.dataEmissao = new Date().toLocaleDateString('pt-BR');
  }
}

class Plano {
  constructor(nome, desc, preco, duracao) {
    this.id = ++DB.seq.plano;
    this.nome = nome;
    this.descricao = desc;
    this.preco = preco;
    this.duracaoMeses = duracao;
  }
}

class Assinatura {
  constructor(usuarioId, planoId) {
    this.id = ++DB.seq.assinatura;
    this.usuarioId = usuarioId;
    this.planoId = planoId;
    const hoje = new Date();
    this.dataInicio = hoje.toLocaleDateString('pt-BR');
    const fim = new Date(hoje);
    const plano = DB.planos.find(p => p.id === planoId);
    fim.setMonth(fim.getMonth() + (plano ? plano.duracaoMeses : 1));
    this.dataFim = fim.toLocaleDateString('pt-BR');
  }
}

class Pagamento {
  constructor(assinaturaId, valor, metodo) {
    this.id = ++DB.seq.pagamento;
    this.assinaturaId = assinaturaId;
    this.valorPago = valor;
    this.dataPagamento = new Date().toLocaleDateString('pt-BR');
    this.metodoPagamento = metodo;
    this.idTransacaoGateway = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

// BANCO DE DADOS EM MEMÓRIA
const DB = {
  seq: { usuario: 0, categoria: 0, curso: 0, modulo: 0, aula: 0, matricula: 0, avaliacao: 0, trilha: 0, certificado: 0, plano: 0, assinatura: 0, pagamento: 0 },
  usuarios: [], categorias: [], cursos: [], modulos: [], aulas: [],
  matriculas: [], progressoAulas: [], avaliacoes: [], trilhas: [], trilhasCursos: [],
  certificados: [], planos: [], assinaturas: [], pagamentos: []
};

// TOAST
function toast(msg, err = false) {
  const el = document.createElement('div');
  el.className = 'toast-msg' + (err ? ' error' : '');
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// NAVEGAÇÃO
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  event.target.classList.add('active');
  if (id === 'dashboard') updateDashboard();
  populateSelects();
}

// SELECTS DINÂMICOS
function populateSelect(id, items, valFn, labelFn, emptyLabel = 'Selecione') {
  const el = document.getElementById(id);
  if (!el) return;
  const val = el.value;
  el.innerHTML = `<option value="">${emptyLabel}</option>`;
  items.forEach(i => el.innerHTML += `<option value="${valFn(i)}">${labelFn(i)}</option>`);
  if (val) el.value = val;
}
function populateSelects() {
  const us = DB.usuarios, cr = DB.cursos, ct = DB.categorias, md = DB.modulos, tl = DB.trilhas, pl = DB.planos, al = DB.aulas;
  populateSelect('cr-instrutor', us, u => u.id, u => u.nome);
  populateSelect('cr-categoria', ct, c => c.id, c => c.nome);
  populateSelect('m-curso', cr, c => c.id, c => c.titulo);
  populateSelect('a-modulo', md, m => m.id, m => `${m.titulo} (${getCurso(m.cursoId)?.titulo || ''})`);
  populateSelect('t-cat', ct, c => c.id, c => c.nome, 'Nenhuma');
  populateSelect('tc-trilha', tl, t => t.id, t => t.titulo);
  populateSelect('tc-curso', cr, c => c.id, c => c.titulo);
  populateSelect('mt-usuario', us, u => u.id, u => u.nome);
  populateSelect('mt-curso', cr, c => c.id, c => c.titulo);
  populateSelect('p-usuario', us, u => u.id, u => u.nome);
  populateSelect('p-aula', al, a => a.id, a => a.titulo);
  populateSelect('av-usuario', us, u => u.id, u => u.nome);
  populateSelect('av-curso', cr, c => c.id, c => c.titulo);
  populateSelect('as-usuario', us, u => u.id, u => u.nome);
  populateSelect('as-plano', pl, p => p.id, p => `${p.nome} — R$${parseFloat(p.preco).toFixed(2)}`);
  populateSelect('ce-usuario', us, u => u.id, u => u.nome);
  populateSelect('ce-curso', cr, c => c.id, c => c.titulo);
  populateSelect('ce-trilha', tl, t => t.id, t => t.titulo, 'Nenhuma');
  // filtro de categorias nos cursos
  populateSelect('filtro-cat', ct, c => c.id, c => c.nome, 'Todas categorias');
}

// HELPERS
const getUsuario = id => DB.usuarios.find(u => u.id == id);
const getCurso = id => DB.cursos.find(c => c.id == id);
const getCategoria = id => DB.categorias.find(c => c.id == id);
const getModulo = id => DB.modulos.find(m => m.id == id);
const getAula = id => DB.aulas.find(a => a.id == id);
const getTrilha = id => DB.trilhas.find(t => t.id == id);
const getPlano = id => DB.planos.find(p => p.id == id);
const emptyRow = cols => `<tr><td colspan="${cols}" class="table-empty">Nenhum registro ainda.</td></tr>`;
function nivelBadge(n) {
  const cls = n === 'Iniciante' ? 'badge-iniciante' : n === 'Intermediário' ? 'badge-intermediario' : 'badge-avancado';
  return `<span class="badge-level ${cls}">${n}</span>`;
}
function starStr(n) { return '⭐'.repeat(n); }

// VALIDAÇÃO
function validate(fields) {
  for (const [val, msg] of fields) {
    if (!val || (typeof val === 'string' && !val.trim())) { toast(msg, true); return false; }
  }
  return true;
}
function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

// USUARIOS
document.getElementById('form-usuario').addEventListener('submit', function (e) {
  e.preventDefault();
  const nome = document.getElementById('u-nome').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const senha = document.getElementById('u-senha').value;
  const papel = document.getElementById('u-papel').value;
  if (!validate([[nome, 'Nome obrigatório'], [email, 'E-mail obrigatório'], [senha, 'Senha obrigatória']])) return;
  if (!validEmail(email)) { toast('E-mail inválido', true); return; }
  if (senha.length < 6) { toast('Senha mínimo 6 caracteres', true); return; }
  if (DB.usuarios.find(u => u.email === email)) { toast('E-mail já cadastrado', true); return; }
  DB.usuarios.push(new Usuario(nome, email, senha, papel));
  this.reset(); toast('Usuário cadastrado!'); renderUsuarios(); populateSelects();
});
function renderUsuarios() {
  const q = document.getElementById('search-usuario').value.toLowerCase();
  const list = DB.usuarios.filter(u => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const tb = document.getElementById('tb-usuarios');
  if (!list.length) { tb.innerHTML = emptyRow(6); return; }
  tb.innerHTML = list.map(u => `<tr>
<td class="mono text-muted" style="font-size:.75rem;">#${u.id}</td>
<td>${u.nome}</td>
<td class="text-muted">${u.email}</td>
<td><span class="badge-status badge-ativo">${u.papel}</span></td>
<td class="text-muted">${u.dataCadastro}</td>
<td><button class="btn btn-outline-muted btn-sm" onclick="deleteItem('usuarios',${u.id},'renderUsuarios')">✕</button></td>
</tr>`).join('');
}

// CATEGORIAS
document.getElementById('form-categoria').addEventListener('submit', function (e) {
  e.preventDefault();
  const nome = document.getElementById('c-nome').value.trim();
  const desc = document.getElementById('c-desc').value.trim();
  if (!validate([[nome, 'Nome obrigatório']])) return;
  if (DB.categorias.find(c => c.nome.toLowerCase() === nome.toLowerCase())) { toast('Categoria já existe', true); return; }
  DB.categorias.push(new Categoria(nome, desc));
  this.reset(); toast('Categoria criada!'); renderCategorias(); populateSelects();
});
function renderCategorias() {
  const tb = document.getElementById('tb-categorias');
  if (!DB.categorias.length) { tb.innerHTML = emptyRow(5); return; }
  tb.innerHTML = DB.categorias.map(c => {
    const qtd = DB.cursos.filter(cr => cr.categoriaId == c.id).length;
    return `<tr>
  <td class="mono text-muted" style="font-size:.75rem;">#${c.id}</td>
  <td><strong>${c.nome}</strong></td>
  <td class="text-muted">${c.descricao || '—'}</td>
  <td><span class="badge-status badge-ativo">${qtd}</span></td>
  <td><button class="btn btn-outline-muted btn-sm" onclick="deleteItem('categorias',${c.id},'renderCategorias')">✕</button></td>
</tr>`;
  }).join('');
}

// CURSOS
document.getElementById('form-curso').addEventListener('submit', function (e) {
  e.preventDefault();
  const titulo = document.getElementById('cr-titulo').value.trim();
  const desc = document.getElementById('cr-desc').value.trim();
  const instrutorId = document.getElementById('cr-instrutor').value;
  const catId = document.getElementById('cr-categoria').value;
  const nivel = document.getElementById('cr-nivel').value;
  const aulas = document.getElementById('cr-aulas').value;
  const horas = document.getElementById('cr-horas').value;
  if (!validate([[titulo, 'Título obrigatório'], [instrutorId, 'Selecione o instrutor'], [catId, 'Selecione a categoria'], [nivel, 'Selecione o nível']])) return;
  DB.cursos.push(new Curso(titulo, desc, +instrutorId, +catId, nivel, +aulas, +horas));
  this.reset(); toast('Curso cadastrado!'); renderCursos(); populateSelects();
});
function renderCursos() {
  const filtro = document.getElementById('filtro-cat').value;
  const list = filtro ? DB.cursos.filter(c => c.categoriaId == filtro) : DB.cursos;
  const tb = document.getElementById('tb-cursos');
  if (!list.length) { tb.innerHTML = emptyRow(7); return; }
  tb.innerHTML = list.map(c => `<tr>
<td class="mono text-muted" style="font-size:.75rem;">#${c.id}</td>
<td><strong>${c.titulo}</strong></td>
<td>${getUsuario(c.instrutorId)?.nome || '—'}</td>
<td>${getCategoria(c.categoriaId)?.nome || '—'}</td>
<td>${nivelBadge(c.nivel)}</td>
<td>${c.totalAulas}</td>
<td><button class="btn btn-outline-muted btn-sm" onclick="deleteItem('cursos',${c.id},'renderCursos')">✕</button></td>
</tr>`).join('');
}

// MODULOS
document.getElementById('form-modulo').addEventListener('submit', function (e) {
  e.preventDefault();
  const cursoId = document.getElementById('m-curso').value;
  const titulo = document.getElementById('m-titulo').value.trim();
  const ordem = document.getElementById('m-ordem').value;
  if (!validate([[cursoId, 'Selecione o curso'], [titulo, 'Título obrigatório']])) return;
  DB.modulos.push(new Modulo(+cursoId, titulo, +ordem));
  this.reset(); toast('Módulo adicionado!'); renderModulos(); populateSelects();
});
function renderModulos() {
  const tb = document.getElementById('tb-modulos');
  if (!DB.modulos.length) { tb.innerHTML = emptyRow(5); return; }
  const sorted = [...DB.modulos].sort((a, b) => a.cursoId - b.cursoId || a.ordem - b.ordem);
  tb.innerHTML = sorted.map(m => `<tr>
<td class="mono text-muted" style="font-size:.75rem;">#${m.id}</td>
<td>${getCurso(m.cursoId)?.titulo || '—'}</td>
<td>${m.titulo}</td>
<td>${m.ordem}</td>
<td><button class="btn btn-outline-muted btn-sm" onclick="deleteItem('modulos',${m.id},'renderModulos')">✕</button></td>
</tr>`).join('');
}

// AULAS
document.getElementById('form-aula').addEventListener('submit', function (e) {
  e.preventDefault();
  const moduloId = document.getElementById('a-modulo').value;
  const titulo = document.getElementById('a-titulo').value.trim();
  const tipo = document.getElementById('a-tipo').value;
  const url = document.getElementById('a-url').value.trim();
  const duracao = document.getElementById('a-duracao').value;
  const ordem = document.getElementById('a-ordem').value;
  if (!validate([[moduloId, 'Selecione o módulo'], [titulo, 'Título obrigatório']])) return;
  DB.aulas.push(new Aula(+moduloId, titulo, tipo, url, +duracao, +ordem));
  this.reset(); toast('Aula adicionada!'); renderAulas(); populateSelects();
});
function renderAulas() {
  const tb = document.getElementById('tb-aulas');
  if (!DB.aulas.length) { tb.innerHTML = emptyRow(6); return; }
  const sorted = [...DB.aulas].sort((a, b) => a.moduloId - b.moduloId || a.ordem - b.ordem);
  tb.innerHTML = sorted.map(a => `<tr>
<td class="mono text-muted" style="font-size:.75rem;">#${a.id}</td>
<td>${getModulo(a.moduloId)?.titulo || '—'}</td>
<td>${a.titulo}</td>
<td><span class="badge-status badge-ativo">${a.tipo}</span></td>
<td>${a.duracao}min</td>
<td>${a.ordem}</td>
</tr>`).join('');
}

// TRILHAS
document.getElementById('form-trilha').addEventListener('submit', function (e) {
  e.preventDefault();
  const titulo = document.getElementById('t-titulo').value.trim();
  const desc = document.getElementById('t-desc').value.trim();
  const catId = document.getElementById('t-cat').value;
  if (!validate([[titulo, 'Título obrigatório']])) return;
  DB.trilhas.push(new Trilha(titulo, desc, catId ? +catId : null));
  this.reset(); toast('Trilha criada!'); renderTrilhas(); populateSelects();
});
document.getElementById('form-trilha-curso').addEventListener('submit', function (e) {
  e.preventDefault();
  const trilhaId = document.getElementById('tc-trilha').value;
  const cursoId = document.getElementById('tc-curso').value;
  const ordem = document.getElementById('tc-ordem').value;
  if (!validate([[trilhaId, 'Selecione a trilha'], [cursoId, 'Selecione o curso']])) return;
  if (DB.trilhasCursos.find(tc => tc.trilhaId == trilhaId && tc.cursoId == cursoId)) { toast('Curso já está nessa trilha', true); return; }
  DB.trilhasCursos.push(new TrilhaCurso(+trilhaId, +cursoId, +ordem));
  this.reset(); toast('Curso adicionado à trilha!'); renderTrilhas();
});
function renderTrilhas() {
  const tb = document.getElementById('tb-trilhas');
  if (!DB.trilhas.length) { tb.innerHTML = emptyRow(5); return; }
  tb.innerHTML = DB.trilhas.map(t => {
    const qtd = DB.trilhasCursos.filter(tc => tc.trilhaId === t.id).length;
    const cat = getCategoria(t.categoriaId);
    return `<tr>
  <td class="mono text-muted" style="font-size:.75rem;">#${t.id}</td>
  <td><strong>${t.titulo}</strong></td>
  <td>${cat?.nome || '—'}</td>
  <td><span class="badge-status badge-ativo">${qtd} curso(s)</span></td>
  <td><button class="btn btn-accent2 btn-sm" onclick="showTrilhaModal(${t.id})">Ver</button></td>
</tr>`;
  }).join('');
}
function showTrilhaModal(id) {
  const t = getTrilha(id);
  const cursos = DB.trilhasCursos.filter(tc => tc.trilhaId === id).sort((a, b) => a.ordem - b.ordem);
  let html = `<h6 class="text-accent mb-3">${t.titulo}</h6>`;
  if (!cursos.length) { html += '<p class="text-muted">Nenhum curso nesta trilha.</p>'; }
  else html += cursos.map(tc => {
    const c = getCurso(tc.cursoId);
    return `<div class="d-flex align-items-center gap-3 mb-2 p-2" style="background:var(--surface2);border-radius:8px;">
  <span class="mono text-muted" style="font-size:.75rem;">${tc.ordem}</span>
  <div><div>${c?.titulo || '—'}</div><div class="text-muted" style="font-size:.78rem;">${c?.nivel || ''}</div></div>
</div>`;
  }).join('');
  document.getElementById('modal-trilha-body').innerHTML = html;
  new bootstrap.Modal(document.getElementById('modalTrilha')).show();
}

// MATRÍCULAS
document.getElementById('form-matricula').addEventListener('submit', function (e) {
  e.preventDefault();
  const usuarioId = document.getElementById('mt-usuario').value;
  const cursoId = document.getElementById('mt-curso').value;
  if (!validate([[usuarioId, 'Selecione o aluno'], [cursoId, 'Selecione o curso']])) return;
  if (DB.matriculas.find(m => m.usuarioId == usuarioId && m.cursoId == cursoId)) { toast('Aluno já matriculado neste curso', true); return; }
  DB.matriculas.push(new Matricula(+usuarioId, +cursoId));
  this.reset(); toast('Matrícula realizada!'); renderMatriculas();
});
function renderMatriculas() {
  const tb = document.getElementById('tb-matriculas');
  if (!DB.matriculas.length) { tb.innerHTML = emptyRow(6); return; }
  tb.innerHTML = DB.matriculas.map(m => `<tr>
<td class="mono text-muted" style="font-size:.75rem;">#${m.id}</td>
<td>${getUsuario(m.usuarioId)?.nome || '—'}</td>
<td>${getCurso(m.cursoId)?.titulo || '—'}</td>
<td>${m.dataMatricula}</td>
<td>${m.dataConclusao || '<span class="text-muted">Em andamento</span>'}</td>
<td>
  ${!m.dataConclusao ? `<button class="btn btn-accent btn-sm" onclick="concluirMatricula(${m.id})">Concluir</button>` : `<span class="badge-status badge-concluido">Concluído</span>`}
</td>
</tr>`).join('');
}
function concluirMatricula(id) {
  const m = DB.matriculas.find(x => x.id === id);
  if (m) { m.dataConclusao = new Date().toLocaleDateString('pt-BR'); toast('Matrícula concluída!'); renderMatriculas(); }
}

// PROGRESSO
document.getElementById('form-progresso').addEventListener('submit', function (e) {
  e.preventDefault();
  const usuarioId = document.getElementById('p-usuario').value;
  const aulaId = document.getElementById('p-aula').value;
  if (!validate([[usuarioId, 'Selecione o usuário'], [aulaId, 'Selecione a aula']])) return;
  if (DB.progressoAulas.find(p => p.usuarioId == usuarioId && p.aulaId == aulaId)) { toast('Aula já concluída por este usuário', true); return; }
  DB.progressoAulas.push(new ProgressoAula(+usuarioId, +aulaId));
  this.reset(); toast('Progresso registrado!'); renderProgresso();
});
function renderProgresso() {
  const tb = document.getElementById('tb-progresso');
  if (!DB.progressoAulas.length) { tb.innerHTML = emptyRow(4); return; }
  tb.innerHTML = DB.progressoAulas.map(p => `<tr>
<td>${getUsuario(p.usuarioId)?.nome || '—'}</td>
<td>${getAula(p.aulaId)?.titulo || '—'}</td>
<td><span class="badge-status badge-concluido">${p.status}</span></td>
<td>${p.dataConclusao}</td>
</tr>`).join('');
}

// AVALIAÇÕES
document.getElementById('form-avaliacao').addEventListener('submit', function (e) {
  e.preventDefault();
  const usuarioId = document.getElementById('av-usuario').value;
  const cursoId = document.getElementById('av-curso').value;
  const nota = document.getElementById('av-nota').value;
  const comentario = document.getElementById('av-comentario').value.trim();
  if (!validate([[usuarioId, 'Selecione o usuário'], [cursoId, 'Selecione o curso'], [nota, 'Selecione a nota']])) return;
  DB.avaliacoes.push(new Avaliacao(+usuarioId, +cursoId, +nota, comentario));
  this.reset(); toast('Avaliação enviada!'); renderAvaliacoes();
});
function renderAvaliacoes() {
  const tb = document.getElementById('tb-avaliacoes');
  if (!DB.avaliacoes.length) { tb.innerHTML = emptyRow(5); return; }
  tb.innerHTML = DB.avaliacoes.map(a => `<tr>
<td>${getUsuario(a.usuarioId)?.nome || '—'}</td>
<td>${getCurso(a.cursoId)?.titulo || '—'}</td>
<td>${starStr(a.nota)}</td>
<td class="text-muted">${a.comentario || '—'}</td>
<td class="text-muted">${a.dataAvaliacao}</td>
</tr>`).join('');
}

// PLANOS
document.getElementById('form-plano').addEventListener('submit', function (e) {
  e.preventDefault();
  const nome = document.getElementById('pl-nome').value.trim();
  const desc = document.getElementById('pl-desc').value.trim();
  const preco = document.getElementById('pl-preco').value;
  const dur = document.getElementById('pl-dur').value;
  if (!validate([[nome, 'Nome obrigatório'], [preco, 'Preço obrigatório'], [dur, 'Duração obrigatória']])) return;
  DB.planos.push(new Plano(nome, desc, +preco, +dur));
  this.reset(); toast('Plano criado!'); renderPlanos(); populateSelects();
});

function renderPlanos() {
  const tb = document.getElementById('tb-planos');
  if (!DB.planos.length) { tb.innerHTML = emptyRow(6); return; }
  tb.innerHTML = DB.planos.map(p => `<tr>
<td class="mono text-muted" style="font-size:.75rem;">#${p.id}</td>
<td><strong>${p.nome}</strong></td>
<td class="text-accent">R$ ${parseFloat(p.preco).toFixed(2)}</td>
<td>${p.duracaoMeses} mês(es)</td>
<td class="text-muted">${p.descricao || '—'}</td>
<td><button class="btn btn-outline-muted btn-sm" onclick="deleteItem('planos',${p.id},'renderPlanos')">✕</button></td>
</tr>`).join('');
}

// ASSINATURAS & PAGAMENTOS
document.getElementById('form-assinatura').addEventListener('submit', function (e) {
  e.preventDefault();
  const usuarioId = document.getElementById('as-usuario').value;
  const planoId = document.getElementById('as-plano').value;
  const metodo = document.getElementById('as-metodo').value;
  if (!validate([[usuarioId, 'Selecione o usuário'], [planoId, 'Selecione o plano'], [metodo, 'Selecione o método']])) return;
  const plano = getPlano(+planoId);
  const assinatura = new Assinatura(+usuarioId, +planoId);
  DB.assinaturas.push(assinatura);
  const pagamento = new Pagamento(assinatura.id, plano.preco, metodo);
  DB.pagamentos.push(pagamento);
  this.reset(); toast(`Pagamento confirmado! ID: ${pagamento.idTransacaoGateway}`); renderPagamentos(); populateSelects();
});
function renderPagamentos() {
  const tb = document.getElementById('tb-pagamentos');
  if (!DB.pagamentos.length) { tb.innerHTML = emptyRow(6); return; }
  tb.innerHTML = DB.pagamentos.map(pg => {
    const as = DB.assinaturas.find(a => a.id === pg.assinaturaId);
    return `<tr>
  <td>${getUsuario(as?.usuarioId)?.nome || '—'}</td>
  <td>${getPlano(as?.planoId)?.nome || '—'}</td>
  <td class="text-accent">R$ ${parseFloat(pg.valorPago).toFixed(2)}</td>
  <td>${pg.metodoPagamento}</td>
  <td class="mono" style="font-size:.75rem;">${pg.idTransacaoGateway}</td>
  <td class="text-muted">${pg.dataPagamento}</td>
</tr>`;
  }).join('');
}

// CERTIFICADOS
document.getElementById('form-certificado').addEventListener('submit', function (e) {
  e.preventDefault();
  const usuarioId = document.getElementById('ce-usuario').value;
  const cursoId = document.getElementById('ce-curso').value;
  const trilhaId = document.getElementById('ce-trilha').value;
  if (!validate([[usuarioId, 'Selecione o usuário'], [cursoId, 'Selecione o curso']])) return;
  if (DB.certificados.find(c => c.usuarioId == usuarioId && c.cursoId == cursoId)) { toast('Certificado já emitido para esse par usuário/curso', true); return; }
  const cert = new Certificado(+usuarioId, +cursoId, trilhaId ? +trilhaId : null);
  DB.certificados.push(cert);
  this.reset(); toast('Certificado emitido!'); renderCertificados(); showCertVisual(cert);
});
function showCertVisual(cert) {
  const usuario = getUsuario(cert.usuarioId);
  const curso = getCurso(cert.cursoId);
  const trilha = cert.trilhaId ? getTrilha(cert.trilhaId) : null;
  document.getElementById('cert-visual').innerHTML = `
<div class="cert-card mb-2">
  <div class="text-muted mb-1" style="font-size:.75rem;letter-spacing:2px;text-transform:uppercase;">Certificado de Conclusão</div>
  <div class="cert-title">EduFlow</div>
  <div class="mt-2" style="font-size:.9rem;">Certificamos que <strong>${usuario?.nome || '—'}</strong> concluiu</div>
  <div class="mt-1" style="font-size:1.1rem;font-weight:800;">${curso?.titulo || '—'}</div>
  ${trilha ? `<div class="mt-1 text-muted" style="font-size:.8rem;">Trilha: ${trilha.titulo}</div>` : ''}
  <div class="cert-code mt-3">${cert.codigoVerificacao}</div>
  <div class="mt-2 text-muted" style="font-size:.75rem;">Emitido em ${cert.dataEmissao}</div>
</div>`;
}
function renderCertificados() {
  const tb = document.getElementById('tb-certificados');
  if (!DB.certificados.length) { tb.innerHTML = emptyRow(5); return; }
  tb.innerHTML = DB.certificados.map(c => `<tr>
<td>${getUsuario(c.usuarioId)?.nome || '—'}</td>
<td>${getCurso(c.cursoId)?.titulo || '—'}</td>
<td>${c.trilhaId ? getTrilha(c.trilhaId)?.titulo : '—'}</td>
<td class="mono" style="font-size:.75rem;">${c.codigoVerificacao}</td>
<td class="text-muted">${c.dataEmissao}</td>
</tr>`).join('');
}

// DELETE GENÉRICO
function deleteItem(coll, id, renderFn) {
  DB[coll] = DB[coll].filter(x => x.id !== id);
  toast('Removido.'); window[renderFn](); populateSelects();
}

// DASHBOARD
function updateDashboard() {
  document.getElementById('st-usuarios').textContent = DB.usuarios.length;
  document.getElementById('st-cursos').textContent = DB.cursos.length;
  document.getElementById('st-matriculas').textContent = DB.matriculas.length;
  document.getElementById('st-certificados').textContent = DB.certificados.length;
  const receita = DB.pagamentos.reduce((s, p) => s + parseFloat(p.valorPago || 0), 0);
  document.getElementById('st-receita').textContent = 'R$' + receita.toFixed(0);

  const dashU = document.getElementById('dash-usuarios');
  dashU.innerHTML = DB.usuarios.slice(-5).reverse().map(u => `<div class="d-flex justify-content-between mb-1"><span>${u.nome}</span><span class="text-muted">${u.papel}</span></div>`).join('') || '<span class="text-muted">Nenhum</span>';

  const dashC = document.getElementById('dash-cursos');
  dashC.innerHTML = DB.cursos.slice(-5).reverse().map(c => `<div class="d-flex justify-content-between mb-1"><span>${c.titulo}</span>${nivelBadge(c.nivel)}</div>`).join('') || '<span class="text-muted">Nenhum</span>';

  const dashM = document.getElementById('dash-matriculas');
  dashM.innerHTML = DB.matriculas.slice(-5).reverse().map(m => `<div class="d-flex justify-content-between mb-1"><span>${getUsuario(m.usuarioId)?.nome || '—'}</span><span class="text-muted" style="font-size:.78rem;">${getCurso(m.cursoId)?.titulo || '—'}</span></div>`).join('') || '<span class="text-muted">Nenhuma</span>';
}

// SEED COM DADOS DE EXEMPLO
(function seed() {
  DB.usuarios.push(new Usuario('Ana Lima', 'ana@edu.com', 'senha123', 'Instrutor'));
  DB.usuarios.push(new Usuario('Carlos Souza', 'carlos@edu.com', 'senha123', 'Aluno'));
  DB.usuarios.push(new Usuario('Maria Santos', 'maria@edu.com', 'senha123', 'Aluno'));
  DB.categorias.push(new Categoria('Programação', 'Linguagens e frameworks'));
  DB.categorias.push(new Categoria('Design', 'UI/UX e ferramentas criativas'));
  DB.cursos.push(new Curso('JavaScript Moderno', 'ES6+ do zero ao avançado', 1, 1, 'Intermediário', 48, 12));
  DB.cursos.push(new Curso('UI/UX Design', 'Fundamentos de design de interface', 1, 2, 'Iniciante', 30, 8));
  DB.planos.push(new Plano('Básico', 'Acesso a cursos selecionados', 29.90, 1));
  DB.planos.push(new Plano('Pro', 'Acesso ilimitado', 89.90, 12));
  updateDashboard();
  populateSelects();
})();
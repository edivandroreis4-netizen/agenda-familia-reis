const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const STORAGE = {
  tasks: 'agenda_tasks_v2',
  shopping: 'agenda_shopping_v2',
  bills: 'agenda_bills_v2',
  meds: 'agenda_meds_v2',
  theme: 'agenda_theme_v30',
  notified: 'agenda_notifications_v30',
  profile: 'agenda_profile_v30'
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function withTaskDefaults(task) {
  const fallbackDate = task.date || todayISO();
  return {
    id: task.id,
    name: task.name || task.titulo || 'Tarefa',
    date: fallbackDate,
    day: task.day || getDayLabel(fallbackDate),
    time: task.time || '08:00',
    category: task.category || 'Casa',
    priority: task.priority || 'Média',
    owner: task.owner || task.responsavel || 'Todos',
    done: Boolean(task.done)
  };
}

function withShoppingDefaults(item) {
  return {
    id: item.id,
    name: item.name || 'Item',
    quantity: Number(item.quantity || item.qty || 1),
    estimatedValue: Number(item.estimatedValue || item.value || 0),
    done: Boolean(item.done)
  };
}

function withBillDefaults(bill) {
  return {
    id: bill.id,
    name: bill.name || 'Conta',
    value: Number(bill.value || 0),
    due: bill.due || todayISO(),
    paid: Boolean(bill.paid)
  };
}

let tasks = (JSON.parse(localStorage.getItem(STORAGE.tasks)) || [
  { id: 1, name: 'Oração da manhã', date: todayISO(), day: 'Hoje', time: '07:00', category: 'Igreja', priority: 'Alta', owner: 'Todos', done: false },
  { id: 2, name: 'Organizar a casa', date: todayISO(), day: 'Hoje', time: '09:00', category: 'Casa', priority: 'Média', owner: 'Camila', done: false },
  { id: 3, name: 'Momento em família', date: todayISO(), day: 'Hoje', time: '20:00', category: 'Família', priority: 'Baixa', owner: 'Todos', done: true }
]).map(withTaskDefaults);

let shopping = (JSON.parse(localStorage.getItem(STORAGE.shopping)) || [
  { id: 1, name: 'Arroz', quantity: 1, estimatedValue: 25, done: false },
  { id: 2, name: 'Leite', quantity: 2, estimatedValue: 14, done: true },
  { id: 3, name: 'Café', quantity: 1, estimatedValue: 18, done: false }
]).map(withShoppingDefaults);

let bills = (JSON.parse(localStorage.getItem(STORAGE.bills)) || [
  { id: 1, name: 'Conta de Luz', value: 120, due: todayISO(), paid: false },
  { id: 2, name: 'Conta de Água', value: 85, due: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10), paid: false }
]).map(withBillDefaults);

let meds = JSON.parse(localStorage.getItem(STORAGE.meds)) || [
  { id: 1, name: 'Vitaminas', time: '08:00', frequency: 'Todos os dias', done: false }
];

const bibleQuotes = [
  { text: 'Entrega o teu caminho ao Senhor; confia nele, e o mais Ele fará.', ref: 'Salmos 37,5' },
  { text: 'Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento.', ref: 'Provérbios 3,5' },
  { text: 'Tudo posso naquele que me fortalece.', ref: 'Filipenses 4,13' },
  { text: 'Entregue ao Senhor as tuas obras, e teus planos serão bem-sucedidos.', ref: 'Provérbios 16,3' },
  { text: 'O Senhor é meu pastor, nada me faltará.', ref: 'Salmo 23,1' },
  { text: 'Buscai primeiro o Reino de Deus e a sua justiça.', ref: 'Mateus 6,33' },
  { text: 'Não temas, pois estou contigo.', ref: 'Isaías 41,10' },
  { text: 'O amor é paciente, o amor é bondoso.', ref: '1 Coríntios 13,4' },
  { text: 'Alegrai-vos sempre no Senhor.', ref: 'Filipenses 4,4' },
  { text: 'O Senhor é a minha luz e a minha salvação; a quem temerei?', ref: 'Salmo 27,1' }
];
let quoteIndex = new Date().getDay();
let notifiedIds = JSON.parse(localStorage.getItem(STORAGE.notified)) || [];
let activeProfile = localStorage.getItem(STORAGE.profile) || 'Todos';

function save() {
  localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
  localStorage.setItem(STORAGE.shopping, JSON.stringify(shopping));
  localStorage.setItem(STORAGE.bills, JSON.stringify(bills));
  localStorage.setItem(STORAGE.meds, JSON.stringify(meds));
  localStorage.setItem(STORAGE.notified, JSON.stringify(notifiedIds));
}

function nextId(list) {
  return list.length ? Math.max(...list.map((item) => item.id)) + 1 : 1;
}

function getDayLabel(dateISO) {
  const today = todayISO();
  if (dateISO === today) return 'Hoje';
  const date = new Date(`${dateISO}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date).replace(/^./, (l) => l.toUpperCase());
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function formatDateBR(dateISO) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString('pt-BR');
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getVisibleTasks() {
  if (activeProfile === 'Todos') return tasks;
  return tasks.filter((task) => task.owner === activeProfile || task.owner === 'Todos');
}

function setupProfileSwitch() {
  $$('.profile-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.profile === activeProfile);
    btn.addEventListener('click', () => {
      activeProfile = btn.dataset.profile;
      localStorage.setItem(STORAGE.profile, activeProfile);
      $$('.profile-btn').forEach((b) => b.classList.toggle('active', b.dataset.profile === activeProfile));
      renderAll();
      toast('success', `Perfil: ${activeProfile}`);
    });
  });
}

function toast(icon, title) {
  Swal.fire({ toast: true, position: 'top-end', icon, title, timer: 1800, showConfirmButton: false });
}

function setupSplash() {
  const splash = $('#splashScreen');
  if (!splash) return;
  setTimeout(() => splash.classList.add('hidden'), 1900);
}

function renderQuote(index = quoteIndex, animate = false) {
  const quote = bibleQuotes[index % bibleQuotes.length];
  const quoteText = $('#fraseBiblica');
  const quoteRef = $('#referenciaBiblica');
  const applyQuote = () => {
    quoteText.textContent = `“${quote.text}”`;
    quoteRef.textContent = quote.ref;
    $('#versiculoLateral').textContent = `“${quote.text}” — ${quote.ref}`;
  };
  if (animate) {
    const panel = document.querySelector('.verse-panel');
    panel?.classList.add('quote-changing');
    setTimeout(() => {
      applyQuote();
      panel?.classList.remove('quote-changing');
      panel?.classList.add('quote-changed');
      setTimeout(() => panel?.classList.remove('quote-changed'), 380);
    }, 180);
  } else {
    applyQuote();
  }
}

function setupHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  $('#saudacao').textContent = `${greeting}, Edi e Camila!`;
  $('#dataAtual').textContent = formatDate(new Date());
  renderQuote();
}

function setupTheme() {
  const savedTheme = localStorage.getItem(STORAGE.theme);
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');
  $('#btnTheme')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem(STORAGE.theme, document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });
}

function navigate(page) {
  $$('.page').forEach((p) => p.classList.remove('active-page'));
  $(`#${page}`).classList.add('active-page');
  $$('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.page === page));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function animateNumber(element, target) {
  if (!element) return;
  if (typeof target === 'string') { element.textContent = target; return; }
  const current = Number(element.textContent) || 0;
  if (current === target) return;
  const duration = 520;
  const startTime = performance.now();
  const difference = target - current;
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(current + difference * easedProgress);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function getShoppingTotal() {
  return shopping.reduce((sum, item) => sum + (Number(item.estimatedValue) * Number(item.quantity || 1)), 0);
}

function getBillsTotal() {
  return bills.reduce((sum, bill) => sum + Number(bill.value || 0), 0);
}

function renderStats() {
  const numbers = {
    totalTarefas: getVisibleTasks().length,
    tarefasPendentes: getVisibleTasks().filter((t) => !t.done).length,
    tarefasConcluidas: getVisibleTasks().filter((t) => t.done).length,
    totalCompras: shopping.filter((i) => !i.done).length,
    totalContas: bills.filter((b) => !b.paid).length,
    totalMedicamentos: meds.length
  };
  Object.entries(numbers).forEach(([id, value]) => animateNumber($(`#${id}`), value));
  $('#totalValorContas').textContent = formatMoney(getBillsTotal());
  $('#valorEstimadoCompras').textContent = formatMoney(getShoppingTotal());
  $('#valorComprasPagina').textContent = formatMoney(getShoppingTotal());
  $('#totalContasPagina').textContent = formatMoney(getBillsTotal());
}

function priorityClass(priority) {
  return priority.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getCountdown(task) {
  const target = new Date(`${task.date}T${task.time || '00:00'}:00`);
  const diff = target - new Date();
  if (diff < 0) return 'horário passou';
  const minutes = Math.floor(diff / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `faltam ${days}d ${hours}h`;
  if (hours > 0) return `faltam ${hours}h ${mins}min`;
  return `faltam ${mins}min`;
}

function taskCard(task) {
  const priority = priorityClass(task.priority);
  return `
    <article class="item-card ${task.done ? 'done' : ''}">
      <div class="item-info">
        <h4>${task.time} - ${task.name}</h4>
        <p>${formatDateBR(task.date)} • ${task.day} • <span class="tag">${task.category}</span><span class="tag ${priority}">${task.priority}</span><span class="tag owner-tag">${task.owner || 'Todos'}</span></p>
      </div>
      <div class="actions">
        <button class="small-btn" onclick="toggleTask(${task.id})">${task.done ? 'Reabrir' : 'Concluir'}</button>
        <button class="small-btn edit" onclick="editTask(${task.id})">Editar</button>
        <button class="small-btn delete" onclick="deleteTask(${task.id})">Excluir</button>
      </div>
    </article>`;
}

function getNextTasks(limit = 3) {
  return getVisibleTasks()
    .filter((task) => !task.done)
    .map((task) => ({ ...task, score: new Date(`${task.date}T${task.time || '00:00'}:00`).getTime() }))
    .filter((task) => task.score >= Date.now() - 60000)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

function nextTaskCard(task) {
  return `
    <article class="item-card countdown-card">
      <div class="item-info">
        <h4>${task.time} - ${task.name}</h4>
        <p>${formatDateBR(task.date)} <span class="next-task-badge"><i class="fa-solid fa-hourglass-half"></i> ${getCountdown(task)}</span></p>
      </div>
    </article>`;
}

function renderTasks() {
  tasks = tasks.map(withTaskDefaults).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const visibleTasks = getVisibleTasks();
  $('#listaTarefas').innerHTML = visibleTasks.length ? visibleTasks.map(taskCard).join('') : '<p class="empty">Nenhuma tarefa cadastrada para este perfil.</p>';
  const todayTasks = visibleTasks.filter((t) => t.date === todayISO()).slice(0, 4);
  $('#tarefasHoje').innerHTML = todayTasks.length ? todayTasks.map(taskCard).join('') : '<p class="empty">Nenhuma tarefa para hoje.</p>';
  const nextTasks = getNextTasks();
  $('#proximasTarefas').innerHTML = nextTasks.length ? nextTasks.map(nextTaskCard).join('') : '<p class="empty">Nenhuma próxima tarefa pendente.</p>';
}

window.toggleTask = (id) => {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  save(); renderAll(); toast('success', 'Tarefa atualizada.');
};

window.editTask = async (id) => {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  const { value: formValues, isConfirmed } = await Swal.fire({
    title: 'Editar tarefa',
    customClass: { popup: 'app-edit-modal' },
    html: `
      <div class="edit-grid">
        <label>Nome da tarefa<input id="swalTaskName" class="swal2-input app-modal-input" placeholder="Nome" value="${task.name}"></label>
        <label>Data completa<input id="swalTaskDate" type="date" class="swal2-input app-modal-input" value="${task.date}"></label>
        <label>Horário<input id="swalTaskTime" type="time" class="swal2-input app-modal-input" value="${task.time}"></label>
        <label>Categoria<select id="swalTaskCategory" class="swal2-input app-modal-input"><option>Casa</option><option>Família</option><option>Igreja</option><option>Saúde</option><option>Trabalho</option><option>Outros</option></select></label>
        <label>Prioridade<select id="swalTaskPriority" class="swal2-input app-modal-input"><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
        <label>Responsável<select id="swalTaskOwner" class="swal2-input app-modal-input"><option>Todos</option><option>Edi</option><option>Camila</option></select></label>
      </div>`,
    didOpen: () => {
      $('#swalTaskCategory').value = task.category;
      $('#swalTaskPriority').value = task.priority;
      $('#swalTaskOwner').value = task.owner || 'Todos';
      const inputName = $('#swalTaskName');
      inputName.focus();
      inputName.setSelectionRange(inputName.value.length, inputName.value.length);
    },
    preConfirm: () => {
      const name = $('#swalTaskName').value.trim();
      const date = $('#swalTaskDate').value;
      const time = $('#swalTaskTime').value;
      if (!name || !date || !time) { Swal.showValidationMessage('Preencha nome, data e horário.'); return false; }
      return { name, date, time, category: $('#swalTaskCategory').value, priority: $('#swalTaskPriority').value, owner: $('#swalTaskOwner').value };  
    },
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Salvar alterações',
    cancelButtonText: 'Cancelar'
  });
  if (isConfirmed) {
    tasks = tasks.map((t) => t.id === id ? { ...t, ...formValues, day: getDayLabel(formValues.date) } : t);
    save(); renderAll(); toast('success', 'Tarefa editada.');
  }
};

window.deleteTask = (id) => confirmDelete(() => { tasks = tasks.filter((t) => t.id !== id); save(); renderAll(); });

function shoppingCard(item) {
  const total = Number(item.estimatedValue || 0) * Number(item.quantity || 1);
  return `
    <article class="item-card ${item.done ? 'done' : ''}">
      <div class="item-info"><h4>${item.name}</h4><p>Qtd.: ${item.quantity} • Estimativa: ${formatMoney(total)} • ${item.done ? 'Comprado' : 'Pendente'}</p></div>
      <div class="actions">
        <button class="small-btn" onclick="toggleShopping(${item.id})">${item.done ? 'Desmarcar' : 'Comprar'}</button>
        <button class="small-btn edit" onclick="editShopping(${item.id})">Editar</button>
        <button class="small-btn delete" onclick="deleteShopping(${item.id})">Excluir</button>
      </div>
    </article>`;
}

function renderShopping() {
  $('#listaCompras').innerHTML = shopping.length ? shopping.map(shoppingCard).join('') : '<p class="empty">Lista de compras vazia.</p>';
}

window.toggleShopping = (id) => { shopping = shopping.map((i) => i.id === id ? { ...i, done: !i.done } : i); save(); renderAll(); };

window.editShopping = async (id) => {
  const item = shopping.find((i) => i.id === id); if (!item) return;
  const { value, isConfirmed } = await Swal.fire({
    title: 'Editar item do mercado',
    html: `<input id="swalShopName" class="swal2-input" value="${item.name}" placeholder="Item"><input id="swalShopQty" type="number" min="1" step="1" class="swal2-input" value="${item.quantity}" placeholder="Quantidade"><input id="swalShopValue" type="number" min="0" step="0.01" class="swal2-input" value="${item.estimatedValue}" placeholder="Valor estimado">`,
    preConfirm: () => {
      const name = $('#swalShopName').value.trim();
      if (!name) { Swal.showValidationMessage('Digite o nome do item.'); return false; }
      return { name, quantity: Number($('#swalShopQty').value || 1), estimatedValue: Number($('#swalShopValue').value || 0) };
    },
    showCancelButton: true, confirmButtonColor: '#047857', cancelButtonColor: '#64748b', confirmButtonText: 'Salvar', cancelButtonText: 'Cancelar'
  });
  if (isConfirmed) { shopping = shopping.map((i) => i.id === id ? { ...i, ...value } : i); save(); renderAll(); toast('success', 'Item atualizado.'); }
};

window.deleteShopping = (id) => confirmDelete(() => { shopping = shopping.filter((i) => i.id !== id); save(); renderAll(); });

function billStatus(bill) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(`${bill.due}T00:00:00`);
  const diff = Math.ceil((due - today) / 86400000);
  if (bill.paid) return '<span class="status-pill paid"><i></i>Paga</span>';
  if (diff < 0) return '<span class="status-pill overdue"><i></i>Vencida</span>';
  if (diff === 0) return '<span class="status-pill due-soon"><i></i>Vence hoje</span>';
  if (diff <= 3) return '<span class="status-pill due-soon"><i></i>Próxima</span>';
  return '<span class="status-pill upcoming"><i></i>A vencer</span>';
}

function billCard(bill) {
  return `
    <article class="item-card ${bill.paid ? 'done' : ''}">
      <div class="item-info"><h4>${bill.name}</h4><p>${formatMoney(bill.value)} • vence em ${formatDateBR(bill.due)} ${billStatus(bill)}</p></div>
      <div class="actions">
        <button class="small-btn" onclick="toggleBill(${bill.id})">${bill.paid ? 'Reabrir' : 'Pagar'}</button>
        <button class="small-btn edit" onclick="editBill(${bill.id})">Editar</button>
        <button class="small-btn delete" onclick="deleteBill(${bill.id})">Excluir</button>
      </div>
    </article>`;
}

function renderBills() {
  bills.sort((a, b) => a.due.localeCompare(b.due));
  $('#listaContas').innerHTML = bills.length ? bills.map(billCard).join('') : '<p class="empty">Nenhuma conta cadastrada.</p>';
  $('#contasResumo').innerHTML = bills.length ? bills.filter((b) => !b.paid).slice(0, 3).map(billCard).join('') : '<p class="empty">Nenhuma conta cadastrada.</p>';
  const overdueCount = bills.filter((b) => !b.paid && new Date(`${b.due}T00:00:00`) < new Date(new Date().setHours(0,0,0,0))).length;
  const openBills = bills.filter((b) => !b.paid);
  const summary = $('#resumoContasDetalhado');
  if (summary) {
    summary.innerHTML = `
      <article><strong>${openBills.length}</strong><span>conta(s) em aberto</span></article>
      <article><strong>${formatMoney(getBillsTotal())}</strong><span>total cadastrado</span></article>
      <article class="${overdueCount ? 'danger-summary' : 'success-summary'}"><strong>${overdueCount}</strong><span>vencida(s)</span></article>
    `;
  }
}

window.toggleBill = (id) => { bills = bills.map((b) => b.id === id ? { ...b, paid: !b.paid } : b); save(); renderAll(); };

window.editBill = async (id) => {
  const bill = bills.find((b) => b.id === id); if (!bill) return;
  const { value, isConfirmed } = await Swal.fire({
    title: 'Editar conta',
    html: `<input id="swalBillName" class="swal2-input" value="${bill.name}" placeholder="Nome da conta"><input id="swalBillValue" type="number" step="0.01" class="swal2-input" value="${bill.value}" placeholder="Valor"><input id="swalBillDue" type="date" class="swal2-input" value="${bill.due}">`,
    preConfirm: () => {
      const name = $('#swalBillName').value.trim();
      const due = $('#swalBillDue').value;
      if (!name || !due) { Swal.showValidationMessage('Preencha nome e vencimento.'); return false; }
      return { name, value: Number($('#swalBillValue').value || 0), due };
    },
    showCancelButton: true, confirmButtonColor: '#047857', cancelButtonColor: '#64748b', confirmButtonText: 'Salvar', cancelButtonText: 'Cancelar'
  });
  if (isConfirmed) { bills = bills.map((b) => b.id === id ? { ...b, ...value } : b); save(); renderAll(); toast('success', 'Conta editada.'); }
};

window.deleteBill = (id) => confirmDelete(() => { bills = bills.filter((b) => b.id !== id); save(); renderAll(); });

function medCard(med) {
  return `<article class="item-card ${med.done ? 'done' : ''}"><div class="item-info"><h4>${med.time} - ${med.name}</h4><p>${med.frequency}</p></div><div class="actions"><button class="small-btn" onclick="toggleMed(${med.id})">${med.done ? 'Reabrir' : 'Tomado'}</button><button class="small-btn delete" onclick="deleteMed(${med.id})">Excluir</button></div></article>`;
}

function renderMeds() {
  meds.sort((a, b) => a.time.localeCompare(b.time));
  $('#listaMedicamentos').innerHTML = meds.length ? meds.map(medCard).join('') : '<p class="empty">Nenhum medicamento cadastrado.</p>';
  $('#medsResumo').innerHTML = meds.length ? meds.slice(0, 3).map(medCard).join('') : '<p class="empty">Nenhum medicamento cadastrado.</p>';
}

window.toggleMed = (id) => { meds = meds.map((m) => m.id === id ? { ...m, done: !m.done } : m); save(); renderAll(); };
window.deleteMed = (id) => confirmDelete(() => { meds = meds.filter((m) => m.id !== id); save(); renderAll(); });

function renderAlerts() {
  const overdue = bills.filter((b) => !b.paid && new Date(`${b.due}T00:00:00`) < new Date(new Date().setHours(0,0,0,0)));
  const todayBills = bills.filter((b) => !b.paid && b.due === todayISO());
  const alerts = [];
  if (overdue.length) alerts.push(`<article class="alert-card danger-alert"><i class="fa-solid fa-triangle-exclamation"></i> Você possui ${overdue.length} conta(s) vencida(s).</article>`);
  if (todayBills.length) alerts.push(`<article class="alert-card warning-alert"><i class="fa-solid fa-clock"></i> ${todayBills.length} conta(s) vencem hoje.</article>`);
  if (!alerts.length) alerts.push('<article class="alert-card success-alert"><i class="fa-solid fa-circle-check"></i> Nenhum alerta crítico no momento.</article>');
  $('#alertasResumo').innerHTML = alerts.join('');
}

function renderCalendar() {
  const container = $('#calendarioMensal');
  if (!container) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tasksByDay = getVisibleTasks().reduce((acc, task) => {
    const d = new Date(`${task.date}T00:00:00`);
    if (d.getMonth() === month && d.getFullYear() === year) acc[d.getDate()] = (acc[d.getDate()] || 0) + 1;
    return acc;
  }, {});
  const labels = ['D','S','T','Q','Q','S','S'].map((d) => `<span class="calendar-label">${d}</span>`).join('');
  const blanks = Array(firstDay).fill('<span class="calendar-day muted-day"></span>').join('');
  const days = Array.from({length: daysInMonth}, (_, i) => {
    const day = i + 1;
    const isToday = day === now.getDate();
    const count = tasksByDay[day] || 0;
    const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return `<button type="button" class="calendar-day ${isToday ? 'today-day' : ''} ${count ? 'has-task' : ''}" onclick="showTasksByDate('${dateISO}')">${day}${count ? `<small>${count}</small>` : ''}</button>`;
  }).join('');
  container.innerHTML = `<div class="calendar-title">${new Intl.DateTimeFormat('pt-BR',{month:'long', year:'numeric'}).format(now)}</div><div class="calendar-days">${labels}${blanks}${days}</div>`;
}


window.showTasksByDate = (dateISO) => {
  const tasksForDay = getVisibleTasks().filter((task) => task.date === dateISO).sort((a, b) => a.time.localeCompare(b.time));
  const html = tasksForDay.length
    ? `<div class="day-task-list">${tasksForDay.map((task) => `<article><strong>${task.time} - ${task.name}</strong><span>${task.category} • ${task.priority} • ${task.owner || 'Todos'}</span></article>`).join('')}</div>`
    : '<p class="empty modal-empty">Nenhuma tarefa cadastrada para este dia.</p>';
  Swal.fire({
    title: `Tarefas de ${formatDateBR(dateISO)}`,
    html,
    confirmButtonText: 'Fechar',
    confirmButtonColor: '#047857',
    customClass: { popup: 'app-edit-modal' }
  });
};

function confirmDelete(callback) {
  Swal.fire({ title: 'Excluir registro?', text: 'Essa ação não poderá ser desfeita.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#047857', cancelButtonColor: '#64748b', confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' }).then((result) => {
    if (result.isConfirmed) { callback(); toast('success', 'Registro excluído.'); }
  });
}

function setupForms() {
  $('#dataTarefa').value = todayISO();
  $('#formTarefa').addEventListener('submit', (event) => {
    event.preventDefault();
    const date = $('#dataTarefa').value;
    tasks.push({ id: nextId(tasks), name: $('#nomeTarefa').value.trim(), date, day: getDayLabel(date), time: $('#horaTarefa').value, category: $('#categoriaTarefa').value, priority: $('#prioridadeTarefa').value, owner: $('#responsavelTarefa').value, done: false });
    event.target.reset(); $('#dataTarefa').value = todayISO(); save(); renderAll(); toast('success', 'Tarefa adicionada.');
  });

  $('#formCompra').addEventListener('submit', (event) => {
    event.preventDefault();
    shopping.push({ id: nextId(shopping), name: $('#nomeCompra').value.trim(), quantity: Number($('#quantidadeCompra').value || 1), estimatedValue: Number($('#valorCompra').value || 0), done: false });
    event.target.reset(); $('#quantidadeCompra').value = 1; save(); renderAll(); toast('success', 'Item adicionado.');
  });

  $('#formConta').addEventListener('submit', (event) => {
    event.preventDefault();
    bills.push({ id: nextId(bills), name: $('#nomeConta').value.trim(), value: Number($('#valorConta').value), due: $('#vencimentoConta').value, paid: false });
    event.target.reset(); save(); renderAll(); toast('success', 'Conta adicionada.');
  });

  $('#formMedicamento').addEventListener('submit', (event) => {
    event.preventDefault();
    meds.push({ id: nextId(meds), name: $('#nomeMedicamento').value.trim(), time: $('#horaMedicamento').value, frequency: $('#freqMedicamento').value, done: false });
    event.target.reset(); save(); renderAll(); toast('success', 'Medicamento adicionado.');
  });
}

function setupNotifications() {
  $('#btnNotifications')?.addEventListener('click', async () => {
    if (!('Notification' in window)) { toast('warning', 'Seu navegador não suporta notificações.'); return; }
    const permission = await Notification.requestPermission();
    toast(permission === 'granted' ? 'success' : 'info', permission === 'granted' ? 'Notificações ativadas.' : 'Notificações não ativadas.');
  });
  setInterval(checkSmartNotifications, 60000);
  setTimeout(checkSmartNotifications, 2500);
}

function checkSmartNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  tasks.filter((t) => !t.done).forEach((task) => {
    const diff = new Date(`${task.date}T${task.time}:00`) - new Date();
    const key = `task-${task.id}-${task.date}-${task.time}`;
    if (diff > 0 && diff <= 30 * 60000 && !notifiedIds.includes(key)) {
      new Notification('Agenda da Família Reis', { body: `Lembrete: ${task.name} às ${task.time}` });
      notifiedIds.push(key); save();
    }
  });
}

function renderAll() {
  renderStats(); renderTasks(); renderShopping(); renderBills(); renderMeds(); renderAlerts(); renderCalendar();
}

$$('.nav-btn').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.page)));
$$('[data-go]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.go)));
$('#novaFraseBtn')?.addEventListener('click', () => { quoteIndex = (quoteIndex + 1) % bibleQuotes.length; renderQuote(quoteIndex, true); toast('success', 'Nova frase bíblica.'); });

function setupDatePickers() {
  $$('input[type="date"]').forEach((input) => {
    input.addEventListener('click', () => input.showPicker?.());
    input.addEventListener('focus', () => input.showPicker?.());
  });
}

setupSplash(); setupHeader(); setupTheme(); setupProfileSwitch(); setupForms(); setupNotifications(); setupDatePickers(); renderAll();
setInterval(renderAll, 60000);

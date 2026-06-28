const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const STORAGE = {
  tasks: 'agenda_tasks_v2',
  shopping: 'agenda_shopping_v2',
  bills: 'agenda_bills_v2',
  meds: 'agenda_meds_v2'
};

let tasks = JSON.parse(localStorage.getItem(STORAGE.tasks)) || [
  { id: 1, name: 'Oração da manhã', day: 'Hoje', time: '07:00', category: 'Igreja', priority: 'Alta', done: false },
  { id: 2, name: 'Organizar a casa', day: 'Hoje', time: '09:00', category: 'Casa', priority: 'Média', done: false },
  { id: 3, name: 'Momento em família', day: 'Hoje', time: '20:00', category: 'Família', priority: 'Baixa', done: true }
];

let shopping = JSON.parse(localStorage.getItem(STORAGE.shopping)) || [
  { id: 1, name: 'Arroz', done: false },
  { id: 2, name: 'Leite', done: true },
  { id: 3, name: 'Café', done: false }
];

let bills = JSON.parse(localStorage.getItem(STORAGE.bills)) || [
  { id: 1, name: 'Conta de Luz', value: 120, due: new Date().toISOString().slice(0, 10), paid: false },
  { id: 2, name: 'Conta de Água', value: 85, due: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10), paid: false }
];

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
  { text: 'O amor é paciente, o amor é bondoso.', ref: '1 Coríntios 13,4' }
];

function save() {
  localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks));
  localStorage.setItem(STORAGE.shopping, JSON.stringify(shopping));
  localStorage.setItem(STORAGE.bills, JSON.stringify(bills));
  localStorage.setItem(STORAGE.meds, JSON.stringify(meds));
}

function nextId(list) {
  return list.length ? Math.max(...list.map((item) => item.id)) + 1 : 1;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function toast(icon, title) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    timer: 1800,
    showConfirmButton: false
  });
}

function setupSplash() {
  const splash = $('#splashScreen');
  if (!splash) return;
  setTimeout(() => splash.classList.add('hidden'), 1600);
}

function setupHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  $('#saudacao').textContent = `${greeting}, Edi e Camila!`;
  $('#dataAtual').textContent = formatDate(new Date());

  const quote = bibleQuotes[new Date().getDay()];
  $('#fraseBiblica').textContent = `“${quote.text}”`;
  $('#referenciaBiblica').textContent = quote.ref;
  $('#versiculoLateral').textContent = `“${quote.text}” — ${quote.ref}`;
}

function navigate(page) {
  $$('.page').forEach((p) => p.classList.remove('active-page'));
  $(`#${page}`).classList.add('active-page');
  $$('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.page === page));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function animateNumber(element, target) {
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

function renderStats() {
  const numbers = {
    totalTarefas: tasks.length,
    tarefasPendentes: tasks.filter((t) => !t.done).length,
    tarefasConcluidas: tasks.filter((t) => t.done).length,
    totalCompras: shopping.filter((i) => !i.done).length,
    totalContas: bills.filter((b) => !b.paid).length,
    totalMedicamentos: meds.length
  };

  Object.entries(numbers).forEach(([id, value]) => animateNumber($(`#${id}`), value));
}

function priorityClass(priority) {
  return priority.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function taskCard(task) {
  const priority = priorityClass(task.priority);
  return `
    <article class="item-card ${task.done ? 'done' : ''}">
      <div class="item-info">
        <h4>${task.time} - ${task.name}</h4>
        <p>${task.day} • <span class="tag">${task.category}</span><span class="tag ${priority}">${task.priority}</span></p>
      </div>
      <div class="actions">
        <button class="small-btn" onclick="toggleTask(${task.id})">${task.done ? 'Reabrir' : 'Concluir'}</button>
        <button class="small-btn delete" onclick="deleteTask(${task.id})">Excluir</button>
      </div>
    </article>`;
}

function getNextTasks(limit = 3) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return tasks
    .filter((task) => !task.done)
    .map((task) => {
      const [hours, minutes] = task.time.split(':').map(Number);
      const taskMinutes = hours * 60 + minutes;
      const score = task.day === 'Hoje' && taskMinutes >= currentMinutes ? taskMinutes : taskMinutes + 1440;
      return { ...task, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

function nextTaskCard(task) {
  return `
    <article class="item-card">
      <div class="item-info">
        <h4>${task.time} - ${task.name}</h4>
        <p>${task.day} <span class="next-task-badge"><i class="fa-solid fa-bell"></i> próximo</span></p>
      </div>
    </article>`;
}

function renderTasks() {
  tasks.sort((a, b) => a.time.localeCompare(b.time));
  $('#listaTarefas').innerHTML = tasks.length ? tasks.map(taskCard).join('') : '<p class="empty">Nenhuma tarefa cadastrada.</p>';

  const todayTasks = tasks.filter((t) => t.day === 'Hoje').slice(0, 4);
  $('#tarefasHoje').innerHTML = todayTasks.length ? todayTasks.map(taskCard).join('') : '<p class="empty">Nenhuma tarefa para hoje.</p>';

  const nextTasks = getNextTasks();
  $('#proximasTarefas').innerHTML = nextTasks.length ? nextTasks.map(nextTaskCard).join('') : '<p class="empty">Nenhuma próxima tarefa pendente.</p>';
}

window.toggleTask = (id) => {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  save();
  renderAll();
  toast('success', 'Tarefa atualizada.');
};

window.deleteTask = (id) => confirmDelete(() => {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  renderAll();
});

function shoppingCard(item) {
  return `
    <article class="item-card ${item.done ? 'done' : ''}">
      <div class="item-info">
        <h4>${item.name}</h4>
        <p>${item.done ? 'Comprado' : 'Pendente'}</p>
      </div>
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

window.toggleShopping = (id) => {
  shopping = shopping.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
  save();
  renderAll();
};

window.editShopping = async (id) => {
  const item = shopping.find((i) => i.id === id);
  if (!item) return;

  const result = await Swal.fire({
    title: 'Editar item do mercado',
    input: 'text',
    inputLabel: 'Nome do item',
    inputValue: item.name,
    inputPlaceholder: 'Ex: Arroz, café, leite',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Salvar alteração',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value || !value.trim()) return 'Digite o nome do item.';
      return null;
    }
  });

  if (result.isConfirmed) {
    shopping = shopping.map((i) => (i.id === id ? { ...i, name: result.value.trim() } : i));
    save();
    renderAll();
    toast('success', 'Item atualizado.');
  }
};

window.deleteShopping = (id) => confirmDelete(() => {
  shopping = shopping.filter((i) => i.id !== id);
  save();
  renderAll();
});

function billStatus(bill) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${bill.due}T00:00:00`);
  const diff = Math.ceil((due - today) / 86400000);

  if (bill.paid) return '<span class="tag baixa">Paga</span>';
  if (diff < 0) return '<span class="tag alta">Vencida</span>';
  if (diff <= 3) return '<span class="tag media">Próxima</span>';
  return '<span class="tag baixa">A vencer</span>';
}

function billCard(bill) {
  return `
    <article class="item-card ${bill.paid ? 'done' : ''}">
      <div class="item-info">
        <h4>${bill.name}</h4>
        <p>${formatMoney(bill.value)} • vence em ${new Date(`${bill.due}T00:00:00`).toLocaleDateString('pt-BR')} ${billStatus(bill)}</p>
      </div>
      <div class="actions">
        <button class="small-btn" onclick="toggleBill(${bill.id})">${bill.paid ? 'Reabrir' : 'Pagar'}</button>
        <button class="small-btn delete" onclick="deleteBill(${bill.id})">Excluir</button>
      </div>
    </article>`;
}

function renderBills() {
  bills.sort((a, b) => a.due.localeCompare(b.due));
  $('#listaContas').innerHTML = bills.length ? bills.map(billCard).join('') : '<p class="empty">Nenhuma conta cadastrada.</p>';
  $('#contasResumo').innerHTML = bills.length ? bills.slice(0, 3).map(billCard).join('') : '<p class="empty">Nenhuma conta cadastrada.</p>';
}

window.toggleBill = (id) => {
  bills = bills.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b));
  save();
  renderAll();
};

window.deleteBill = (id) => confirmDelete(() => {
  bills = bills.filter((b) => b.id !== id);
  save();
  renderAll();
});

function medCard(med) {
  return `
    <article class="item-card ${med.done ? 'done' : ''}">
      <div class="item-info">
        <h4>${med.time} - ${med.name}</h4>
        <p>${med.frequency}</p>
      </div>
      <div class="actions">
        <button class="small-btn" onclick="toggleMed(${med.id})">${med.done ? 'Reabrir' : 'Tomado'}</button>
        <button class="small-btn delete" onclick="deleteMed(${med.id})">Excluir</button>
      </div>
    </article>`;
}

function renderMeds() {
  meds.sort((a, b) => a.time.localeCompare(b.time));
  $('#listaMedicamentos').innerHTML = meds.length ? meds.map(medCard).join('') : '<p class="empty">Nenhum medicamento cadastrado.</p>';
  $('#medsResumo').innerHTML = meds.length ? meds.slice(0, 3).map(medCard).join('') : '<p class="empty">Nenhum medicamento cadastrado.</p>';
}

window.toggleMed = (id) => {
  meds = meds.map((m) => (m.id === id ? { ...m, done: !m.done } : m));
  save();
  renderAll();
};

window.deleteMed = (id) => confirmDelete(() => {
  meds = meds.filter((m) => m.id !== id);
  save();
  renderAll();
});

function confirmDelete(callback) {
  Swal.fire({
    title: 'Excluir registro?',
    text: 'Essa ação não poderá ser desfeita.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#047857',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
      toast('success', 'Registro excluído.');
    }
  });
}

function setupForms() {
  $('#formTarefa').addEventListener('submit', (event) => {
    event.preventDefault();
    tasks.push({
      id: nextId(tasks),
      name: $('#nomeTarefa').value.trim(),
      day: $('#diaTarefa').value,
      time: $('#horaTarefa').value,
      category: $('#categoriaTarefa').value,
      priority: $('#prioridadeTarefa').value,
      done: false
    });
    event.target.reset();
    save();
    renderAll();
    toast('success', 'Tarefa adicionada.');
  });

  $('#formCompra').addEventListener('submit', (event) => {
    event.preventDefault();
    shopping.push({ id: nextId(shopping), name: $('#nomeCompra').value.trim(), done: false });
    event.target.reset();
    save();
    renderAll();
    toast('success', 'Item adicionado.');
  });

  $('#formConta').addEventListener('submit', (event) => {
    event.preventDefault();
    bills.push({
      id: nextId(bills),
      name: $('#nomeConta').value.trim(),
      value: Number($('#valorConta').value),
      due: $('#vencimentoConta').value,
      paid: false
    });
    event.target.reset();
    save();
    renderAll();
    toast('success', 'Conta adicionada.');
  });

  $('#formMedicamento').addEventListener('submit', (event) => {
    event.preventDefault();
    meds.push({
      id: nextId(meds),
      name: $('#nomeMedicamento').value.trim(),
      time: $('#horaMedicamento').value,
      frequency: $('#freqMedicamento').value,
      done: false
    });
    event.target.reset();
    save();
    renderAll();
    toast('success', 'Medicamento adicionado.');
  });
}

function renderAll() {
  renderStats();
  renderTasks();
  renderShopping();
  renderBills();
  renderMeds();
}

$$('.nav-btn').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.page)));
$$('[data-go]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.go)));

setupSplash();
setupHeader();
setupForms();
renderAll();

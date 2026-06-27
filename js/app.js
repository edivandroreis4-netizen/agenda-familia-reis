const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const STORAGE = {
  tasks: 'agenda_reis_tasks_v2_green',
  shopping: 'agenda_reis_shopping_v2_green',
  bills: 'agenda_reis_bills_v2_green',
  meds: 'agenda_reis_meds_v2_green'
};

let tasks = JSON.parse(localStorage.getItem(STORAGE.tasks)) || [
  { id: 1, name: 'Oração da manhã', day: 'Hoje', time: '07:00', category: 'Igreja', priority: 'Alta', done: false },
  { id: 2, name: 'Organizar a casa', day: 'Hoje', time: '09:00', category: 'Casa', priority: 'Média', done: false },
  { id: 3, name: 'Momento em família', day: 'Hoje', time: '20:00', category: 'Família', priority: 'Baixa', done: true }
];
let shopping = JSON.parse(localStorage.getItem(STORAGE.shopping)) || [
  { id: 1, name: 'Arroz', done: false }, { id: 2, name: 'Leite', done: true }, { id: 3, name: 'Café', done: false }
];
let bills = JSON.parse(localStorage.getItem(STORAGE.bills)) || [
  { id: 1, name: 'Conta de Luz', value: 120, due: new Date().toISOString().slice(0,10), paid: false },
  { id: 2, name: 'Conta de Água', value: 85, due: new Date(Date.now()+86400000*5).toISOString().slice(0,10), paid: false }
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

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}
function formatMoney(value) { return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function nextId(list) { return list.length ? Math.max(...list.map(item => item.id)) + 1 : 1; }
function toast(icon, title) { Swal.fire({ toast: true, position: 'top-end', icon, title, timer: 1800, showConfirmButton: false }); }

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
  $$('.page').forEach(p => p.classList.remove('active-page'));
  $(`#${page}`).classList.add('active-page');
  $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderStats() {
  $('#totalTarefas').textContent = tasks.length;
  $('#tarefasPendentes').textContent = tasks.filter(t => !t.done).length;
  $('#tarefasConcluidas').textContent = tasks.filter(t => t.done).length;
  $('#totalCompras').textContent = shopping.filter(i => !i.done).length;
  $('#totalContas').textContent = bills.filter(b => !b.paid).length;
  $('#totalMedicamentos').textContent = meds.length;
}

function taskCard(task) {
  const priorityClass = task.priority.toLowerCase().replace('é','e');
  return `<article class="item-card ${task.done ? 'done' : ''}">
    <div class="item-info"><h4>${task.time} - ${task.name}</h4><p>${task.day} • <span class="tag">${task.category}</span><span class="tag ${priorityClass}">${task.priority}</span></p></div>
    <div class="actions"><button class="small-btn" onclick="toggleTask(${task.id})">${task.done ? 'Reabrir' : 'Concluir'}</button><button class="small-btn delete" onclick="deleteTask(${task.id})">Excluir</button></div>
  </article>`;
}
function renderTasks() {
  tasks.sort((a,b) => a.time.localeCompare(b.time));
  $('#listaTarefas').innerHTML = tasks.length ? tasks.map(taskCard).join('') : '<p class="empty">Nenhuma tarefa cadastrada.</p>';
  const todayTasks = tasks.filter(t => t.day === 'Hoje').slice(0,4);
  $('#tarefasHoje').innerHTML = todayTasks.length ? todayTasks.map(taskCard).join('') : '<p class="empty">Nenhuma tarefa para hoje.</p>';
}
window.toggleTask = (id) => { tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t); save(); renderAll(); };
window.deleteTask = (id) => confirmDelete(() => { tasks = tasks.filter(t => t.id !== id); save(); renderAll(); });

function renderShopping() {
  $('#listaCompras').innerHTML = shopping.length ? shopping.map(item => `<article class="item-card ${item.done ? 'done' : ''}"><div class="item-info"><h4>${item.name}</h4><p>${item.done ? 'Comprado' : 'Pendente'}</p></div><div class="actions"><button class="small-btn" onclick="toggleShopping(${item.id})">${item.done ? 'Desmarcar' : 'Comprar'}</button><button class="small-btn delete" onclick="deleteShopping(${item.id})">Excluir</button></div></article>`).join('') : '<p class="empty">Lista de compras vazia.</p>';
}
window.toggleShopping = (id) => { shopping = shopping.map(i => i.id === id ? { ...i, done: !i.done } : i); save(); renderAll(); };
window.deleteShopping = (id) => confirmDelete(() => { shopping = shopping.filter(i => i.id !== id); save(); renderAll(); });

function billStatus(bill) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(`${bill.due}T00:00:00`);
  const diff = Math.ceil((due - today) / 86400000);
  if (bill.paid) return '<span class="tag baixa">Paga</span>';
  if (diff < 0) return '<span class="tag alta">Vencida</span>';
  if (diff <= 3) return '<span class="tag media">Próxima</span>';
  return '<span class="tag baixa">A vencer</span>';
}
function billCard(bill) {
  return `<article class="item-card ${bill.paid ? 'done' : ''}"><div class="item-info"><h4>${bill.name}</h4><p>${formatMoney(bill.value)} • vence em ${new Date(bill.due+'T00:00:00').toLocaleDateString('pt-BR')} ${billStatus(bill)}</p></div><div class="actions"><button class="small-btn" onclick="toggleBill(${bill.id})">${bill.paid ? 'Reabrir' : 'Pagar'}</button><button class="small-btn delete" onclick="deleteBill(${bill.id})">Excluir</button></div></article>`;
}
function renderBills() {
  bills.sort((a,b) => a.due.localeCompare(b.due));
  $('#listaContas').innerHTML = bills.length ? bills.map(billCard).join('') : '<p class="empty">Nenhuma conta cadastrada.</p>';
  $('#contasResumo').innerHTML = bills.length ? bills.slice(0,3).map(billCard).join('') : '<p class="empty">Nenhuma conta cadastrada.</p>';
}
window.toggleBill = (id) => { bills = bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b); save(); renderAll(); };
window.deleteBill = (id) => confirmDelete(() => { bills = bills.filter(b => b.id !== id); save(); renderAll(); });

function medCard(med) {
  return `<article class="item-card ${med.done ? 'done' : ''}"><div class="item-info"><h4>${med.time} - ${med.name}</h4><p>${med.frequency}</p></div><div class="actions"><button class="small-btn" onclick="toggleMed(${med.id})">${med.done ? 'Reabrir' : 'Tomado'}</button><button class="small-btn delete" onclick="deleteMed(${med.id})">Excluir</button></div></article>`;
}
function renderMeds() {
  meds.sort((a,b) => a.time.localeCompare(b.time));
  $('#listaMedicamentos').innerHTML = meds.length ? meds.map(medCard).join('') : '<p class="empty">Nenhum medicamento cadastrado.</p>';
  $('#medsResumo').innerHTML = meds.length ? meds.slice(0,3).map(medCard).join('') : '<p class="empty">Nenhum medicamento cadastrado.</p>';
}
window.toggleMed = (id) => { meds = meds.map(m => m.id === id ? { ...m, done: !m.done } : m); save(); renderAll(); };
window.deleteMed = (id) => confirmDelete(() => { meds = meds.filter(m => m.id !== id); save(); renderAll(); });

function confirmDelete(callback) {
  Swal.fire({ title: 'Excluir registro?', text: 'Essa ação não poderá ser desfeita.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#047857', cancelButtonColor: '#64748b', confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' }).then(result => {
    if (result.isConfirmed) { callback(); toast('success', 'Registro excluído.'); }
  });
}

function setupForms() {
  $('#formTarefa').addEventListener('submit', (e) => {
    e.preventDefault();
    tasks.push({ id: nextId(tasks), name: $('#nomeTarefa').value.trim(), day: $('#diaTarefa').value, time: $('#horaTarefa').value, category: $('#categoriaTarefa').value, priority: $('#prioridadeTarefa').value, done: false });
    e.target.reset(); save(); renderAll(); toast('success', 'Tarefa adicionada.');
  });
  $('#formCompra').addEventListener('submit', (e) => { e.preventDefault(); shopping.push({ id: nextId(shopping), name: $('#nomeCompra').value.trim(), done: false }); e.target.reset(); save(); renderAll(); toast('success','Item adicionado.'); });
  $('#formConta').addEventListener('submit', (e) => { e.preventDefault(); bills.push({ id: nextId(bills), name: $('#nomeConta').value.trim(), value: Number($('#valorConta').value), due: $('#vencimentoConta').value, paid: false }); e.target.reset(); save(); renderAll(); toast('success','Conta adicionada.'); });
  $('#formMedicamento').addEventListener('submit', (e) => { e.preventDefault(); meds.push({ id: nextId(meds), name: $('#nomeMedicamento').value.trim(), time: $('#horaMedicamento').value, frequency: $('#freqMedicamento').value, done: false }); e.target.reset(); save(); renderAll(); toast('success','Medicamento adicionado.'); });
}
function renderAll(){ renderStats(); renderTasks(); renderShopping(); renderBills(); renderMeds(); }

$$('.nav-btn').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.page)));
$$('[data-go]').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.go)));
setupHeader(); setupForms(); renderAll();

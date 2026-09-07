import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, getDocs, collection, query, 
  where, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
const firebaseConfig = {
    apiKey: "AIzaSyAgzPzIZgdu7ww1EdUFt8ctAv07uCeL9Zk",
    authDomain: "barbearia-5a2c7.firebaseapp.com",
    projectId: "barbearia-5a2c7",
    storageBucket: "barbearia-5a2c7.firebasestorage.app",
    messagingSenderId: "504189059285",
    appId: "1:504189059285:web:f05eba2d51e60ca77de25c"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. ESTADO GLOBAL DA APLICAÇÃO
// ==========================================
let currentUser = null;
let currentUserData = null;
let bookingState = {
  category: null,
  service: null,
  professional: null,
  date: null,
  time: null
};

// ==========================================
// 3. ROTEAMENTO E NAVEGAÇÃO SPA
// ==========================================
window.navigateTo = async (view, params = {}) => {
  const container = document.getElementById('app-content');
  container.innerHTML = `<div class="flex justify-center p-12"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-brand-gold"></i></div>`;

  switch(view) {
    case 'home':
      renderHome(container);
      break;
    case 'login':
      renderLogin(container);
      break;
    case 'register':
      renderRegister(container);
      break;
    case 'booking':
      renderBookingFlow(container);
      break;
    case 'my-appointments':
      if (!currentUser) return window.navigateTo('login');
      renderMyAppointments(container);
      break;
    case 'professional-dashboard':
      if (!currentUserData || (currentUserData.role !== 'professional' && currentUserData.role !== 'admin')) {
        return window.navigateTo('home');
      }
      renderProfessionalDashboard(container);
      break;
    case 'admin-dashboard':
      if (!currentUserData || currentUserData.role !== 'admin') {
        return window.navigateTo('home');
      }
      renderAdminDashboard(container);
      break;
    default:
      renderHome(container);
  }
  updateNavUI();
};

// Observador de Autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentUserData = userDoc.data();
    }
  } else {
    currentUser = null;
    currentUserData = null;
  }
  updateNavUI();
  if(!document.getElementById('app-content').innerHTML.trim()) {
    window.navigateTo('home');
  }
});

function updateNavUI() {
  const desktopNav = document.getElementById('auth-links-desktop');
  const mobileApptsBtn = document.getElementById('mobile-my-appts-btn');
  
  if (currentUser) {
    mobileApptsBtn.classList.remove('hidden');
    let dashLink = '';
    if (currentUserData?.role === 'professional') {
      dashLink = `<a href="#" onclick="navigateTo('professional-dashboard')" class="text-brand-gold hover:underline">Painel Profissional</a>`;
    } else if (currentUserData?.role === 'admin') {
      dashLink = `<a href="#" onclick="navigateTo('admin-dashboard')" class="text-brand-gold hover:underline">Painel Admin</a>`;
    }

    desktopNav.innerHTML = `
      ${dashLink}
      <a href="#" onclick="navigateTo('my-appointments')" class="hover:text-brand-gold transition">Meus Agendamentos</a>
      <button onclick="handleLogout()" class="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm transition">Sair</button>
    `;
  } else {
    mobileApptsBtn.classList.add('hidden');
    desktopNav.innerHTML = `
      <button onclick="navigateTo('login')" class="hover:text-brand-gold transition">Entrar</button>
      <button onclick="navigateTo('register')" class="bg-brand-gold hover:bg-brand-goldHover text-black font-semibold px-4 py-1.5 rounded-lg transition">Cadastrar</button>
    `;
  }
}

window.handleLogout = async () => {
  await signOut(auth);
  showToast('Sessão encerrada com sucesso', 'info');
  window.navigateTo('home');
};

// Sistema de Notificação Toast
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  
  toast.className = `toast ${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;
  
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ==========================================
// 4. PÁGINA INICIAL (HOME)
// ==========================================
function renderHome(container) {
  container.innerHTML = `
    <!-- Hero Banner -->
    <div class="relative bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 md:p-12 mb-10 overflow-hidden border border-gray-800">
      <div class="relative z-10 max-w-2xl">
        <span class="text-brand-gold text-sm font-bold tracking-widest uppercase">Estilo & Autenticidade</span>
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white mt-2 mb-4">
          Sua presença reflete quem você é.
        </h1>
        <p class="text-gray-400 text-lg mb-8">
          Agende serviços premium de barbearia, manicure e pedicure com os melhores profissionais da cidade de forma simples e rápida.
        </p>
        <div class="flex flex-wrap gap-4">
          <button onclick="navigateTo('booking')" class="bg-brand-gold hover:bg-brand-goldHover text-black font-bold px-6 py-3 rounded-xl transition flex items-center gap-2">
            <i class="fa-solid fa-calendar-check"></i> Agendar Agora
          </button>
        </div>
      </div>
    </div>

    <!-- Categorias de Atendimento -->
    <div class="grid md:grid-cols-2 gap-6 mb-12">
      <!-- Card Barbearia -->
      <div class="bg-brand-cardBg border border-gray-800 rounded-2xl p-6 hover:border-brand-gold transition">
        <div class="flex justify-between items-start mb-4">
          <div class="bg-yellow-500/10 p-3 rounded-xl">
            <i class="fa-solid fa-scissors text-2xl text-brand-gold"></i>
          </div>
          <span class="text-xs font-semibold uppercase bg-gray-800 text-brand-gold px-2.5 py-1 rounded-full">Exclusivo</span>
        </div>
        <h3 class="text-2xl font-bold mb-2">Barbearia</h3>
        <p class="text-gray-400 text-sm mb-4">Cortes modernos, alinhamento de barba, sobrancelha e tratamentos capilares completos.</p>
        <button onclick="selectCategoryAndBook('barbearia')" class="text-brand-gold font-semibold text-sm flex items-center gap-2 hover:underline">
          Ver serviços de Barbearia <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <!-- Card Manicure/Pedicure -->
      <div class="bg-brand-cardBg border border-gray-800 rounded-2xl p-6 hover:border-brand-accentPink transition">
        <div class="flex justify-between items-start mb-4">
          <div class="bg-pink-500/10 p-3 rounded-xl">
            <i class="fa-solid fa-hand text-2xl text-brand-accentPink"></i>
          </div>
          <span class="text-xs font-semibold uppercase bg-gray-800 text-brand-accentPink px-2.5 py-1 rounded-full">Especializado</span>
        </div>
        <h3 class="text-2xl font-bold mb-2">Manicure & Pedicure</h3>
        <p class="text-gray-400 text-sm mb-4">Esmaltação, cutilagem perfeita, alongamentos de unhas e spass para os pés.</p>
        <button onclick="selectCategoryAndBook('manicure')" class="text-brand-accentPink font-semibold text-sm flex items-center gap-2 hover:underline">
          Ver serviços de Nails <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Infos de Funcionamento -->
    <div class="bg-brand-cardBg border border-gray-800 rounded-2xl p-6 grid md:grid-cols-3 gap-6 text-center">
      <div>
        <i class="fa-solid fa-clock text-2xl text-brand-gold mb-2"></i>
        <h4 class="font-bold">Horário de Atendimento</h4>
        <p class="text-gray-400 text-sm mt-1">Terça a Sábado: 08:00 às 19:00</p>
      </div>
      <div>
        <i class="fa-solid fa-location-dot text-2xl text-brand-gold mb-2"></i>
        <h4 class="font-bold">Localização</h4>
        <p class="text-gray-400 text-sm mt-1">Av. Central, 1000 - Centro</p>
      </div>
      <div>
        <i class="fa-brands fa-whatsapp text-2xl text-brand-gold mb-2"></i>
        <h4 class="font-bold">Contato Direct</h4>
        <p class="text-gray-400 text-sm mt-1">(11) 99999-8888</p>
      </div>
    </div>
  `;
}

window.selectCategoryAndBook = (cat) => {
  bookingState.category = cat;
  window.navigateTo('booking');
};

// ==========================================
// 5. AUTENTICAÇÃO (LOGIN E CADASTRO)
// ==========================================
function renderLogin(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto bg-brand-cardBg border border-gray-800 rounded-2xl p-8">
      <h2 class="text-2xl font-bold mb-6 text-center">Acessar Conta</h2>
      <form id="login-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">E-mail</label>
          <input type="email" id="login-email" required class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Senha</label>
          <input type="password" id="login-password" required class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold">
        </div>
        <button type="submit" class="w-full bg-brand-gold hover:bg-brand-goldHover text-black font-bold py-3 rounded-lg transition">Entrar</button>
      </form>
      <p class="text-center text-sm text-gray-400 mt-4">
        Ainda não tem conta? <a href="#" onclick="navigateTo('register')" class="text-brand-gold hover:underline">Cadastre-se</a>
      </p>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, 
        document.getElementById('login-email').value, 
        document.getElementById('login-password').value
      );
      showToast('Login efetuado com sucesso!');
      window.navigateTo('home');
    } catch (err) {
      showToast('Erro ao realizar login: ' + err.message, 'error');
    }
  });
}

function renderRegister(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto bg-brand-cardBg border border-gray-800 rounded-2xl p-8">
      <h2 class="text-2xl font-bold mb-6 text-center">Criar Conta</h2>
      <form id="register-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
          <input type="text" id="reg-name" required class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Telefone/WhatsApp</label>
          <input type="tel" id="reg-phone" required placeholder="(00) 00000-0000" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">E-mail</label>
          <input type="email" id="reg-email" required class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Senha</label>
          <input type="password" id="reg-password" required minlength="6" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold">
        </div>
        <button type="submit" class="w-full bg-brand-gold hover:bg-brand-goldHover text-black font-bold py-3 rounded-lg transition">Finalizar Cadastro</button>
      </form>
      <p class="text-center text-sm text-gray-400 mt-4">
        Já tem uma conta? <a href="#" onclick="navigateTo('login')" class="text-brand-gold hover:underline">Faça Login</a>
      </p>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById('reg-name').value;
      const phone = document.getElementById('reg-phone').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Salva perfil no Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        phone,
        role: 'client', // client, professional, admin
        createdAt: serverTimestamp()
      });

      showToast('Conta criada com sucesso!');
      window.navigateTo('home');
    } catch (err) {
      showToast('Erro ao cadastrar: ' + err.message, 'error');
    }
  });
}

// ==========================================
// 6. AGENDAMENTO - COMPONENTES E LÓGICA DE DISPONIBILIDADE
// ==========================================
async function renderBookingFlow(container) {
  if (!currentUser) {
    showToast('Por favor, faça login para continuar o agendamento.', 'info');
    return window.navigateTo('login');
  }

  // PASSO 1: Selecionar Categoria
  if (!bookingState.category) {
    container.innerHTML = `
      <h2 class="text-2xl font-bold mb-6 text-center">Selecione a Categoria</h2>
      <div class="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button onclick="setBookingCategory('barbearia')" class="bg-brand-cardBg border border-gray-800 hover:border-brand-gold p-8 rounded-2xl flex flex-col items-center gap-4 transition">
          <i class="fa-solid fa-scissors text-4xl text-brand-gold"></i>
          <span class="text-xl font-bold">Barbearia</span>
        </button>
        <button onclick="setBookingCategory('manicure')" class="bg-brand-cardBg border border-gray-800 hover:border-brand-accentPink p-8 rounded-2xl flex flex-col items-center gap-4 transition">
          <i class="fa-solid fa-hand text-4xl text-brand-accentPink"></i>
          <span class="text-xl font-bold">Manicure & Pedicure</span>
        </button>
      </div>
    `;
    return;
  }

  // PASSO 2: Selecionar Serviço
  if (!bookingState.service) {
    const q = query(collection(db, "services"), where("category", "==", bookingState.category));
    const snap = await getDocs(q);
    
    let servicesHTML = '';
    snap.forEach(docSnap => {
      const s = { id: docSnap.id, ...docSnap.data() };
      servicesHTML += `
        <div onclick="setBookingService('${s.id}', '${s.name}', ${s.price}, ${s.duration})" class="bg-brand-cardBg border border-gray-800 hover:border-brand-gold p-5 rounded-xl cursor-pointer transition flex justify-between items-center">
          <div>
            <h4 class="font-bold text-lg">${s.name}</h4>
            <p class="text-gray-400 text-sm">${s.description || ''}</p>
            <span class="text-xs text-gray-500 mt-2 inline-block"><i class="fa-regular fa-clock"></i> ${s.duration} min</span>
          </div>
          <span class="text-brand-gold font-bold text-xl">R$ ${s.price.toFixed(2)}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <button onclick="bookingState.category=null; renderBookingFlow(document.getElementById('app-content'))" class="text-sm text-gray-400 hover:text-white mb-4"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
        <h2 class="text-2xl font-bold mb-6">Escolha o Serviço</h2>
        <div class="space-y-4">${servicesHTML || '<p class="text-gray-400">Nenhum serviço cadastrado nesta categoria.</p>'}</div>
      </div>
    `;
    return;
  }

  // PASSO 3: Selecionar Profissional
  if (!bookingState.professional) {
    const q = query(collection(db, "professionals"), where("category", "==", bookingState.category));
    const snap = await getDocs(q);

    let profsHTML = '';
    snap.forEach(docSnap => {
      const p = { id: docSnap.id, ...docSnap.data() };
      profsHTML += `
        <div onclick="setBookingProfessional('${p.id}', '${p.name}')" class="bg-brand-cardBg border border-gray-800 hover:border-brand-gold p-5 rounded-xl cursor-pointer transition flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-brand-gold text-lg">
            ${p.name.charAt(0)}
          </div>
          <div>
            <h4 class="font-bold text-lg">${p.name}</h4>
            <p class="text-gray-400 text-sm">Atendimento especializado</p>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <button onclick="bookingState.service=null; renderBookingFlow(document.getElementById('app-content'))" class="text-sm text-gray-400 hover:text-white mb-4"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
        <h2 class="text-2xl font-bold mb-6">Escolha o Profissional</h2>
        <div class="space-y-4">${profsHTML || '<p class="text-gray-400">Nenhum profissional disponível.</p>'}</div>
      </div>
    `;
    return;
  }
  
  // PASSO 4: Data e Horário
  if (!bookingState.date || !bookingState.time) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    container.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <button onclick="bookingState.professional=null; renderBookingFlow(document.getElementById('app-content'))" class="text-sm text-gray-400 hover:text-white mb-4"><i class="fa-solid fa-arrow-left"></i> Voltar</button>
        <h2 class="text-2xl font-bold mb-4">Escolha a Data e Horário</h2>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-400 mb-2">Selecione o dia:</label>
          <input type="date" id="booking-date-input" min="${todayStr}" value="${bookingState.date || todayStr}" class="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white w-full">
        </div>

        <div id="slots-container" class="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          <!-- Grade de Horários Injetada Dinamicamente -->
        </div>
      </div>
    `;

    const dateInput = document.getElementById('booking-date-input');
    const loadSlots = async (selectedDate) => {
      bookingState.date = selectedDate;
      const slotsContainer = document.getElementById('slots-container');
      slotsContainer.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-brand-gold text-2xl col-span-full mx-auto"></i>`;
      
      const slots = await calculateAvailableSlots(bookingState.professional.id, selectedDate, bookingState.service.duration);
      
      slotsContainer.innerHTML = '';
      if(slots.length === 0) {
        slotsContainer.innerHTML = `<p class="col-span-full text-gray-400 text-sm text-center">Nenhum horário disponível para esta data.</p>`;
        return;
      }

      slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = `p-3 text-sm rounded-lg border text-center transition ${
          slot.available 
            ? 'border-gray-700 bg-brand-cardBg hover:border-brand-gold hover:text-brand-gold' 
            : 'border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed'
        }`;
        btn.innerText = slot.time;
        btn.disabled = !slot.available;
        if(slot.available) {
          btn.onclick = () => {
            bookingState.time = slot.time;
            renderBookingFlow(container);
          };
        }
        slotsContainer.appendChild(btn);
      });
    };

    dateInput.addEventListener('change', (e) => loadSlots(e.target.value));
    loadSlots(dateInput.value);
    return;
  }

  // PASSO 5: Resumo e Confirmação
  container.innerHTML = `
    <div class="max-w-lg mx-auto bg-brand-cardBg border border-gray-800 rounded-2xl p-6">
      <h2 class="text-2xl font-bold mb-4 text-center">Resumo do Agendamento</h2>
      <div class="space-y-3 text-sm border-b border-gray-800 pb-4 mb-4">
        <div class="flex justify-between"><span class="text-gray-400">Serviço:</span> <span class="font-bold">${bookingState.service.name}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Profissional:</span> <span class="font-bold">${bookingState.professional.name}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Data:</span> <span class="font-bold">${bookingState.date}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Horário:</span> <span class="font-bold">${bookingState.time}</span></div>
        <div class="flex justify-between"><span class="text-gray-400">Duração Estimada:</span> <span class="font-bold">${bookingState.service.duration} min</span></div>
        <div class="flex justify-between text-base pt-2"><span class="text-gray-400">Valor Total:</span> <span class="font-bold text-brand-gold">R$ ${bookingState.service.price.toFixed(2)}</span></div>
      </div>
      
      <div class="flex gap-3">
        <button onclick="bookingState.time=null; renderBookingFlow(document.getElementById('app-content'))" class="w-1/2 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-bold">Alterar</button>
        <button onclick="confirmAppointment()" class="w-1/2 bg-brand-gold hover:bg-brand-goldHover text-black py-3 rounded-xl font-bold">Confirmar</button>
      </div>
    </div>
  `;
}

// Helpers do Flow de Agendamento
window.setBookingCategory = (cat) => { bookingState.category = cat; renderBookingFlow(document.getElementById('app-content')); };
window.setBookingService = (id, name, price, duration) => { bookingState.service = { id, name, price, duration }; renderBookingFlow(document.getElementById('app-content')); };
window.setBookingProfessional = (id, name) => { bookingState.professional = { id, name }; renderBookingFlow(document.getElementById('app-content')); };

// Motor de Cálculo de Horários Vagos vs Conflitos
async function calculateAvailableSlots(profId, dateStr, durationMinutes) {
  // Horário Padrão de Atendimento (8:00 às 18:00)
  const startHour = 8;
  const endHour = 18;
  const intervalMinutes = 30; // Intervalo de slots

  // Buscar agendamentos existentes ativos no Firestore
  const q = query(
    collection(db, "appointments"),
    where("professionalId", "==", profId),
    where("date", "==", dateStr),
    where("status", "in", ["pending", "confirmed"])
  );
  
  const snap = await getDocs(q);
  const busyIntervals = [];

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const [h, m] = data.time.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + (data.duration || 30);
    busyIntervals.push({ start: startMins, end: endMins });
  });

  // Gerar slots em minutos
  const slots = [];
  for (let mins = startHour * 60; mins + durationMinutes <= endHour * 60; mins += intervalMinutes) {
    const slotStart = mins;
    const slotEnd = mins + durationMinutes;

    // Verificar se cruza com algum horário ocupado
    const hasConflict = busyIntervals.some(b => 
      (slotStart >= b.start && slotStart < b.end) || 
      (slotEnd > b.start && slotEnd <= b.end) ||
      (slotStart <= b.start && slotEnd >= b.end)
    );

    const hours = Math.floor(mins / 60).toString().padStart(2, '0');
    const minutes = (mins % 60).toString().padStart(2, '0');

    slots.push({
      time: `${hours}:${minutes}`,
      available: !hasConflict
    });
  }

  return slots;
}

window.confirmAppointment = async () => {
  try {
    await addDoc(collection(db, "appointments"), {
      clientId: currentUser.uid,
      clientName: currentUserData.name,
      clientPhone: currentUserData.phone,
      professionalId: bookingState.professional.id,
      professionalName: bookingState.professional.name,
      serviceId: bookingState.service.id,
      serviceName: bookingState.service.name,
      category: bookingState.category,
      price: bookingState.service.price,
      duration: bookingState.service.duration,
      date: bookingState.date,
      time: bookingState.time,
      status: 'pending', // pending, confirmed, rejected, cancelled, completed
      createdAt: serverTimestamp()
    });

    showToast('Agendamento solicitado com sucesso!');
    // Limpa estado
    bookingState = { category: null, service: null, professional: null, date: null, time: null };
    window.navigateTo('my-appointments');
  } catch(err) {
    showToast('Erro ao agendar: ' + err.message, 'error');
  }
};

// ==========================================
// 7. ÁREA DO CLIENTE - MEUS AGENDAMENTOS
// ==========================================
async function renderMyAppointments(container) {
  const q = query(
    collection(db, "appointments"),
    where("clientId", "==", currentUser.uid)
  );

  const snap = await getDocs(q);
  let appts = [];
  snap.forEach(doc => appts.push({ id: doc.id, ...doc.data() }));

  // Ordenação por data/horário local
  appts.sort((a,b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return `<span class="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs px-2.5 py-1 rounded-full">🟡 Pendente</span>`;
      case 'confirmed': return `<span class="bg-green-500/10 text-green-500 border border-green-500/20 text-xs px-2.5 py-1 rounded-full">🟢 Confirmado</span>`;
      case 'rejected': return `<span class="bg-red-500/10 text-red-500 border border-red-500/20 text-xs px-2.5 py-1 rounded-full">🔴 Recusado</span>`;
      case 'cancelled': return `<span class="bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs px-2.5 py-1 rounded-full">⚫ Cancelado</span>`;
      case 'completed': return `<span class="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full">🔵 Concluído</span>`;
      default: return '';
    }
  };

  let cardsHTML = appts.map(a => `
    <div class="bg-brand-cardBg border border-gray-800 rounded-xl p-5 space-y-3">
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-bold text-lg">${a.serviceName}</h4>
          <p class="text-sm text-gray-400">Profissional: ${a.professionalName}</p>
        </div>
        ${getStatusBadge(a.status)}
      </div>
      <div class="text-sm text-gray-300 flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
        <div><i class="fa-regular fa-calendar text-brand-gold"></i> ${a.date} às ${a.time}</div>
        <div class="font-bold text-brand-gold">R$ ${a.price.toFixed(2)}</div>
      </div>
      ${a.status === 'pending' || a.status === 'confirmed' ? `
        <button onclick="cancelAppointment('${a.id}', '${a.date}', '${a.time}')" class="text-xs text-red-400 hover:text-red-300 underline">Cancelar Agendamento</button>
      ` : ''}
    </div>
  `).join('');

  container.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Meus Agendamentos</h2>
      <div class="space-y-4">
        ${cardsHTML || '<p class="text-gray-400">Você ainda não possui agendamentos registrados.</p>'}
      </div>
    </div>
  `;
}

window.cancelAppointment = async (apptId, dateStr, timeStr) => {
  // Regra: Bloquear cancelamento se faltar menos de 2 horas
  const apptDateTime = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  const diffHours = (apptDateTime - now) / (1000 * 60 * 60);

  if (diffHours < 2) {
    showToast('Não é possível cancelar com menos de 2 horas de antecedência. Entre em contato por telefone.', 'error');
    return;
  }

  if(confirm("Deseja realmente cancelar este agendamento?")) {
    await updateDoc(doc(db, "appointments", apptId), { status: 'cancelled' });
    showToast('Agendamento cancelado.');
    renderMyAppointments(document.getElementById('app-content'));
  }
};
// ==========================================
// 8. PAINEL DO PROFISSIONAL
// ==========================================
async function renderProfessionalDashboard(container) {
  const todayStr = new Date().toISOString().split('T')[0];

  const q = query(
    collection(db, "appointments"),
    where("professionalId", "==", currentUser.uid)
  );

  const snap = await getDocs(q);
  let appts = [];
  snap.forEach(doc => appts.push({ id: doc.id, ...doc.data() }));

  const todayAppts = appts.filter(a => a.date === todayStr);

  let listHTML = todayAppts.map(a => `
    <div class="bg-brand-cardBg border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="text-brand-gold font-bold text-lg">${a.time} - ${a.serviceName}</div>
        <div class="text-sm font-medium text-white">Cliente: ${a.clientName} (${a.clientPhone})</div>
        <div class="text-xs text-gray-400">Status: ${a.status}</div>
      </div>
      ${a.status === 'pending' ? `
        <div class="flex gap-2 w-full sm:w-auto">
          <button onclick="updateApptStatus('${a.id}', 'confirmed')" class="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex-1 sm:flex-none">Aceitar</button>
          <button onclick="updateApptStatus('${a.id}', 'rejected')" class="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex-1 sm:flex-none">Recusar</button>
        </div>
      ` : ''}
    </div>
  `).join('');

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Painel do Profissional</h2>
        <span class="text-sm bg-gray-800 text-brand-gold px-3 py-1 rounded-full">${currentUserData.name}</span>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 class="text-xl font-bold mb-4">Agendamentos para Hoje (${todayStr})</h3>
        <div class="space-y-3">
          ${listHTML || '<p class="text-gray-400 text-sm">Nenhum agendamento para hoje.</p>'}
        </div>
      </div>
    </div>
  `;
}

window.updateApptStatus = async (id, status) => {
  await updateDoc(doc(db, "appointments", id), { status });
  showToast(`Agendamento ${status === 'confirmed' ? 'aceito' : 'recusado'} com sucesso!`);
  renderProfessionalDashboard(document.getElementById('app-content'));
};

// ==========================================
// 9. PAINEL ADMINISTRATIVO
// ==========================================
async function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="max-w-5xl mx-auto space-y-8">
      <h2 class="text-3xl font-bold text-brand-gold">Painel Administrativo</h2>
      
      <!-- Cadastro de Serviços -->
      <div class="bg-brand-cardBg border border-gray-800 rounded-2xl p-6">
        <h3 class="text-xl font-bold mb-4">Cadastrar Novo Serviço</h3>
        <form id="admin-service-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" id="srv-name" placeholder="Nome do Serviço" required class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white">
          <select id="srv-category" required class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white">
            <option value="barbearia">Barbearia</option>
            <option value="manicure">Manicure & Pedicure</option>
          </select>
          <input type="number" id="srv-price" step="0.01" placeholder="Preço (R$)" required class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white">
          <input type="number" id="srv-duration" placeholder="Duração (minutos)" required class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white">
          <input type="text" id="srv-desc" placeholder="Descrição rápida" class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white md:col-span-2">
          <button type="submit" class="bg-brand-gold text-black font-bold p-3 rounded-lg md:col-span-2 hover:bg-brand-goldHover transition">Salvar Serviço</button>
        </form>
      </div>

      <!-- Cadastro de Profissionais -->
      <div class="bg-brand-cardBg border border-gray-800 rounded-2xl p-6">
        <h3 class="text-xl font-bold mb-4">Cadastrar Novo Profissional</h3>
        <p class="text-xs text-gray-400 mb-4">Vincula um usuário existente (já cadastrado) como Profissional.</p>
        <form id="admin-prof-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" id="prof-uid" placeholder="UID do Usuário do Firebase" required class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white">
          <input type="text" id="prof-name" placeholder="Nome Exibição" required class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white">
          <select id="prof-category" required class="bg-gray-900 border border-gray-700 p-3 rounded-lg text-white md:col-span-2">
            <option value="barbearia">Barbearia</option>
            <option value="manicure">Manicure & Pedicure</option>
          </select>
          <button type="submit" class="bg-brand-gold text-black font-bold p-3 rounded-lg md:col-span-2 hover:bg-brand-goldHover transition">Promover/Cadastrar Profissional</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('admin-service-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "services"), {
      name: document.getElementById('srv-name').value,
      category: document.getElementById('srv-category').value,
      price: parseFloat(document.getElementById('srv-price').value),
      duration: parseInt(document.getElementById('srv-duration').value),
      description: document.getElementById('srv-desc').value
    });
    showToast('Serviço cadastrado com sucesso!');
    e.target.reset();
  });

  document.getElementById('admin-prof-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const uid = document.getElementById('prof-uid').value;
    const name = document.getElementById('prof-name').value;
    const category = document.getElementById('prof-category').value;

    await setDoc(doc(db, "professionals", uid), { name, category });
    await updateDoc(doc(db, "users", uid), { role: 'professional' });

    showToast('Profissional cadastrado/promovido!');
    e.target.reset();
  });
}

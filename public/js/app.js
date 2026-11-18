
const API_BASE = '/api/v1';
const TOKEN_KEY = 'biblioteca_token';
const USER_KEY = 'biblioteca_user';

const $ = (selector) => document.querySelector(selector);

const authView = $('#auth-view');
const dashboardView = $('#dashboard-view');
const authMessage = $('#auth-message');
const dashboardMessage = $('#dashboard-message');
const taskDialog = $('#task-dialog');
const taskForm = $('#task-form');

let tasks = [];
let users = [];
let editingTaskId = null;

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

function isAdmin() {
  return getUser()?.role === 'ADMIN';
}

function setFeedback(element, message, success = false) {
  if (!element) return;

  element.textContent = message || '';
  element.classList.toggle('success', success);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && getToken()) {
      logout(false);
    }

    throw new Error(
      payload.message || `Error en la solicitud (${response.status})`
    );
  }

  return payload;
}

// --------------------------------------------------
// AUTENTICACIÓN Y SESIÓN
// --------------------------------------------------

function showAuth() {
  authView.hidden = false;
  dashboardView.hidden = true;
  $('#session-area').hidden = true;
}

function showDashboard() {
  authView.hidden = true;
  dashboardView.hidden = false;
  $('#session-area').hidden = false;

  const user = getUser();

  $('#user-label').textContent = user
    ? `${user.name} · ${user.role}`
    : '';

  const admin = isAdmin();

  $('#admin-navigation').hidden = !admin;

  $('#dashboard-title').textContent = admin
    ? 'Panel administrativo'
    : 'Mis tareas';

  $('#dashboard-subtitle').textContent = admin
    ? 'Administra las tareas y consulta los usuarios registrados.'
    : 'Consulta y administra tus actividades bibliotecarias.';

  $('#new-task-button').hidden = false;

  showTasksView();
}

function logout(showMessage = true) {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  tasks = [];
  users = [];

  showAuth();

  if (showMessage) {
    setFeedback(
      authMessage,
      'Sesión cerrada correctamente.',
      true
    );
  }
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';

  $('#login-form').hidden = !isLogin;
  $('#register-form').hidden = isLogin;

  $('#login-tab').classList.toggle('active', isLogin);
  $('#register-tab').classList.toggle('active', !isLogin);

  $('#login-tab').setAttribute('aria-selected', String(isLogin));
  $('#register-tab').setAttribute('aria-selected', String(!isLogin));

  setFeedback(authMessage, '');
}

$('#login-tab').addEventListener('click', () => switchAuthTab('login'));
$('#register-tab').addEventListener('click', () => switchAuthTab('register'));
$('#logout-button').addEventListener('click', () => logout());

// --------------------------------------------------
// INICIO DE SESIÓN
// --------------------------------------------------

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const loginForm = event.currentTarget;

  setFeedback(authMessage, 'Ingresando...');

  const form = new FormData(loginForm);

  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password')
      })
    });

    sessionStorage.setItem(TOKEN_KEY, result.data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(result.data.user));

    loginForm.reset();

    showDashboard();
    await loadTasks();

    if (isAdmin()) {
      await loadUsers();
    }

  } catch (error) {
    setFeedback(authMessage, error.message);
  }
});

// --------------------------------------------------
// REGISTRO DE USUARIOS
// --------------------------------------------------

$('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const registerForm = event.currentTarget;

  setFeedback(authMessage, 'Creando cuenta...');

  const form = new FormData(registerForm);

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password')
      })
    });

    registerForm.reset();
    switchAuthTab('login');

    setFeedback(
      authMessage,
      'Cuenta creada. Ya puedes iniciar sesión.',
      true
    );

  } catch (error) {
    setFeedback(authMessage, error.message);
  }
});

// --------------------------------------------------
// NAVEGACIÓN ADMINISTRATIVA
// --------------------------------------------------

function showTasksView() {
  $('#tasks-panel').hidden = false;
  $('#users-panel').hidden = true;

  $('#tasks-view-button').classList.add('active');
  $('#users-view-button').classList.remove('active');

  $('#tasks-view-button').setAttribute('aria-pressed', 'true');
  $('#users-view-button').setAttribute('aria-pressed', 'false');

  $('#new-task-button').hidden = false;
}

async function showUsersView() {
  if (!isAdmin()) return;

  $('#tasks-panel').hidden = true;
  $('#users-panel').hidden = false;

  $('#tasks-view-button').classList.remove('active');
  $('#users-view-button').classList.add('active');

  $('#tasks-view-button').setAttribute('aria-pressed', 'false');
  $('#users-view-button').setAttribute('aria-pressed', 'true');

  $('#new-task-button').hidden = true;

  await loadUsers();
}

$('#tasks-view-button').addEventListener('click', () => {
  showTasksView();
});

$('#users-view-button').addEventListener('click', () => {
  showUsersView();
});

// --------------------------------------------------
// TAREAS
// --------------------------------------------------

function statusLabel(status) {
  return ({
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completada'
  })[status] || status;
}

function renderTasks() {
  const filter = $('#status-filter').value;

  const visibleTasks = filter === 'ALL'
    ? tasks
    : tasks.filter((task) => task.status === filter);

  $('#total-count').textContent = tasks.length;

  $('#pending-count').textContent =
    tasks.filter((task) => task.status === 'PENDING').length;

  $('#progress-count').textContent =
    tasks.filter((task) => task.status === 'IN_PROGRESS').length;

  $('#completed-count').textContent =
    tasks.filter((task) => task.status === 'COMPLETED').length;

  if (!visibleTasks.length) {
    $('#task-list').innerHTML =
      '<div class="empty-state">No hay tareas para mostrar. Puedes crear una nueva actividad.</div>';
    return;
  }

  const admin = isAdmin();

  $('#task-list').innerHTML = visibleTasks.map((task) => {
    // Estos campos se mostrarán cuando el backend incluya
    // la información del propietario de la tarea.
    const ownerName = task.user?.name || task.userName || '';
    const ownerEmail = task.user?.email || task.userEmail || '';

    return `
      <article class="task-card">
        <div class="task-main">
          <h3>${escapeHtml(task.title)}</h3>
          <p>${escapeHtml(task.description || 'Sin descripción')}</p>

          ${admin && (ownerName || ownerEmail) ? `
            <p class="task-owner">
              Responsable: ${escapeHtml(ownerName || ownerEmail)}
              ${ownerName && ownerEmail
                ? ` · ${escapeHtml(ownerEmail)}`
                : ''}
            </p>
          ` : ''}
        </div>

        <div class="task-meta">
          <span class="status status-${escapeHtml(task.status)}">
            ${escapeHtml(statusLabel(task.status))}
          </span>

          <div class="task-actions">
            <button class="small-button"
              data-action="edit"
              data-id="${escapeHtml(task.id)}"
              type="button">
              Editar
            </button>

            ${admin ? `
              <button class="small-button"
                data-action="delete"
                data-id="${escapeHtml(task.id)}"
                type="button">
                Eliminar
              </button>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

async function loadTasks() {
  setFeedback(dashboardMessage, 'Cargando tareas...');

  try {
    const result = await apiRequest('/tasks');

    tasks = Array.isArray(result.data)
      ? result.data
      : [];

    renderTasks();

    setFeedback(dashboardMessage, '');

  } catch (error) {
    setFeedback(dashboardMessage, error.message);
  }
}

$('#status-filter').addEventListener('change', renderTasks);

$('#task-list').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button) return;

  const task = tasks.find(
    (item) => item.id === button.dataset.id
  );

  if (!task) return;

  if (button.dataset.action === 'edit') {
    openTaskDialog(task);
  }

  if (button.dataset.action === 'delete') {
    if (!isAdmin()) return;

    if (!confirm(
      `¿Eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`
    )) return;

    try {
      await apiRequest(
        `/tasks/${encodeURIComponent(task.id)}`,
        { method: 'DELETE' }
      );

      await loadTasks();

    } catch (error) {
      setFeedback(dashboardMessage, error.message);
    }
  }
});

// --------------------------------------------------
// FORMULARIO DE CREACIÓN Y EDICIÓN
// --------------------------------------------------

function openTaskDialog(task = null) {
  editingTaskId = task ? task.id : null;

  $('#dialog-title').textContent = task
    ? 'Editar tarea'
    : 'Nueva tarea';

  taskForm.elements.title.value = task?.title || '';
  taskForm.elements.description.value = task?.description || '';
  taskForm.elements.status.value = task?.status || 'PENDING';

  setFeedback($('#task-form-message'), '');

  taskDialog.showModal();
}

$('#new-task-button').addEventListener('click', () => {
  openTaskDialog();
});

$('#close-dialog').addEventListener('click', () => {
  taskDialog.close();
});

$('#cancel-task').addEventListener('click', () => {
  taskDialog.close();
});

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = new FormData(taskForm);

  const body = {
    title: form.get('title'),
    description: form.get('description'),
    status: form.get('status')
  };

  try {
    if (editingTaskId) {
      await apiRequest(
        `/tasks/${encodeURIComponent(editingTaskId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(body)
        }
      );

    } else {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(body)
      });
    }

    taskDialog.close();

    await loadTasks();

  } catch (error) {
    setFeedback($('#task-form-message'), error.message);
  }
});

taskDialog.addEventListener('click', (event) => {
  if (event.target === taskDialog) {
    taskDialog.close();
  }
});

// --------------------------------------------------
// ADMINISTRACIÓN DE USUARIOS
// --------------------------------------------------

function formatDate(dateValue) {
  if (!dateValue) return 'No disponible';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'No disponible';
  }

  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function renderUsers() {
  $('#users-count').textContent =
    `${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'}`;

  if (!users.length) {
    $('#users-list').innerHTML =
      '<div class="empty-state">No hay usuarios registrados.</div>';
    return;
  }

  $('#users-list').innerHTML = `
    <div class="users-table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo electrónico</th>
            <th>Rol</th>
            <th>Fecha de registro</th>
          </tr>
        </thead>
        <tbody>
          ${users.map((user) => `
            <tr>
              <td>${escapeHtml(user.name)}</td>
              <td>${escapeHtml(user.email)}</td>
              <td>
                <span class="role-badge role-${escapeHtml(user.role)}">
                  ${escapeHtml(user.role)}
                </span>
              </td>
              <td>${escapeHtml(formatDate(user.createdAt))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadUsers() {
  if (!isAdmin()) return;

  setFeedback($('#users-message'), 'Cargando usuarios...');

  try {
    const result = await apiRequest('/admin/users');

    users = Array.isArray(result.data)
      ? result.data
      : [];

    renderUsers();

    setFeedback($('#users-message'), '');

  } catch (error) {
    users = [];

    $('#users-list').innerHTML =
      '<div class="empty-state">No fue posible cargar los usuarios.</div>';

    setFeedback($('#users-message'), error.message);
  }
}

// --------------------------------------------------
// INICIALIZACIÓN Y VALIDACIÓN DE SESIÓN
// --------------------------------------------------

async function initialize() {
  if (!getToken()) {
    showAuth();
    return;
  }

  try {
    const profile = await apiRequest('/auth/me');

    const user = profile.data;

    sessionStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      })
    );

    showDashboard();

    await loadTasks();

    if (isAdmin()) {
      await loadUsers();
    }

  } catch {
    logout(false);
  }
}

initialize();

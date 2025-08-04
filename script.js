const USERS_KEY = "frekwencja_users";
const CURRENT_USER_KEY = "frekwencja_current_user";
const FREKWENCJA_KEY = "frekwencja_data";
const STUDENTS = Array.from({length: 32}, (_, i) => ({ id: i + 1, name: "Uczeń " + (i + 1) }));

let currentUser = null;
let currentDate = new Date().toISOString().split("T")[0];

document.getElementById("selected-date").value = currentDate;

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function loadUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}
function login() {
  const u = document.getElementById("login-username").value;
  const p = document.getElementById("login-password").value;
  const users = loadUsers();
  const found = users.find(user => user.username === u && user.password === p);
  if (found) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    location.reload();
  } else {
    alert("Błędny login lub hasło");
  }
}
function register() {
  const u = document.getElementById("register-username").value;
  const p = document.getElementById("register-password").value;
  const users = loadUsers();
  if (users.find(user => user.username === u)) {
    alert("Login zajęty");
    return;
  }
  users.push({ username: u, password: p, role: "basic" });
  saveUsers(users);
  alert("Zarejestrowano! Zaloguj się.");
  showLogin();
}
function showRegister() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.remove("hidden");
}
function showLogin() {
  document.getElementById("register-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  location.reload();
}
function getFrekwencjaData() {
  return JSON.parse(localStorage.getItem(FREKWENCJA_KEY) || "{}");
}
function saveFrekwencjaData(data) {
  localStorage.setItem(FREKWENCJA_KEY, JSON.stringify(data));
}
function renderTable() {
  const data = getFrekwencjaData();
  const day = document.getElementById("selected-date").value;
  const tableContainer = document.getElementById("table-container");
  const canEdit = currentUser && (currentUser.role === "vip" || currentUser.role === "admin");
  if (!data[day]) {
    data[day] = {};
    STUDENTS.forEach(s => data[day][s.id] = "");
  }
  let html = "<table><thead><tr><th>#</th><th>Imię</th><th>Obecność</th></tr></thead><tbody>";
  STUDENTS.forEach(s => {
    const value = data[day][s.id] || "";
    const select = canEdit
      ? `<select onchange="updateFrekwencja(${s.id}, this.value)">
           <option value="">-</option>
           <option value="✔" ${value === "✔" ? "selected" : ""}>✔</option>
           <option value="✘" ${value === "✘" ? "selected" : ""}>✘</option>
         </select>`
      : value;
    html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${select}</td></tr>`;
  });
  html += "</tbody></table>";
  tableContainer.innerHTML = html;
  saveFrekwencjaData(data);
}
function updateFrekwencja(studentId, status) {
  const data = getFrekwencjaData();
  const day = document.getElementById("selected-date").value;
  data[day][studentId] = status;
  saveFrekwencjaData(data);
}
function setToday() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("selected-date").value = today;
  renderTable();
}
function exportCSV() {
  if (!currentUser || currentUser.role === "guest") return;
  const day = document.getElementById("selected-date").value;
  const data = getFrekwencjaData()[day];
  let csv = "Numer,Imię,Obecność\n";
  STUDENTS.forEach(s => {
    csv += `${s.id},${s.name},${data[s.id] || ""}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `frekwencja_${day}.csv`;
  a.click();
}
function promoteToVIP() {
  const name = document.getElementById("vip-username").value;
  const users = loadUsers();
  const user = users.find(u => u.username === name);
  if (!user) return alert("Nie znaleziono użytkownika");
  user.role = "vip";
  saveUsers(users);
  alert("Nadano rangę VIP");
}
function init() {
  currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
  if (!currentUser) {
    document.getElementById("login-section").classList.remove("hidden");
    return;
  }
  if (currentUser.role === "guest") return;
  document.getElementById("main-section").classList.remove("hidden");
  document.getElementById("welcome").innerText = `Zalogowano jako ${currentUser.username} (${currentUser.role})`;
  if (currentUser.role === "admin") {
    document.getElementById("admin-controls").classList.remove("hidden");
  }
  if (currentUser.role === "basic") {
    document.getElementById("export-btn").disabled = false;
  }
  renderTable();
}
(function setupDefaultAdmin() {
  const users = loadUsers();
  if (!users.find(u => u.role === "admin")) {
    users.push({ username: "admin", password: "admin123", role: "admin" });
    saveUsers(users);
  }
})();
init();
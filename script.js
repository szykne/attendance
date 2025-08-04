const students = [
    "Jan", "Grzegorz", "Julia", "Mateusz", "Hubert", "Jakub", "Mikołaj", "Piotr", "Adam",
    "Bartłomiej", "Kamil", "Hubert", "Mateusz", "Szymon", "Kacper", "Adrian", "Dawid", "Mateusz",
    "Seweryn", "Miłosz", "Przemysław", "Damian", "Emilia", "Wojciech", "Krzysztof", "Sylwia",
    "Mikołaj", "Jakub", "Hubert", "Miłosz", "Mariusz", "Zuzanna"
];

const tableBody = document.querySelector("#attendanceTable tbody");
const datePicker = document.getElementById("datePicker");
const attendancePercent = document.getElementById("attendancePercent");

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function loadAttendance(dateStr) {
    tableBody.innerHTML = "";
    let data = JSON.parse(localStorage.getItem(dateStr) || "{}");
    let presentCount = 0;

    students.forEach((name, index) => {
        const tr = document.createElement("tr");
        const isPresent = data[index] === true;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${name}</td>
            <td><button class="presence-btn" data-index="${index}">${isPresent ? "✅" : "❌"}</button></td>
        `;
        tableBody.appendChild(tr);
        if (isPresent) presentCount++;
    });

    attendancePercent.textContent = `${Math.round((presentCount / students.length) * 100)}%`;
}

function saveAttendance(dateStr) {
    const data = {};
    document.querySelectorAll(".presence-btn").forEach(btn => {
        const index = btn.getAttribute("data-index");
        data[index] = btn.textContent === "✅";
    });
    localStorage.setItem(dateStr, JSON.stringify(data));
}

tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("presence-btn")) {
        const btn = e.target;
        btn.textContent = btn.textContent === "✅" ? "❌" : "✅";
        saveAttendance(datePicker.value);
        loadAttendance(datePicker.value);
    }
});

function goToToday() {
    const today = formatDate(new Date());
    datePicker.value = today;
    loadAttendance(today);
}

datePicker.addEventListener("change", () => {
    loadAttendance(datePicker.value);
});

// Init
goToToday();


// Eksport do Excela
function exportToExcel() {
    const dateStr = datePicker.value;
    let tableData = [["Nr", "Imię", "Obecność"]];

    document.querySelectorAll("#attendanceTable tbody tr").forEach(row => {
        const cells = row.querySelectorAll("td");
        tableData.push([cells[0].textContent, cells[1].textContent, cells[2].textContent]);
    });

    // Tworzymy CSV ze średnikiem jako separatorem i BOM
    let csvContent = "\uFEFF" + tableData.map(e => e.join(";")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `frekwencja_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Dodaj przycisk eksportu do strony
const exportBtn = document.createElement("button");
exportBtn.textContent = "📥 Eksportuj do CSV";
exportBtn.onclick = exportToExcel;
document.querySelector(".controls").appendChild(exportBtn);

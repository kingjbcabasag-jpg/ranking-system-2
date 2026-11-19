// ==========================================
// 1. DSA: LINKED LIST & 2D ARRAY STRUCTURE
// ==========================================
class Node {
    constructor(id, name, score) {
        this.id = id;
        this.name = name;
        this.score = Number(score);
        this.attendance = [1, 1, 1, 1, 1]; // 5-day attendance array
        this.remarks = "";
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }

    add(id, name, score) {
        const newNode = new Node(id, name, score);
        if (!this.head) {
            this.head = newNode;
            return;
        }
        let curr = this.head;
        while (curr.next) {
            curr = curr.next;
        }
        curr.next = newNode;
    }

    remove(id) {
        if (!this.head) return;
        if (this.head.id === id) {
            this.head = this.head.next;
            return;
        }
        let curr = this.head;
        while (curr.next && curr.next.id !== id) {
            curr = curr.next;
        }
        if (curr.next) {
            curr.next = curr.next.next;
        }
    }

    getAll() {
        const list = [];
        let curr = this.head;
        while (curr) {
            list.push(curr);
            curr = curr.next;
        }
        return list;
    }
}

// Initial Sample Data
const db = new LinkedList();
db.add("101", "Juan Dela Cruz", 88);
db.add("102", "Maria Clara", 95);
db.add("103", "Jose Rizal", 92);
db.add("104", "Andres Bonifacio", 85);

// ==========================================
// 2. LOGIN & LOGOUT LOGIC (NO FORM RELOAD)
// ==========================================
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginBox = document.getElementById("loginBox");
const errMsg = document.getElementById("errMsg");

document.getElementById("loginBtn").addEventListener("click", function () {
    const user = document.getElementById("userInput").value.trim();
    const pass = document.getElementById("passInput").value.trim();

    if (user === "admin" && pass === "1234") {
        errMsg.style.display = "none";
        loginView.style.opacity = "0";
        setTimeout(() => {
            loginView.style.display = "none";
            dashboardView.style.display = "flex";
            refreshUI();
        }, 250);
    } else {
        errMsg.style.display = "block";
        loginBox.classList.remove("shake");
        void loginBox.offsetWidth;
        loginBox.classList.add("shake");
    }
});

// Enter key support sa password input
document.getElementById("passInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        document.getElementById("loginBtn").click();
    }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
    dashboardView.style.display = "none";
    loginView.style.display = "flex";
    setTimeout(() => {
        loginView.style.opacity = "1";
    }, 10);
});

// ==========================================
// 3. TAB NAVIGATION
// ==========================================
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", function () {
        document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
        this.classList.add("active");

        const target = this.getAttribute("data-target");
        document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
        document.getElementById(target).classList.add("active");

        document.getElementById("headerTitle").innerText = this.innerText;
        refreshUI();
    });
});

// ==========================================
// 4. ADD, DELETE, ATTENDANCE & REMARKS
// ==========================================
document.getElementById("addStudentBtn").addEventListener("click", function () {
    const id = document.getElementById("newId").value.trim();
    const name = document.getElementById("newName").value.trim();
    const score = document.getElementById("newScore").value.trim();

    if (!id || !name || score === "") {
        alert("Please fill out all fields!");
        return;
    }

    if (db.getAll().some(s => s.id === id)) {
        alert("Student ID already exists!");
        return;
    }

    db.add(id, name, score);
    document.getElementById("newId").value = "";
    document.getElementById("newName").value = "";
    document.getElementById("newScore").value = "";
    refreshUI();
});

function removeStudent(id) {
    db.remove(id);
    refreshUI();
}

function toggleDay(id, dayIdx) {
    let curr = db.head;
    while (curr) {
        if (curr.id === id) {
            curr.attendance[dayIdx] = curr.attendance[dayIdx] === 1 ? 0 : 1;
            break;
        }
        curr = curr.next;
    }
    refreshUI();
}

function saveRemark(id, text) {
    let curr = db.head;
    while (curr) {
        if (curr.id === id) {
            curr.remarks = text;
            break;
        }
        curr = curr.next;
    }
}

// ==========================================
// 5. DSA: BUBBLE SORT & LINEAR SEARCH
// ==========================================
function countPresent(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

function calcPoints(student) {
    return (countPresent(student.attendance) * 10) + student.score;
}

function bubbleSortRank(list) {
    const arr = [...list];
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (calcPoints(arr[j]) < calcPoints(arr[j + 1])) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}

document.getElementById("searchBox").addEventListener("keyup", function () {
    const q = this.value.toLowerCase();
    const filtered = db.getAll().filter(s =>
        s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
    renderTables(filtered);
});

// ==========================================
// 6. RENDER TABLES
// ==========================================
function refreshUI() {
    renderTables(db.getAll());
}

function renderTables(students) {
    const ranked = bubbleSortRank(students);

    document.getElementById("statTotal").innerText = students.length;
    document.getElementById("statTop").innerText = ranked.length > 0 ? ranked[0].name : "-";

    // Dashboard Table
    document.getElementById("tblDashboard").innerHTML = students.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${countPresent(s.attendance)} / 5</td>
            <td>${s.score}</td>
            <td><strong>${calcPoints(s)}</strong></td>
        </tr>
    `).join("");

    // Attendance Table
    document.getElementById("tblAttendance").innerHTML = students.map(s => {
        const days = s.attendance.map((val, idx) =>
            <td><input type="checkbox" ${val === 1 ? "checked" : ""} onchange="toggleDay('${s.id}', ${idx})"></td>
        ).join("");
        return `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                ${days}
                <td><input type="text" class="remark-box" value="${s.remarks}" placeholder="Note..." onchange="saveRemark('${s.id}', this.value)"></td>
            </tr>
        `;
    }).join("");

    // Students List Table
    document.getElementById("tblStudents").innerHTML = students.map(s => `
        <tr>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.score}</td>
            <td><button class="btn-del" onclick="removeStudent('${s.id}')">Delete</button></td>
        </tr>
    `).join("");

    // Ranking Table
    document.getElementById("tblRanking").innerHTML = ranked.map((s, idx) => `
        <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${countPresent(s.attendance)} / 5</td>
            <td>${s.score}</td>
            <td><strong>${calcPoints(s)}</strong></td>
        </tr>
    `).join("");
}

refreshUI();
// ==========================================
// 1. DSA: LINKED LIST + 15-DAY 2D ATTENDANCE + SCORES
// ==========================================
const DAYS_PER_BATCH = 5;
const TOTAL_MONTH_DAYS = 15;
let currentBatch = 0;

class StudentNode {
    constructor(id, name, scores = []) {
        this.id = id;
        this.name = name;
        this.attendance = Array.from({ length: TOTAL_MONTH_DAYS }, () => 1);
        this.scores = [...scores];
        this.next = null;
    }
}

class StudentLinkedList {
    constructor() {
        this.head = null;
    }

    add(id, name, scores = []) {
        const node = new StudentNode(id, name, scores);
        if (!this.head) {
            this.head = node;
            return;
        }
        let curr = this.head;
        while (curr.next) curr = curr.next;
        curr.next = node;
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

    findById(id) {
        let curr = this.head;
        while (curr) {
            if (curr.id === id) return curr;
            curr = curr.next;
        }
        return null;
    }

    toArray() {
        const arr = [];
        let curr = this.head;
        while (curr) {
            arr.push(curr);
            curr = curr.next;
        }
        return arr;
    }
}

const activities = [
    { title: "Activity 1: Quiz", max: 50 },
    { title: "Activity 2: Lab", max: 50 }
];

const roster = new StudentLinkedList();
roster.add("STU-01", "Lloyd", [46, 48]);
roster.add("STU-02", "King", [44, 47]);
roster.add("STU-03", "Jeston", [49, 45]);
roster.add("STU-04", "Jefferson", [41, 43]);
roster.add("STU-05", "Reymond", [45, 42]);
roster.add("STU-06", "Aaron", [47, 46]);

function syncSlots() {
    let curr = roster.head;
    while (curr) {
        while (curr.scores.length < activities.length) {
            curr.scores.push(0);
        }
        if (curr.attendance.length !== TOTAL_MONTH_DAYS) {
            curr.attendance = Array.from({ length: TOTAL_MONTH_DAYS }, (_, idx) => curr.attendance[idx] ?? 1);
        }
        curr = curr.next;
    }
}
syncSlots();

// ==========================================
// 2. 3D MOUSE TILT
// ==========================================
function bind3DTilt() {
    document.querySelectorAll(".tilt-card").forEach((card) => {
        card.onmousemove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            const rotateY = ((x - midX) / midX) * 5;
            const rotateX = -((y - midY) / midY) * 5;
            card.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
        };
        card.onmouseleave = () => {
            card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
        };
    });
}
bind3DTilt();

// ==========================================
// 3. LOGIN & LOGOUT
// ==========================================
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");
const loginCard = document.getElementById("loginCard");
const loginErr = document.getElementById("loginErr");
const userEl = document.getElementById("loginUser");
const passEl = document.getElementById("loginPass");

function attemptLogin() {
    const u = userEl.value.trim();
    const p = passEl.value.trim();

    if (u === "admin" && p === "1234") {
        loginErr.style.display = "none";
        loginScreen.classList.add("leaving");
        setTimeout(() => {
            loginScreen.style.display = "none";
            mainApp.classList.add("visible");
            renderAll();
            bind3DTilt();
        }, 340);
    } else {
        loginErr.style.display = "block";
        loginCard.classList.remove("shake");
        void loginCard.offsetWidth;
        loginCard.classList.add("shake");
    }
}

document.getElementById("loginBtn").addEventListener("click", attemptLogin);
passEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    userEl.value = "";
    passEl.value = "";
    loginErr.style.display = "none";
    mainApp.classList.remove("visible");
    loginScreen.style.display = "flex";
    setTimeout(() => {
        loginScreen.classList.remove("leaving");
    }, 10);
});

// ==========================================
// 4. 3D NAVIGATION & BATCH SWITCHING
// ==========================================
document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const targetId = btn.getAttribute("data-tab");
        document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.remove("active"));
        const activePanel = document.getElementById(targetId);
        void activePanel.offsetWidth;
        activePanel.classList.add("active");

        document.getElementById("activeTitle").textContent = btn.textContent.replace(/^\d+\s*/, "").trim();
        renderAll();
        bind3DTilt();
    });
});

document.querySelectorAll(".batch-btn").forEach((bBtn) => {
    bBtn.addEventListener("click", () => {
        document.querySelectorAll(".batch-btn").forEach((b) => b.classList.remove("active"));
        bBtn.classList.add("active");
        currentBatch = Number(bBtn.getAttribute("data-batch"));
        renderAll();
    });
});

// ==========================================
// 5. CRUD, ATTENDANCE & SCORES
// ==========================================
document.getElementById("addStuBtn").addEventListener("click", () => {
    const id = document.getElementById("stuId").value.trim();
    const name = document.getElementById("stuName").value.trim();

    if (!id || !name) {
        alert("Ilagay ang Student ID at Student Name.");
        return;
    }
    if (roster.findById(id)) {
        alert("May student na gumagamit ng ID na iyan!");
        return;
    }

    roster.add(id, name, activities.map(() => 0));
    document.getElementById("stuId").value = "";
    document.getElementById("stuName").value = "";
    renderAll();
});

document.getElementById("addActBtn").addEventListener("click", () => {
    const title = document.getElementById("actTitle").value.trim();
    const max = Number(document.getElementById("actMax").value) || 50;

    if (!title) {
        alert("Ilagay ang pangalan ng activity.");
        return;
    }

    activities.push({ title, max });
    syncSlots();
    document.getElementById("actTitle").value = "";
    document.getElementById("actMax").value = "50";
    renderAll();
});

function deleteStudent(id) {
    roster.remove(id);
    renderAll();
}

function toggleDay(id, dayIdx) {
    const s = roster.findById(id);
    if (!s) return;
    s.attendance[dayIdx] = s.attendance[dayIdx] === 1 ? 0 : 1;
    renderAll();
}

function updateScore(id, actIdx, rawValue) {
    const s = roster.findById(id);
    if (!s) return;
    const maxScore = activities[actIdx] ? activities[actIdx].max : 100;
    let val = Number(rawValue);
    if (Number.isNaN(val) || val < 0) val = 0;
    if (val > maxScore) val = maxScore;
    s.scores[actIdx] = val;
    renderAll();
}

// ==========================================
// 6. COMPUTATION, SORTING & SEARCH
// ==========================================
function getPresentCount(student) {
    return student.attendance.slice(0, TOTAL_MONTH_DAYS).reduce((acc, v) => acc + v, 0);
}

function getScoreSum(student) {
    return student.scores.reduce((acc, s) => acc + Number(s || 0), 0);
}

function getTotalPoints(student) {
    return (getPresentCount(student) * 10) + getScoreSum(student);
}

function sortByPointsDesc(list) {
    const arr = [...list];
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (getTotalPoints(arr[j]) < getTotalPoints(arr[j + 1])) {
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}

document.getElementById("searchInput").addEventListener("input", renderAll);

// ==========================================
// 7. RENDER TABLES
// ==========================================
function renderAll() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const allStudents = roster.toArray();
    const rankedAll = sortByPointsDesc(allStudents);

    document.getElementById("kpiTotal").textContent = allStudents.length;
    document.getElementById("kpiTop").textContent = rankedAll.length > 0 ? rankedAll[0].name : "—";
    document.getElementById("kpiMeta").textContent = `5d/set • 15d/mo (${activities.length} Act)`;

    const filtered = allStudents.filter((s) =>
        s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)
    );

    // Overview
    document.getElementById("overviewBody").innerHTML = filtered.map((s) => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td><strong>${s.name}</strong></td>
            <td>${getPresentCount(s)} / ${TOTAL_MONTH_DAYS} days</td>
            <td>${getScoreSum(s)}</td>
            <td><strong style="color:#22d3ee">${getTotalPoints(s)} pts</strong></td>
        </tr>
    `).join("");

    // Scores
    const actHeaders = activities.map((a) => `<th>${a.title} (/${a.max})</th>`).join("");
    document.getElementById("scoresHead").innerHTML = `
        <tr>
            <th>ID</th>
            <th>Student Name</th>
            ${actHeaders}
            <th>Total Score</th>
            <th>Action</th>
        </tr>
    `;

    document.getElementById("scoresBody").innerHTML = filtered.map((s) => {
        const scoreCells = activities.map((a, idx) => `
            <td>
                <input
                    type="number"
                    class="score-input"
                    min="0"
                    max="${a.max}"
                    value="${s.scores[idx] ?? 0}"
                    onchange="updateScore('${s.id}', ${idx}, this.value)"
                >
            </td>
        `).join("");

        return `
            <tr>
                <td><strong>${s.id}</strong></td>
                <td><strong>${s.name}</strong></td>
                ${scoreCells}
                <td><strong>${getScoreSum(s)}</strong></td>
                <td><button type="button" class="btn-del" onclick="deleteStudent('${s.id}')">Remove</button></td>
            </tr>
        `;
    }).join("");

    // 5-day batch attendance out of 15 monthly days
    const startDay = currentBatch * DAYS_PER_BATCH;
    const dayIndices = Array.from({ length: DAYS_PER_BATCH }, (_, i) => startDay + i);

    document.getElementById("attHead").innerHTML = `
        <tr>
            <th>ID</th>
            <th>Student Name</th>
            ${dayIndices.map((dIdx) => `<th>Day ${dIdx + 1}</th>`).join("")}
            <th>Monthly Total (15d)</th>
        </tr>
    `;

    document.getElementById("attBody").innerHTML = filtered.map((s) => {
        const pills = dayIndices.map((dIdx) => {
            const isPresent = s.attendance[dIdx] === 1;
            return `
                <td>
                    <button
                        type="button"
                        class="day-pill ${isPresent ? "present" : "absent"}"
                        onclick="toggleDay('${s.id}', ${dIdx})"
                    >
                        ${isPresent ? "PRESENT" : "ABSENT"}
                    </button>
                </td>
            `;
        }).join("");

        return `
            <tr>
                <td><strong>${s.id}</strong></td>
                <td><strong>${s.name}</strong></td>
                ${pills}
                <td><strong>${getPresentCount(s)} / ${TOTAL_MONTH_DAYS}</strong></td>
            </tr>
        `;
    }).join("");

    // Rankings
    const rankedFiltered = sortByPointsDesc(filtered);
    document.getElementById("rankBody").innerHTML = rankedFiltered.map((s, idx) => {
        const rankClass = idx === 0 ? "rank-1" : idx === 1 ? "rank-2" : idx === 2 ? "rank-3" : "";
        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">#${idx + 1}</span></td>
                <td><strong>${s.id}</strong></td>
                <td><strong>${s.name}</strong></td>
                <td>${getPresentCount(s)} / ${TOTAL_MONTH_DAYS}</td>
                <td>${getScoreSum(s)}</td>
                <td><strong style="color:#34d399">${getTotalPoints(s)} pts</strong></td>
            </tr>
        `;
    }).join("");
}

renderAll();
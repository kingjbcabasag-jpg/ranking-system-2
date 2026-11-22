// ==========================================
// 1. DSA: LINKED LIST + 15-DAY MONTHLY 2D ATTENDANCE + ACTIVITY SCORES
// ==========================================
const DAYS_PER_BATCH = 5;   // 5 days per set
const TOTAL_MONTH_DAYS = 15; // 15 days total per month (3 sets x 5 days)
let currentBatch = 0;       // 0 = Days 1-5, 1 = Days 6-10, 2 = Days 11-15

class StudentNode {
    constructor(id, name, scores = []) {
        this.id = id;
        this.name = name;
        this.attendance = Array.from({ length: TOTAL_MONTH_DAYS }, () => 1); // 15 days (1 = Present, 0 = Absent)
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

// Activities Array
const activities = [
    { title: "Activity 1: Quiz", max: 50 },
    { title: "Activity 2: Lab", max: 50 }
];

// Initialize Linked List with requested names
const roster = new StudentLinkedList();
roster.add("STU-01", "Lloyd", [46, 48]);
roster.add("STU-02", "King", [44, 47]);
roster.add("STU-03", "Jeston", [49, 45]);
roster.add("STU-04", "Jefferson", [41, 43]);
roster.add("STU-05", "Reymond", [45, 42]);
roster.add("STU-06", "Aaron", [47, 46]);

function syncActivitySlots() {
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
syncActivitySlots();

// ==========================================
// 2. 3D MOUSE TILT EFFECT
// ==========================================
function bind3DTiltEffects() {
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
bind3DTiltEffects();

// ==========================================
// 3. LOGIN & LOGOUT (NO PREFILLED INPUTS)
// ==========================================
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");
const loginCard = document.getElementById("loginCard");
const loginErr = document.getElementById("loginErr");
const userInputEl = document.getElementById("loginUser");
const passInputEl = document.getElementById("loginPass");

function attemptLogin() {
    const user = userInputEl.value.trim();
    const pass = passInputEl.value.trim();

    if (user === "admin" && pass === "1234") {
        loginErr.style.display = "none";
        loginScreen.classList.add("leaving");
        setTimeout(() => {
            loginScreen.style.display = "none";
            mainApp.style.display = "flex";
            renderAll();
            bind3DTiltEffects();
        }, 340);
    } else {
        loginErr.style.display = "block";
        loginCard.classList.remove("shake");
        void loginCard.offsetWidth;
        loginCard.classList.add("shake");
    }
}

document.getElementById("loginBtn").addEventListener("click", attemptLogin);
passInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    userInputEl.value = "";
    passInputEl.value = "";
    loginErr.style.display = "none";
    mainApp.style.display = "none";
    loginScreen.style.display = "flex";
    setTimeout(() => {
        loginScreen.classList.remove("leaving");
    }, 10);
});

// ==========================================
// 4. 3D TAB & BATCH SWITCHING
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
        bind3DTiltEffects();
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
// 5. ADD STUDENT, ADD ACTIVITY, SCORES & ATTENDANCE
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

    const zeroScores = activities.map(() => 0);
    roster.add(id, name, zeroScores);
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
    syncActivitySlots();
    document.getElementById("actTitle").value = "";
    document.getElementById("actMax").value = "50";
    renderAll();
});

function deleteStudent(id) {
    roster.remove(id);
    renderAll();
}

function toggleDay(id, dayIdx) {
    const student = roster.findById(id);
    if (!student) return;
    student.attendance[dayIdx] = student.attendance[dayIdx] === 1 ? 0 : 1;
    renderAll();
}

function updateScore(id, actIdx, rawValue) {
    const student = roster.findById(id);
    if (!student) return;
    const maxScore = activities[actIdx] ? activities[actIdx].max : 100;
    let val = Number(rawValue);
    if (Number.isNaN(val) || val < 0) val = 0;
    if (val > maxScore) val = maxScore;
    student.scores[actIdx] = val;
    renderAll();
}

// ==========================================
// 6. COMPUTATION, BUBBLE SORT & LINEAR SEARCH
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

document.getElementById("searchInput").addEventListener("input", () => {
    renderAll();
});

// ==========================================
// 7. RENDER UI
// ==========================================
function renderAll() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const allStudents = roster.toArray();
    const rankedAll = sortByPointsDesc(allStudents);

    // KPIs
    document.getElementById("kpiTotal").textContent = allStudents.length;
    document.getElementById("kpiTop").textContent = rankedAll.length > 0 ? rankedAll[0].name : "—";
    document.getElementById("kpiMeta").textContent = `5d/set • 15d/mo (${activities.length} Act)`;

    // Linear Search filter
    const filtered = allStudents.filter((s) =>
        s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)
    );

    // 1. Overview Table
    document.getElementById("overviewBody").innerHTML = filtered.map((s) => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td><strong>${s.name}</strong></td>
            <td>${getPresentCount(s)} / ${TOTAL_MONTH_DAYS} days</td>
            <td>${getScoreSum(s)}</td>
            <td><strong style="color:#22d3ee">${getTotalPoints(s)} pts</strong></td>
        </tr>
    `).join("");

    // 2. Activity Scores Matrix
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

    // 3. 5-Day Batch Attendance Table (out of 15 days per month)
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

    // 4. Rankings Table
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
// ==========================================
// 1. DSA: LINKED LIST + 2D ATTENDANCE + ACTIVITY SCORES
// ==========================================
class StudentNode {
    constructor(id, name, scores = []) {
        this.id = id;
        this.name = name;
        this.attendance = [1, 1, 1, 1, 1]; // 5-day attendance row (1 = Present, 0 = Absent)
        this.scores = [...scores];         // Array of scores aligned with activities
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

// Initialize Linked List
const roster = new StudentLinkedList();
roster.add("STU-01", "Elena Reyes", [46, 48]);
roster.add("STU-02", "Marcus Santos", [42, 45]);
roster.add("STU-03", "Ariana Lim", [49, 47]);
roster.add("STU-04", "Devon Cruz", [38, 40]);

function syncStudentScoreSlots() {
    let curr = roster.head;
    while (curr) {
        while (curr.scores.length < activities.length) {
            curr.scores.push(0);
        }
        curr = curr.next;
    }
}
syncStudentScoreSlots();

// ==========================================
// 2. LOGIN & LOGOUT
// ==========================================
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");
const loginCard = document.getElementById("loginCard");
const loginErr = document.getElementById("loginErr");

function attemptLogin() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    if (user === "admin" && pass === "1234") {
        loginErr.style.display = "none";
        loginScreen.classList.add("leaving");
        setTimeout(() => {
            loginScreen.style.display = "none";
            mainApp.style.display = "flex";
            renderAll();
        }, 320);
    } else {
        loginErr.style.display = "block";
        loginCard.classList.remove("shake");
        void loginCard.offsetWidth;
        loginCard.classList.add("shake");
    }
}

document.getElementById("loginBtn").addEventListener("click", attemptLogin);
document.getElementById("loginPass").addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    mainApp.style.display = "none";
    loginScreen.style.display = "flex";
    loginScreen.classList.remove("leaving");
});

// ==========================================
// 3. TAB TRANSITIONS
// ==========================================
document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const targetId = btn.getAttribute("data-tab");
        document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.remove("active"));
        document.getElementById(targetId).classList.add("active");

        document.getElementById("activeTitle").textContent = btn.textContent.replace(/^\d+\s*/, "").trim();
        renderAll();
    });
});

// ==========================================
// 4. ADD STUDENT, ADD ACTIVITY, SCORES & ATTENDANCE
// ==========================================
document.getElementById("addStuBtn").addEventListener("click", () => {
    const id = document.getElementById("stuId").value.trim();
    const name = document.getElementById("stuName").value.trim();

    if (!id || !name) {
        alert("Ilagay ang Student ID at Full Name.");
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
    syncStudentScoreSlots();
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
// 5. COMPUTATION, BUBBLE SORT & LINEAR SEARCH
// ==========================================
function getPresentCount(student) {
    return student.attendance.reduce((acc, v) => acc + v, 0);
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
// 6. RENDER UI
// ==========================================
function renderAll() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const allStudents = roster.toArray();
    const rankedAll = sortByPointsDesc(allStudents);

    // KPIs
    document.getElementById("kpiTotal").textContent = allStudents.length;
    document.getElementById("kpiTop").textContent = rankedAll.length > 0 ? rankedAll[0].name : "—";
    document.getElementById("kpiActivities").textContent = activities.length;

    // Linear Search filter
    const filtered = allStudents.filter((s) =>
        s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)
    );

    // 1. Overview Table
    document.getElementById("overviewBody").innerHTML = filtered.map((s) => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.name}</td>
            <td>${getPresentCount(s)} / 5</td>
            <td>${getScoreSum(s)}</td>
            <td><strong style="color:#22d3ee">${getTotalPoints(s)} pts</strong></td>
        </tr>
    `).join("");

    // 2. Activity Scores Matrix
    const actHeaders = activities.map((a) => `<th>${a.title} (/${a.max})</th>`).join("");
    document.getElementById("scoresHead").innerHTML = `
        <tr>
            <th>ID</th>
            <th>Student</th>
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
                <td>${s.name}</td>
                ${scoreCells}
                <td><strong>${getScoreSum(s)}</strong></td>
                <td><button type="button" class="btn-del" onclick="deleteStudent('${s.id}')">Remove</button></td>
            </tr>
        `;
    }).join("");

    // 3. 5-Day Attendance Table
    document.getElementById("attBody").innerHTML = filtered.map((s) => {
        const pills = s.attendance.map((val, dIdx) => {
            const isPresent = val === 1;
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
                <td>${s.name}</td>
                ${pills}
                <td><strong>${getPresentCount(s)} / 5</strong></td>
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
                <td>${s.name}</td>
                <td>${getPresentCount(s)} / 5</td>
                <td>${getScoreSum(s)}</td>
                <td><strong style="color:#34d399">${getTotalPoints(s)} pts</strong></td>
            </tr>
        `;
    }).join("");
}

renderAll();
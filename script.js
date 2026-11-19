// ==========================================
// 0. LOGIN & LOGOUT SYSTEM (FIXED)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginCard = document.querySelector('.login-card');

    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        if (user === "admin" && pass === "1234") {
            loginError.style.display = "none";
            loginScreen.style.opacity = "0";
            loginScreen.style.pointerEvents = "none";

            setTimeout(() => {
                loginScreen.style.display = "none";
                appContainer.classList.remove('hidden');
                appContainer.style.display = "flex";
                if (typeof renderAll === "function") {
                    renderAll();
                }
            }, 300);
        } else {
            loginError.style.display = "block";
            if (loginCard) {
                loginCard.classList.remove('shake');
                void loginCard.offsetWidth;
                loginCard.classList.add('shake');
            }
        }
    });
});

function logout() {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');

    appContainer.style.display = "none";
    appContainer.classList.add('hidden');

    loginScreen.style.display = "flex";
    loginScreen.style.pointerEvents = "auto";
    setTimeout(() => {
        loginScreen.style.opacity = "1";
    }, 10);

    if (loginForm) loginForm.reset();
}

// ==========================================
// 1. LINKED LIST IMPLEMENTATION (Dynamic Student Management)
// ==========================================
class StudentNode {
    constructor(id, name, score) {
        this.id = id;
        this.name = name;
        this.score = Number(score);
        // 2D Array concept: bawat estudyante ay may array para sa 5 days attendance
        this.attendance = [1, 1, 1, 1, 1]; // 1 = Present, 0 = Absent
        this.remarks = "";
        this.next = null;
    }
}

class StudentLinkedList {
    constructor() {
        this.head = null;
    }

    append(id, name, score) {
        const newNode = new StudentNode(id, name, score);
        if (!this.head) {
            this.head = newNode;
            return;
        }
        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
    }

    delete(id) {
        if (!this.head) return;
        if (this.head.id === id) {
            this.head = this.head.next;
            return;
        }
        let current = this.head;
        while (current.next && current.next.id !== id) {
            current = current.next;
        }
        if (current.next) {
            current.next = current.next.next;
        }
    }

    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push(current);
            current = current.next;
        }
        return arr;
    }
}

// ==========================================
// INITIAL DATA SETUP
// ==========================================
const studentList = new StudentLinkedList();
studentList.append("101", "Juan Dela Cruz", 88);
studentList.append("102", "Maria Clara", 95);
studentList.append("103", "Jose Rizal", 92);
studentList.append("104", "Andres Bonifacio", 85);

// ==========================================
// NAVIGATION SWITCHING
// ==========================================
function showSection(sectionId, element) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');

    document.getElementById('page-title').innerText = element.innerText;
    renderAll();
}

// ==========================================
// REGISTER & DELETE STUDENTS
// ==========================================
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('studentId').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const score = document.getElementById('studentScore').value;

    const exists = studentList.toArray().some(s => s.id === id);
    if (exists) {
        alert("Student ID already exists!");
        return;
    }

    studentList.append(id, name, score);
    this.reset();
    renderAll();
});

function deleteStudent(id) {
    studentList.delete(id);
    renderAll();
}

// ==========================================
// 2D ARRAY ATTENDANCE & REMARKS UPDATE
// ==========================================
function toggleAttendance(id, dayIndex) {
    let current = studentList.head;
    while (current) {
        if (current.id === id) {
            current.attendance[dayIndex] = current.attendance[dayIndex] === 1 ? 0 : 1;
            break;
        }
        current = current.next;
    }
    renderAll();
}

function updateRemarks(id, value) {
    let current = studentList.head;
    while (current) {
        if (current.id === id) {
            current.remarks = value;
            break;
        }
        current = current.next;
    }
}

// ==========================================
// COMPUTATION & SORTING ALGORITHM (Bubble Sort for Ranking)
// ==========================================
function getTotalPresent(attendanceArr) {
    return attendanceArr.reduce((sum, val) => sum + val, 0);
}

function getTotalPoints(student) {
    return (getTotalPresent(student.attendance) * 10) + student.score;
}

function sortStudentsByRank(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (getTotalPoints(arr[j]) < getTotalPoints(arr[j + 1])) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}

// ==========================================
// SEARCHING ALGORITHM (Linear Search)
// ==========================================
function searchStudent() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const allStudents = studentList.toArray();
    
    const filtered = allStudents.filter(student => 
        student.name.toLowerCase().includes(query) || 
        student.id.toLowerCase().includes(query)
    );

    renderTables(filtered);
}

// ==========================================
// RENDER ALL UI TABLES
// ==========================================
function renderAll() {
    const students = studentList.toArray();
    renderTables(students);
}

function renderTables(students) {
    // 1. Update Dashboard Cards
    document.getElementById('totalStudents').innerText = students.length;
    const rankedStudents = sortStudentsByRank([...students]);
    document.getElementById('topStudent').innerText = rankedStudents.length > 0 ? rankedStudents[0].name : "None";

    // 2. Render Dashboard Summary Table
    const dashBody = document.getElementById('dashboardTableBody');
    dashBody.innerHTML = "";
    students.forEach(s => {
        const present = getTotalPresent(s.attendance);
        const totalPts = getTotalPoints(s);
        dashBody.innerHTML += `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${present} / 5</td>
                <td>${s.score}</td>
                <td><strong>${totalPts}</strong></td>
            </tr>
        `;
    });

    // 3. Render Attendance Sheet Table
    const attBody = document.getElementById('attendanceTableBody');
    attBody.innerHTML = "";
    students.forEach(s => {
        let checkboxes = "";
        for (let i = 0; i < 5; i++) {
            const checked = s.attendance[i] === 1 ? "checked" : "";
            checkboxes += <td><input type="checkbox" ${checked} onchange="toggleAttendance('${s.id}', ${i})"></td>;
        }
        attBody.innerHTML += `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                ${checkboxes}
                <td><input type="text" class="remark-input" value="${s.remarks}" placeholder="Add excuse..." onchange="updateRemarks('${s.id}', this.value)"></td>
            </tr>
        `;
    });

    // 4. Render Register/Student List Table
    const listBody = document.getElementById('studentListBody');
    listBody.innerHTML = "";
    students.forEach(s => {
        listBody.innerHTML += `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.score}</td>
                <td><button class="btn-delete" onclick="deleteStudent('${s.id}')">Remove</button></td>
            </tr>
        `;
    });

    // 5. Render Rankings Table
    const rankBody = document.getElementById('rankingTableBody');
    rankBody.innerHTML = "";
    rankedStudents.forEach((s, index) => {
        const present = getTotalPresent(s.attendance);
        const totalPts = getTotalPoints(s);
        rankBody.innerHTML += `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${present} / 5</td>
                <td>${s.score}</td>
                <td><strong>${totalPts}</strong></td>
            </tr>
        `;
    });
}

// Initial Load
renderAll();
/* =====================================
   ATTENDLY STUDENT MANAGEMENT SYSTEM
===================================== */

// STORAGE
const STUDENT_KEY = "attendly_v2_students";
const ATTENDANCE_KEY = "attendly_v2_attendance";
const ACTIVITY_KEY = "attendly_v2_activities";

const $ = id => document.getElementById(id);

// DEFAULT STUDENTS
let students = JSON.parse(localStorage.getItem(STUDENT_KEY)) || [
    { id: "2026-001", name: "Lloyd" },
    { id: "2026-002", name: "Jeston" },
    { id: "2026-003", name: "Jefferson" },
    { id: "2026-004", name: "King" },
    { id: "2026-005", name: "Reymond" }
];

let records = JSON.parse(
    localStorage.getItem(ATTENDANCE_KEY)
) || {};

let activities = JSON.parse(
    localStorage.getItem(ACTIVITY_KEY)
) || [];

// SAVE DATA
function saveData() {

    localStorage.setItem(
        STUDENT_KEY,
        JSON.stringify(students)
    );

    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify(records)
    );

    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(activities)
    );

}

// LOCAL DATE
function today() {

    const date = new Date();

    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .split("T")[0];

}

function selectedDate() {
    return $("attendanceDate").value || today();
}

// ESCAPE HTML
function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);

}

// ATTENDANCE RECORD
function getRecord(date) {

    if (!records[date]) {
        records[date] = {};
    }

    return records[date];

}

function getStatus(id, date = selectedDate()) {

    return getRecord(date)[id]?.status || "Absent";

}

function getRemark(id, date = selectedDate()) {

    return getRecord(date)[id]?.remark || "";

}

/* =====================================
   LOGIN SYSTEM
===================================== */

$("loginForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const username = $("username").value.trim();
    const password = $("password").value;

    if (username === "admin" && password === "1234") {

        $("loginError").textContent = "";

        $("loginPage").classList.add("hidden");

        $("mainSystem").classList.remove("hidden");

        $("attendanceDate").value = today();

        renderAll();

    } else {

        $("loginError").textContent =
            "Incorrect username or password!";

    }

});

/* =====================================
   LOGOUT
===================================== */

$("logoutBtn").addEventListener("click", function() {

    $("mainSystem").classList.add("hidden");

    $("loginPage").classList.remove("hidden");

    $("username").value = "";

    $("password").value = "";

});

/* =====================================
   PAGE NAVIGATION
===================================== */

const pageTitles = {
    dashboard: "Dashboard",
    attendance: "Attendance",
    activities: "Student Activities",
    students: "List Students",
    ranking: "Rankings"
};

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", function() {

        const page = this.dataset.page;

        document.querySelectorAll(".nav-btn")
            .forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        document.querySelectorAll(".page")
            .forEach(section => section.classList.remove("active"));

        $(page).classList.add("active");

        $("pageTitle").textContent = pageTitles[page];

        renderAll();

    });

});

/* =====================================
   ATTENDANCE MANAGEMENT
===================================== */

function renderAttendance() {

    const search = $("attendanceSearch").value.toLowerCase();

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(search) ||
        student.id.toLowerCase().includes(search)
    );

    $("attendanceTable").innerHTML = filtered.map(student => {

        const status = getStatus(student.id);

        return `
            <tr>

                <td>${escapeHTML(student.id)}</td>

                <td>${escapeHTML(student.name)}</td>

                <td>
                    <select data-status="${escapeHTML(student.id)}">

                        <option value="Present"
                            ${status === "Present" ? "selected" : ""}>
                            Present
                        </option>

                        <option value="Absent"
                            ${status === "Absent" ? "selected" : ""}>
                            Absent
                        </option>

                    </select>
                </td>

                <td>
                    <input
                        type="text"
                        placeholder="Enter remarks"
                        value="${escapeHTML(getRemark(student.id))}"
                        data-remark="${escapeHTML(student.id)}"
                    >
                </td>

            </tr>
        `;

    }).join("");

}

// CHANGE ATTENDANCE STATUS
$("attendanceTable").addEventListener("change", function(event) {

    const select = event.target.closest("[data-status]");

    if (!select) return;

    const id = select.dataset.status;
    const current = getRecord(selectedDate())[id] || {};

    getRecord(selectedDate())[id] = {
        status: select.value,
        remark: current.remark || ""
    };

    saveData();

    renderAll();

});

// SAVE REMARKS
$("attendanceTable").addEventListener("change", function(event) {

    const input = event.target.closest("[data-remark]");

    if (!input) return;

    const id = input.dataset.remark;
    const current = getRecord(selectedDate())[id] || {};

    getRecord(selectedDate())[id] = {
        status: current.status || "Absent",
        remark: input.value
    };

    saveData();

});

$("attendanceSearch").addEventListener("input", renderAttendance);

$("attendanceDate").addEventListener("change", renderAll);

/* =====================================
   STUDENT MANAGEMENT
===================================== */

// ADD STUDENT MODAL
$("openModal").addEventListener("click", function() {

    $("studentModal").classList.remove("hidden");

});

$("closeModal").addEventListener("click", function() {

    $("studentModal").classList.add("hidden");

});

// SAVE STUDENT
$("studentForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const id = $("newID").value.trim();
    const name = $("newName").value.trim();

    if (!id || !name) return;

    const exists = students.some(student =>
        student.id.toLowerCase() === id.toLowerCase()
    );

    if (exists) {

        alert("Student ID already exists!");

        return;

    }

    students.push({
        id: id,
        name: name
    });

    saveData();

    $("studentForm").reset();

    $("studentModal").classList.add("hidden");

    renderAll();

    alert("Student successfully added!");

});

// DAYS PRESENT
function getDaysPresent(id) {

    let total = 0;

    Object.values(records).forEach(day => {

        if (day[id]?.status === "Present") {
            total++;
        }

    });

    return total;

}

// ATTENDANCE RATE
function getAttendanceRate(id) {

    const dates = Object.keys(records);

    if (dates.length === 0) return 0;

    return Math.round(
        (getDaysPresent(id) / dates.length) * 100
    );

}

// STUDENT TABLE
function renderStudents() {

    const search = $("studentSearch").value.toLowerCase();

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(search) ||
        student.id.toLowerCase().includes(search)
    );

    $("studentTable").innerHTML = filtered.map(student => {

        return `
            <tr>

                <td>${escapeHTML(student.id)}</td>

                <td>${escapeHTML(student.name)}</td>

                <td>${getDaysPresent(student.id)}</td>

                <td>${getAttendanceRate(student.id)}%</td>

                <td>
                    <button class="delete-btn"
                        data-delete="${escapeHTML(student.id)}">
                        Delete
                    </button>
                </td>

            </tr>
        `;

    }).join("");

}

// DELETE STUDENT
$("studentTable").addEventListener("click", function(event) {

    const button = event.target.closest("[data-delete]");

    if (!button) return;

    const id = button.dataset.delete;

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    students = students.filter(student => student.id !== id);

    Object.values(records).forEach(day => {
        delete day[id];
    });

    activities = activities.filter(
        activity => activity.studentID !== id
    );

    saveData();

    renderAll();

});

$("studentSearch").addEventListener("input", renderStudents);

/* =====================================
   ACTIVITIES MANAGEMENT
===================================== */

// LOAD STUDENTS TO DROPDOWN
function loadActivityStudents() {

    const select = $("activityStudent");

    const current = select.value;

    select.innerHTML = `
        <option value="">Select Student</option>
    `;

    students.forEach(student => {

        const option = document.createElement("option");

        option.value = student.id;

        option.textContent = student.name;

        select.appendChild(option);

    });

    if (students.some(student => student.id === current)) {
        select.value = current;
    }

}

// ADD ACTIVITY
$("activityForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const studentID = $("activityStudent").value;

    const activityName = $("activityName").value.trim();

    const score = Number($("activityScore").value);

    const total = Number($("activityTotal").value);

    if (!studentID || !activityName) {

        alert("Please complete all fields!");

        return;

    }

    if (
        !Number.isFinite(score) ||
        !Number.isFinite(total) ||
        total <= 0 ||
        score < 0 ||
        score > total
    ) {

        alert("Invalid score! Please check your inputs.");

        return;

    }

    const student = students.find(
        item => item.id === studentID
    );

    if (!student) {

        alert("Student not found!");

        return;

    }

    const newActivity = {

        id: Date.now() + Math.random(),

        studentID: studentID,

        studentName: student.name,

        activityName: activityName,

        score: score,

        total: total,

        percentage: Math.round((score / total) * 100),

        date: today()

    };

    activities.push(newActivity);

    saveData();

    $("activityForm").reset();

    renderAll();

    alert("Activity successfully saved!");

});

// DISPLAY ACTIVITIES
function renderActivities() {

    const search = $("activitySearch").value.toLowerCase();

    const filtered = activities.filter(activity =>
        activity.studentName.toLowerCase().includes(search) ||
        activity.activityName.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {

        $("activityTable").innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No activity records found.
                </td>
            </tr>
        `;

        return;

    }

    $("activityTable").innerHTML = filtered.slice().reverse().map(activity => {

        return `
            <tr>

                <td>${escapeHTML(activity.studentName)}</td>

                <td>${escapeHTML(activity.activityName)}</td>

                <td>
                    <strong>${activity.score} / ${activity.total}</strong>
                </td>

                <td>
                    <span class="activity-percentage">
                        ${activity.percentage}%
                    </span>
                </td>

                <td>${escapeHTML(activity.date)}</td>

                <td>
                    <button class="delete-activity"
                        data-activity-delete="${activity.id}">
                        Delete
                    </button>
                </td>

            </tr>
        `;

    }).join("");

}

// DELETE ACTIVITY
$("activityTable").addEventListener("click", function(event) {

    const button = event.target.closest("[data-activity-delete]");

    if (!button) return;

    const id = Number(button.dataset.activityDelete);

    if (!confirm("Delete this activity record?")) return;

    activities = activities.filter(
        activity => activity.id !== id
    );

    saveData();

    renderAll();

});

// ACTIVITY SEARCH
$("activitySearch").addEventListener("input", renderActivities);

/* =====================================
   STUDENT PERFORMANCE AND RANKING
===================================== */

// ACTIVITY AVERAGE
function getActivityAverage(id) {

    const studentActivities = activities.filter(
        activity => activity.studentID === id
    );

    if (studentActivities.length === 0) return 0;

    const total = studentActivities.reduce(
        (sum, activity) => sum + activity.percentage,
        0
    );

    return Math.round(total / studentActivities.length);

}

// OVERALL PERFORMANCE
function getOverallScore(id) {

    const attendance = getAttendanceRate(id);

    const activityList = activities.filter(
        activity => activity.studentID === id
    );

    // If there are no activities, use attendance only.
    if (activityList.length === 0) {
        return attendance;
    }

    const activityAverage = getActivityAverage(id);

    return Math.round((attendance + activityAverage) / 2);

}

// RANKING TABLE
function renderRanking() {

    const ranked = [...students].sort((a, b) => {

        return getOverallScore(b.id) - getOverallScore(a.id);

    });

    if (ranked.length === 0) {

        $("topStudent").textContent = "No student yet";

        $("topRate").textContent = "No records available";

        $("rankingTable").innerHTML = "";

        return;

    }

    const top = ranked[0];

    $("topStudent").textContent = top.name;

    $("topRate").textContent =
        "Overall Performance: " + getOverallScore(top.id) + "%";

    $("rankingTable").innerHTML = ranked.map((student, index) => {

        return `
            <tr>

                <td><strong>#${index + 1}</strong></td>

                <td>${escapeHTML(student.name)}</td>

                <td>${getAttendanceRate(student.id)}%</td>

                <td>${getActivityAverage(student.id)}%</td>

                <td>
                    <strong>${getOverallScore(student.id)}%</strong>
                </td>

            </tr>
        `;

    }).join("");

}

/* =====================================
   DASHBOARD
===================================== */

function renderDashboard() {

    const dailyRecord = getRecord(today());

    const present = students.filter(student =>
        dailyRecord[student.id]?.status === "Present"
    ).length;

    const absent = students.length - present;

    const rate = students.length
        ? Math.round((present / students.length) * 100)
        : 0;

    $("totalStudents").textContent = students.length;

    $("presentStudents").textContent = present;

    $("absentStudents").textContent = absent;

    $("attendanceRate").textContent = rate + "%";

    // ATTENDANCE LIST
    $("dashboardList").innerHTML = students.length
        ? students.slice(0, 5).map(student => {

            const status = getStatus(student.id, today());

            return `
                <div class="dashboard-row">

                    <strong>${escapeHTML(student.name)}</strong>

                    <span class="${status.toLowerCase()}">
                        ${status}
                    </span>

                </div>
            `;

        }).join("")
        : "<p>No students registered.</p>";

    // RECENT ACTIVITIES
    const recent = activities.slice(-5).reverse();

    $("recentActivities").innerHTML = recent.length
        ? recent.map(activity => `
            <div class="dashboard-row">

                <strong>
                    ${escapeHTML(activity.studentName)}
                </strong>

                <span>
                    ${escapeHTML(activity.activityName)}
                    - ${activity.percentage}%
                </span>

            </div>
        `).join("")
        : "<p>No activities recorded yet.</p>";

}

/* =====================================
   RENDER ALL
===================================== */

function renderAll() {

    renderDashboard();

    renderAttendance();

    renderStudents();

    loadActivityStudents();

    renderActivities();

    renderRanking();

}

/* =====================================
   INITIAL SETUP
===================================== */

$("attendanceDate").value = today();

saveData();

renderAll();
* CLASSFLOW — application logic */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "classflow_next_data_v1";
  const AUTH_KEY = "classflow_next_auth_v1";
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = (prefix) => ${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)};

  function readStorage(key) {
    try { const v = localStorage.getItem(key); if (v !== null) return v; } catch (_) {}
    try { return sessionStorage.getItem(key); } catch (_) { return null; }
  }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (_) {}
    try { sessionStorage.setItem(key, value); return true; } catch (_) {}
    return false;
  }
  function removeStorage(key) {
    try { localStorage.removeItem(key); } catch (_) {}
    try { sessionStorage.removeItem(key); } catch (_) {}
  }
  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[ch]);
  }
  function initials(name) {
    return String(name || "").trim().split(/\s+/).slice(0,2).map(x => x[0] || "").join("").toUpperCase();
  }
  function seedData() {
    const names = ["Lloyd", "Jeston", "Jefferson", "King", "Reymond", "Aaron"];
    return {
      students: names.map((name, i) => ({
        id: seed_${i+1}, name, code: STU-${String(i+1).padStart(3,"0")},
        email: "", status: "Active", createdAt: Date.now() - (names.length-i)*1000
      })),
      activities: [], grades: [], attendance: {}
    };
  }
  function normalizeData(raw) {
    if (!raw || typeof raw !== "object") return seedData();
    return {
      students: Array.isArray(raw.students) ? raw.students : [],
      activities: Array.isArray(raw.activities) ? raw.activities : [],
      grades: Array.isArray(raw.grades) ? raw.grades : [],
      attendance: raw.attendance && typeof raw.attendance === "object" ? raw.attendance : {}
    };
  }

  let data;
  try { data = normalizeData(JSON.parse(readStorage(STORAGE_KEY) || "null")); }
  catch (_) { data = seedData(); }
  let toastTimer = null;
  let activePage = "overview";

  // Start with sign-in visible unless a saved session exists.
  const hasSession = readStorage(AUTH_KEY) === "yes";
  $("app").classList.toggle("hidden", !hasSession);
  $("loginOverlay").classList.toggle("hidden", hasSession);

  function save() {
    const ok = writeStorage(STORAGE_KEY, JSON.stringify(data));
    if (!ok) toast("Browser storage is unavailable. Changes may not persist after closing this tab.", true);
  }
  function toast(message, warning = false) {
    const el = $("toast");
    el.textContent = message;
    el.style.background = warning ? "#9b4c42" : "";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
  }
  function studentById(id) { return data.students.find(s => s.id === id); }
  function statusPill(status) {
    const inactive = status === "Inactive";
    return <span class="status-pill${inactive ? " inactive" : ""}">${safe(status || "Active")}</span>;
  }
  function studentCell(s) {
    return <div class="student-cell"><span class="student-avatar">${safe(initials(s.name))}</span><span>${safe(s.name)}</span></div>;
  }
  function showPage(page) {
    if (!document.getElementById(page-${page})) return;
    activePage = page;
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === page-${page}));
    document.querySelectorAll(".nav-link[data-page]").forEach(b => b.classList.toggle("active", b.dataset.page === page));
    $("pageTitle").textContent = ({overview:"Overview",students:"Students",activities:"Activities",grades:"Grades",attendance:"Attendance",rankings:"Rankings"})[page] || "Overview";
    $("sidebar").classList.remove("open");
    if (page === "attendance") renderAttendance();
    if (page === "rankings") renderRankings();
  }
  function openStudentModal(student = null) {
    const form = $("studentForm");
    form.reset();
    form.elements.id.value = student?.id || "";
    form.elements.name.value = student?.name || "";
    form.elements.code.value = student?.code || "";
    form.elements.email.value = student?.email || "";
    form.elements.status.value = student?.status || "Active";
    $("studentModalTitle").textContent = student ? "Edit student" : "Add a student";
    $("studentModal").classList.remove("hidden");
    setTimeout(() => form.elements.name.focus(), 40);
  }
  function closeStudentModal() { $("studentModal").classList.add("hidden"); }

  function renderOverview() {
    $("statStudents").textContent = data.students.length;
    $("statActivities").textContent = data.activities.length;
    $("statGrades").textContent = data.grades.length;
    $("studentNavCount").textContent = data.students.length;
    const day = data.attendance[today()] || {};
    const present = data.students.filter(s => day[s.id]?.status === "Present").length;
    const marked = data.students.filter(s => day[s.id]?.status).length;
    $("statAttendance").textContent = marked ? ${Math.round(present / Math.max(1, marked) * 100)}% : "—";
    $("attendanceSub").textContent = marked ? ${present} of ${marked} marked students present : "Attendance not recorded yet";

    const recent = [...data.students].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0,5);
    $("overviewStudents").innerHTML = recent.map(s => <tr><td>${studentCell(s)}</td><td>${safe(s.code)}</td><td>${statusPill(s.status)}</td></tr>).join("");
    $("overviewStudentsEmpty").classList.toggle("hidden", recent.length > 0);

    const events = [
      ...data.activities.map(a => ({date:a.createdAt || 0, icon:"▤", title:`Activity created: ${a.name}`, meta:`${a.subject} · ${a.type}`})),
      ...data.grades.map(g => ({date:g.createdAt || 0, icon:"▦", title:`Grade recorded: ${g.assessment}`, meta:`${studentById(g.studentId)?.name || "Student"} · ${g.score}/${g.total}`})),
      ...data.students.filter(s => !String(s.id).startsWith("seed_")).map(s => ({date:s.createdAt || 0, icon:"♙", title:`Student added: ${s.name}`, meta:s.code}))
    ].sort((a,b) => b.date - a.date).slice(0,5);
    $("overviewActivity").innerHTML = events.map(e => <div class="feed-item"><span class="feed-icon">${e.icon}</span><div><strong>${safe(e.title)}</strong><small>${safe(e.meta)}</small></div></div>).join("");
    $("overviewActivityEmpty").classList.toggle("hidden", events.length > 0);
  }

  function renderStudents() {
    const query = $("studentSearch").value.trim().toLowerCase();
    const list = data.students.filter(s => ${s.name} ${s.code} ${s.email}.toLowerCase().includes(query));
    $("studentResultCount").textContent = ${list.length} student${list.length === 1 ? "" : "s"};
    $("studentsTable").innerHTML = list.map(s => `<tr>
      <td>${studentCell(s)}</td><td>${safe(s.code)}</td><td>${safe(s.email || "—")}</td>
      <td>${statusPill(s.status)}</td><td><div class="action-group">
      <button class="small-action" data-edit-student="${safe(s.id)}">Edit</button>
      <button class="small-action delete" data-delete-student="${safe(s.id)}">Delete</button>
      </div></td></tr>`).join("");
    $("studentsEmpty").classList.toggle("hidden", list.length > 0);
    $("studentNavCount").textContent = data.students.length;
    const select = $("gradeStudent");
    const current = select.value;
    select.innerHTML = data.students.map(s => <option value="${safe(s.id)}">${safe(s.name)}</option>).join("");
    if (data.students.some(s => s.id === current)) select.value = current;
    select.disabled = data.students.length === 0;
  }

  function renderActivities() {
    const items = [...data.activities].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    $("activityCount").textContent = items.length;
    $("activityList").innerHTML = items.map(a => `<div class="stack-item">
      <div><strong>${safe(a.name)}</strong><small>${safe(a.subject)} · Due ${safe(a.date)} · ${a.total} pts</small></div>
      <div class="stack-meta"><span class="type-tag">${safe(a.type)}</span><button class="small-action delete" data-delete-activity="${safe(a.id)}" aria-label="Delete ${safe(a.name)}">×</button></div>
    </div>`).join("");
    $("activitiesEmpty").classList.toggle("hidden", items.length > 0);
  }

  function renderGrades() {
    const items = [...data.grades].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    $("gradeCount").textContent = items.length;
    $("gradesTable").innerHTML = items.map(g => {
      const pct = g.total > 0 ? g.score / g.total * 100 : 0;
      return `<tr><td><strong>${safe(studentById(g.studentId)?.name || "Deleted student")}</strong><br><span class="muted-cell">${safe(g.assessment)} · ${safe(g.subject)}</span></td>
      <td>${g.score}/${g.total}</td><td><span class="score-track"><span style="width:${Math.max(0,Math.min(100,pct))}%"></span></span><span class="score-value">${pct.toFixed(1)}%</span></td>
      <td><button class="small-action delete" data-delete-grade="${safe(g.id)}" aria-label="Delete grade">×</button></td></tr>`;
    }).join("");
    $("gradesEmpty").classList.toggle("hidden", items.length > 0);
  }

  function attendanceForDate() {
    const date = $("attendanceDate").value || today();
    if (!data.attendance[date]) data.attendance[date] = {};
    return data.attendance[date];
  }
  function renderAttendance() {
    const day = attendanceForDate();
    let present = 0, late = 0, absent = 0, unmarked = 0;
    data.students.forEach(s => {
      const status = day[s.id]?.status;
      if (status === "Present") present++;
      else if (status === "Late") late++;
      else if (status === "Absent") absent++;
      else unmarked++;
    });
    $("attendanceSummary").innerHTML = `
      <div class="attendance-metric"><small>PRESENT</small><strong>${present}</strong></div>
      <div class="attendance-metric"><small>LATE</small><strong>${late}</strong></div>
      <div class="attendance-metric"><small>ABSENT / UNMARKED</small><strong>${absent + unmarked}</strong></div>`;
    $("attendanceCount").textContent = ${data.students.length} students;
    $("attendanceTable").innerHTML = data.students.map(s => {
      const record = day[s.id] || {status:"",note:""};
      return `<tr><td>${studentCell(s)}</td><td><select class="attendance-select" data-attendance-status="${safe(s.id)}">
        <option value="" ${!record.status ? "selected" : ""}>Choose status</option>
        <option value="Present" ${record.status === "Present" ? "selected" : ""}>Present</option>
        <option value="Late" ${record.status === "Late" ? "selected" : ""}>Late</option>
        <option value="Absent" ${record.status === "Absent" ? "selected" : ""}>Absent</option>
      </select></td><td><input class="attendance-note" data-attendance-note="${safe(s.id)}" value="${safe(record.note || "")}" placeholder="Optional note"></td></tr>`;
    }).join("");
    $("attendanceEmpty").classList.toggle("hidden", data.students.length > 0);
  }

  function renderRankings() {
    const ranked = data.students.map(s => {
      const grades = data.grades.filter(g => g.studentId === s.id && Number(g.total) > 0);
      const avg = grades.length ? grades.reduce((sum,g) => sum + Number(g.score) / Number(g.total) * 100, 0) / grades.length : null;
      return {student:s, avg, count:grades.length};
    }).filter(x => x.avg !== null).sort((a,b) => b.avg - a.avg);
    $("rankingList").innerHTML = ranked.map((r,i) => `<div class="rank-row">
      <span class="rank-number">${String(i+1).padStart(2,"0")}</span>
      <div><div class="rank-name">${safe(r.student.name)}</div><div class="rank-sub">${r.count} grade record${r.count===1?"":"s"}</div></div>
      <div class="rank-track"><span style="width:${Math.max(0,Math.min(100,r.avg))}%"></span></div>
      <strong class="rank-score">${r.avg.toFixed(1)}%</strong>
    </div>`).join("");
    $("rankingsEmpty").classList.toggle("hidden", ranked.length > 0);
  }

  function renderAll() {
    renderOverview();
    renderStudents();
    renderActivities();
    renderGrades();
    renderAttendance();
    renderRankings();
  }

  $("studentForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.currentTarget;
    const id = form.elements.id.value;
    const name = form.elements.name.value.trim();
    if (!name) return;
    const record = {
      name,
      code: form.elements.code.value.trim() || STU-${String(data.students.length+1).padStart(3,"0")},
      email: form.elements.email.value.trim(),
      status: form.elements.status.value
    };
    if (id) {
      const existing = studentById(id);
      if (existing) Object.assign(existing, record);
      toast("Student profile updated.");
    } else {
      if (data.students.some(s => s.code.toLowerCase() === record.code.toLowerCase())) {
        toast("That student ID is already in use.", true); return;
      }
      data.students.push({id:uid("stu"), ...record, createdAt:Date.now()});
      toast("Student added to your roster.");
    }
    save(); closeStudentModal(); renderAll();
  });

  $("activityForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.currentTarget;
    const total = Number(f.elements.total.value);
    if (!Number.isFinite(total) || total <= 0) { toast("Enter a valid total point value.", true); return; }
    data.activities.push({
      id:uid("act"), name:f.elements.name.value.trim(), subject:f.elements.subject.value.trim(),
      type:f.elements.type.value, date:f.elements.date.value, total, createdAt:Date.now()
    });
    save(); f.reset(); f.elements.date.value = today(); f.elements.total.value = 100;
    renderAll(); toast("Activity created successfully.");
  });

  $("gradeForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.currentTarget;
    const score = Number(f.elements.score.value), total = Number(f.elements.total.value);
    if (!data.students.length) { toast("Add a student before recording grades.", true); return; }
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0 || score > total) {
      toast("Score must be between 0 and the total points.", true); return;
    }
    data.grades.push({
      id:uid("grd"), studentId:f.elements.studentId.value, assessment:f.elements.assessment.value.trim(),
      subject:f.elements.subject.value.trim(), period:f.elements.period.value,
      score, total, createdAt:Date.now()
    });
    save(); f.reset(); renderAll(); toast("Grade saved successfully.");
  });

  $("studentsTable").addEventListener("click", e => {
    const edit = e.target.closest("[data-edit-student]");
    const del = e.target.closest("[data-delete-student]");
    if (edit) openStudentModal(studentById(edit.dataset.editStudent));
    if (del) {
      const s = studentById(del.dataset.deleteStudent);
      if (!s || !confirm(Delete ${s.name} and their grade records?)) return;
      data.students = data.students.filter(x => x.id !== s.id);
      data.grades = data.grades.filter(g => g.studentId !== s.id);
      Object.values(data.attendance).forEach(day => { if (day && typeof day === "object") delete day[s.id]; });
      save(); renderAll(); toast("Student and related grade records deleted.");
    }
  });

  $("activityList").addEventListener("click", e => {
    const b = e.target.closest("[data-delete-activity]");
    if (!b) return;
    const a = data.activities.find(x => x.id === b.dataset.deleteActivity);
    if (!a || !confirm(Delete activity "${a.name}"?)) return;
    data.activities = data.activities.filter(x => x.id !== a.id);
    save(); renderAll(); toast("Activity deleted.");
  });

  $("gradesTable").addEventListener("click", e => {
    const b = e.target.closest("[data-delete-grade]");
    if (!b || !confirm("Delete this grade record?")) return;
    data.grades = data.grades.filter(x => x.id !== b.dataset.deleteGrade);
    save(); renderAll(); toast("Grade record deleted.");
  });

  $("attendanceTable").addEventListener("change", e => {
    const statusId = e.target.dataset.attendanceStatus;
    const noteId = e.target.dataset.attendanceNote;
    const id = statusId || noteId;
    if (!id) return;
    const day = attendanceForDate();
    if (!day[id]) day[id] = {status:"",note:""};
    if (statusId) day[id].status = e.target.value;
    if (noteId) day[id].note = e.target.value;
    save(); renderAttendance(); renderOverview();
  });

  $("studentSearch").addEventListener("input", renderStudents);
  $("globalSearch").addEventListener("input", e => {
    showPage("students");
    $("studentSearch").value = e.target.value;
    renderStudents();
  });

  document.addEventListener("click", e => {
    const nav = e.target.closest("[data-page]");
    const go = e.target.closest("[data-go]");
    const add = e.target.closest('[data-action="add-student"]');
    if (nav) showPage(nav.dataset.page);
    if (go) showPage(go.dataset.go);
    if (add) openStudentModal();
    if (e.target.closest("[data-close-modal]")) closeStudentModal();
  });
  $("quickAddButton").addEventListener("click", () => openStudentModal());
  $("addStudentButton").addEventListener("click", () => openStudentModal());
  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  $("attendanceDate").value = today();
  $("attendanceDate").addEventListener("change", renderAttendance);
  $("activityForm").elements.date.value = today();

  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    writeStorage("classflow_next_theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
  if (readStorage("classflow_next_theme") === "dark") document.body.classList.add("dark");

  $("exportButton").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = classflow-backup-${today()}.json;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast("Your ClassFlow backup has been exported.");
  });

  $("logoutButton").addEventListener("click", () => {
    if (!confirm("Log out of this ClassFlow workspace?")) return;
    removeStorage(AUTH_KEY);
    $("app").classList.add("hidden");
    $("loginOverlay").classList.remove("hidden");
    $("loginForm").reset();
  });
  $("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.currentTarget;
    if (f.elements.username.value.trim().toLowerCase() === "admin" && f.elements.password.value === "1234") {
      writeStorage(AUTH_KEY, "yes");
      $("loginError").textContent = "";
      $("loginOverlay").classList.add("hidden");
      $("app").classList.remove("hidden");
      toast("Welcome back, Administrator.");
    } else {
      $("loginError").textContent = "Incorrect username or password.";
    }
  });

  $("todayLabel").textContent = new Intl.DateTimeFormat(undefined, {weekday:"long", month:"long", day:"numeric", year:"numeric"}).format(new Date());
  renderAll();
})();
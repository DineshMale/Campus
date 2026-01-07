const users = {
  student: [
    { username: "1055", password: "student123" },
    { username: "1042", password: "student123" }
  ],
  faculty: [
    { username: "FAC_1", password: "faculty123" }
  ],
  hod: [
    { username: "HOD_1", password: "hod123" }
  ],
  admin: [
    { username: "ADMIN_1", password: "admin123" }
  ]
};

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  const validUser = users[role]?.find(
    u => u.username === username && u.password === password
  );

  if (!validUser) {
    error.innerText = "Invalid credentials";
    return;
  }

  localStorage.setItem("role", role);
  localStorage.setItem("username", username);

  if (role === "student") location.href = "student_dashboard.html";
  if (role === "faculty") location.href = "faculty_dashboard.html";
  if (role === "hod") location.href = "hod_dashboard.html";
  if (role === "admin") location.href = "admin_dashboard.html";
});

function RoleSelector({ setRole }) {
  return (
    <div style={{ padding: "40px" }}>
      <h2>Select Role</h2>

      <button onClick={() => setRole("student")}>Student</button><br /><br />
      <button onClick={() => setRole("faculty")}>Faculty</button><br /><br />
      <button onClick={() => setRole("hod")}>HOD</button><br /><br />
      <button onClick={() => setRole("admin")}>Admin</button>
    </div>
  );
}

export default RoleSelector;

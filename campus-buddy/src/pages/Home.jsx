import "../css/style.css";
import heroImg from "../assets/hero.jpg";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">CampusBuddy</span>
        </div>

        <div className="nav-actions">
          <a href="#about" className="nav-link">About</a>
          <span
            className="login-link"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="tag">✨ AI-POWERED CAMPUS MANAGEMENT</p>
          <h1>The AI Brain for Your Campus</h1>
          <p className="subtitle">
            Automate attendance tracking, marks entry, leave approvals,
            and exam seating with intelligent AI agents.
            Save hours of manual work every single day.
          </p>
          <button
            className="primary-btn"
            onClick={() => navigate("/login")}
          >
            Get Started →
          </button>
        </div>

        <div className="hero-right">
          <img src={heroImg} alt="Campus" />
        </div>
      </section>

      {/* AGENTS */}
      <section className="agents" id="about">
        <h2>Four Intelligent Agents</h2>
        <p className="agents-sub">
          Each agent is specialized to handle specific campus management
          tasks with precision and speed.
        </p>

        <div className="agent-grid">
          <div className="agent-card">
            <div className="icon blue">📷</div>
            <h3>Vision Agent</h3>
            <p>AI-powered attendance tracking via classroom photos</p>
          </div>

          <div className="agent-card">
            <div className="icon green">👤</div>
            <h3>Leave Agent</h3>
            <p>Automated leave application and approval workflow</p>
          </div>

          <div className="agent-card">
            <div className="icon orange">📄</div>
            <h3>Marks Agent</h3>
            <p>OCR-based marks extraction from sheets</p>
          </div>

          <div className="agent-card">
            <div className="icon purple">⬜</div>
            <h3>Seating Agent</h3>
            <p>Intelligent exam seating arrangement generator</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Transform Your Campus?</h2>
        <p>
          Join hundreds of institutions already using CampusBuddy
          to save time and improve efficiency.
        </p>
        <button className="cta-btn">Start Free Trial →</button>
      </section>
    </>
  );
}
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Shield,
  Monitor,
  Smartphone,
  Link2,
  FileCheck,
  Wifi,
  BrainCircuit,
  Play,
  Send,
  LockKeyhole,
  Upload,
  Menu,
  X,
  CheckCircle,
  Sparkles
} from "lucide-react";

import "./style.css";

const API = "http://localhost:3000/api";

const features = [
  {
    icon: Link2,
    title: "LINK SHIELD",
    text: "Helps users identify suspicious, phishing and potentially dangerous links."
  },
  {
    icon: FileCheck,
    title: "FILE SHIELD",
    text: "Security-focused file analysis designed to help detect suspicious files."
  },
  {
    icon: Wifi,
    title: "NETWORK SHIELD",
    text: "Security awareness and protection around potentially unsafe network connections."
  },
  {
    icon: BrainCircuit,
    title: "CYBERGUARD AI",
    text: "An AI security assistant designed to explain cyber threats and safer actions."
  },
  {
    icon: Monitor,
    title: "WINDOWS",
    text: "Dedicated CYBERGUARD protection for Windows computers."
  },
  {
    icon: Smartphone,
    title: "MOBILE",
    text: "Dedicated mobile security experience planned for supported mobile platforms."
  }
];

function App() {
  const [content, setContent] = useState({
    announcement: "COMING SOON",
    video_url: ""
  });

  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [ownerOpen, setOwnerOpen] = useState(false);
  const [ownerPin, setOwnerPin] = useState("");
  const [token, setToken] = useState(
    localStorage.getItem("cyberguard_owner_token") || ""
  );

  const [announcement, setAnnouncement] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [ownerMessage, setOwnerMessage] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  async function loadContent() {
    try {
      const response = await fetch(`${API}/content`);
      const data = await response.json();

      setContent(data);
      setAnnouncement(data.announcement || "");
      setVideoUrl(data.video_url || "");
    } catch {
      console.log("Backend unavailable");
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  async function ownerLogin(event) {
    event.preventDefault();

    setOwnerMessage("Checking owner PIN...");

    try {
      const response = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pin: ownerPin
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setOwnerMessage(
          data.error || `Login failed (${response.status})`
        );
        return;
      }

      if (!data.token) {
        setOwnerMessage(
          "Login failed: server did not return a token."
        );
        return;
      }

      localStorage.setItem(
        "cyberguard_owner_token",
        data.token
      );

      setToken(data.token);
      setOwnerMessage("Owner control activated.");
      setOwnerPin("");

    } catch (error) {
      console.error(error);

      setOwnerMessage(
        "Cannot connect to CYBERGUARD server."
      );
    }
  }

  async function saveContent(event) {
    event.preventDefault();

    const formData = new FormData();

    formData.append(
      "announcement",
      announcement
    );

    formData.append(
      "video_url",
      videoUrl
    );

    if (videoFile) {
      formData.append(
        "video",
        videoFile
      );
    }

    const response = await fetch(
      `${API}/admin/content`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem(
        "cyberguard_owner_token"
      );

      setToken("");
      setOwnerMessage("Owner session expired.");
      return;
    }

    setOwnerMessage(
      data.message || data.error
    );

    await loadContent();
  }

  async function submitFeedback(event) {
    event.preventDefault();

    const response = await fetch(
      `${API}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          message: feedback
        })
      }
    );

    const data = await response.json();

    setFeedbackMessage(
      data.message || data.error
    );

    if (response.ok) {
      setFeedback("");
      setEmail("");
    }
  }

  function logoutOwner() {
    localStorage.removeItem(
      "cyberguard_owner_token"
    );

    setToken("");
    setOwnerMessage("Owner logged out.");
  }

  return (
    <div className="site">

      <nav className="navbar">

        <div className="logo">
          <Shield />
          <span>
            CYBER<span className="green">GUARD</span>
          </span>
        </div>

        <button
          className="mobile-menu"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <div
          className={
            menuOpen
              ? "nav-links open"
              : "nav-links"
          }
        >
          <a href="#features">Protection</a>
          <a href="#difference">Why CYBERGUARD</a>
          <a href="#ai">AI</a>
          <a href="#video">Video</a>
          <a href="#feedback">Feedback</a>

          <button
       	    type="button"
            className="owner-button"
            onClick={() => {
              setOwnerOpen((current) => !current);

              setTimeout(() => {
                document
                  .querySelector(".owner-panel")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                  });
              }, 100);
             }}
           >
            <LockKeyhole size={16} />
            Owner
          </button>
        </div>

      </nav>

      <section className="hero">

        <div className="hero-grid" />

        <div className="hero-content">

          <div className="status-pill">
            <span /> NEXT-GENERATION CYBERSECURITY
          </div>

          <h1>
            DEFEND.
            <br />
            <span>DETECT.</span>
            <br />
            RESPOND.
          </h1>

          <p>
            CYBERGUARD is a next-generation cybersecurity
            platform designed to help protect people,
            devices, files, links and networks.
          </p>

          <div className="hero-buttons">

            <a
              href="#video"
              className="button primary"
            >
              <Play size={18} />
              WATCH PREVIEW
            </a>

            <a
              href="#feedback"
              className="button secondary"
            >
              JOIN THE LAUNCH
            </a>

          </div>

        </div>

        <div className="security-core">

          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />

          <div className="core">

            <Shield size={85} />

            <span>
              PROTECTED
            </span>

          </div>

        </div>

      </section>

      <div className="announcement">

        <Sparkles size={18} />

        <strong>
          {content.announcement || "COMING SOON"}
        </strong>

        <span>
          CYBERGUARD is preparing for launch.
        </span>

      </div>

      <section id="features">

        <div className="section-label">
          ONE SECURITY PLATFORM
        </div>

        <h2>
          Protection designed around
          real-world digital threats.
        </h2>

        <div className="feature-grid">

          {features.map(
            ({
              icon: Icon,
              title,
              text
            }) => (

              <article
                className="feature-card"
                key={title}
              >

                <div className="feature-icon">
                  <Icon />
                </div>

                <h3>
                  {title}
                </h3>

                <p>
                  {text}
                </p>

                <CheckCircle
                  className="feature-check"
                  size={18}
                />

              </article>

            )
          )}

        </div>

      </section>

      <section
        id="difference"
        className="difference"
      >

        <div>

          <div className="section-label">
            WHY CYBERGUARD
          </div>

          <h2>
            More than a traditional
            antivirus experience.
          </h2>

          <p>
            CYBERGUARD is being designed around
            multiple security surfaces instead of
            relying on a single protection layer.
          </p>

        </div>

        <div className="comparison">

          <div className="comparison-card">

            <h3>
              Traditional approach
            </h3>

            <p>
              Primarily focused on detecting
              malicious software.
            </p>

          </div>

          <div className="comparison-card highlighted">

            <h3>
              CYBERGUARD approach
            </h3>

            <p>
              Links, files, network safety,
              device protection and security
              education brought together.
            </p>

          </div>

        </div>

      </section>

      <section
        id="ai"
        className="ai-section"
      >

        <div className="ai-icon">
          <BrainCircuit size={48} />
        </div>

        <div>

          <div className="section-label">
            CYBERGUARD AI
          </div>

          <h2>
            Ask your security questions.
          </h2>

          <p>
            The CYBERGUARD AI assistant is
            designed to explain phishing,
            malware, suspicious messages,
            account security, Wi-Fi risks
            and other cybersecurity topics
            in understandable language.
          </p>

          <div className="ai-badge">
            AI SECURITY ASSISTANT Â· COMING SOON
          </div>

        </div>

      </section>

      <section id="video">

        <div className="section-label">
          PROMOTIONAL VIDEO
        </div>

        <h2>
          Experience CYBERGUARD.
        </h2>

        {content.video_url ? (

          <video
            className="promo-video"
            controls
            playsInline
            src={content.video_url}
          />

        ) : (

          <div className="video-placeholder">

            <Play size={60} />

            <h3>
              COMING SOON
            </h3>

            <p>
              The official CYBERGUARD
              promotional video will appear here.
            </p>

          </div>

        )}

      </section>

      <section
        id="feedback"
        className="feedback-section"
      >

        <div>

          <div className="section-label">
            USER FEEDBACK
          </div>

          <h2>
            Help shape CYBERGUARD.
          </h2>

          <p>
            Tell us what you want to see in
            the next generation of cybersecurity.
          </p>

        </div>

        <form
          className="feedback-form"
          onSubmit={submitFeedback}
        >

          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <textarea
            required
            placeholder="Your feedback..."
            value={feedback}
            onChange={(event) =>
              setFeedback(event.target.value)
            }
          />

          <button
            className="button primary"
          >
            <Send size={17} />
            SEND FEEDBACK
          </button>

          {feedbackMessage && (
            <p className="form-message">
              {feedbackMessage}
            </p>
          )}

        </form>

      </section>

      {ownerOpen && (

        <section className="owner-panel">

          <div className="section-label">
            PRIVATE OWNER CONTROL
          </div>

          <h2>
            CYBERGUARD Website Control
          </h2>

          {!token ? (

            <form
              className="owner-form"
              onSubmit={ownerLogin}
            >

              <input
                type="password"
                placeholder="Owner PIN"
                value={ownerPin}
                onChange={(event) =>
                  setOwnerPin(
                    event.target.value
                  )
                }
              />

              <button className="button primary">
                <LockKeyhole size={17} />
                UNLOCK CONTROL
              </button>

            </form>

          ) : (

            <form
              className="owner-form"
              onSubmit={saveContent}
            >

              <label>
                Announcement

                <input
                  value={announcement}
                  onChange={(event) =>
                    setAnnouncement(
                      event.target.value
                    )
                  }
                />

              </label>

              <label>
                Video URL

                <input
                  value={videoUrl}
                  onChange={(event) =>
                    setVideoUrl(
                      event.target.value
                    )
                  }
                  placeholder="Optional video URL"
                />

              </label>

              <label>
                Upload promotional video

                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) =>
                    setVideoFile(
                      event.target.files[0]
                    )
                  }
                />

              </label>

              <div className="owner-actions">

                <button
                  className="button primary"
                  type="submit"
                >
                  <Upload size={17} />
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  className="button secondary"
                  onClick={logoutOwner}
                >
                  LOG OUT
                </button>

              </div>

              {ownerMessage && (
                <p className="form-message">
                  {ownerMessage}
                </p>
              )}

            </form>

          )}

        </section>

      )}

      <footer>

        <div className="footer-logo">
          <Shield size={22} />
          CYBERGUARD
        </div>

        <span>
          Â© 2026 CYBERGUARD Â· COMING SOON
        </span>

      </footer>

    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <App />
);


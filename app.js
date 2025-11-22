// ===============================
// SIMPLE AUTH + 2FA
// ===============================

let currentUser = null;
let generatedCode = null;

const authSection = document.getElementById("auth-section");
const twofaSection = document.getElementById("twofa-section");
const appSection = document.getElementById("app-section");

const loginBtn = document.getElementById("login-btn");
const sendCodeBtn = document.getElementById("send-code-btn");
const verifyCodeBtn = document.getElementById("verify-code-btn");

const demoCodeEl = document.getElementById("demo-code");
const codeInput = document.getElementById("code-input");
const twofaMessage = document.getElementById("twofa-message");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  currentUser = { email };
  authSection.classList.add("hidden");
  twofaSection.classList.remove("hidden");
});

sendCodeBtn.addEventListener("click", () => {
  generatedCode = String(Math.floor(100000 + Math.random() * 900000));
  demoCodeEl.textContent = "Demo code (for prototype only): " + generatedCode;
  twofaMessage.textContent = "";
  twofaMessage.className = "status-message";
});

verifyCodeBtn.addEventListener("click", () => {
  const entered = codeInput.value.trim();

  if (!generatedCode) {
    twofaMessage.textContent = "Generate a code first.";
    twofaMessage.className = "status-message error";
    return;
  }

  if (entered === generatedCode) {
    twofaMessage.textContent = "Code verified.";
    twofaMessage.className = "status-message success";

    setTimeout(() => {
      twofaSection.classList.add("hidden");
      appSection.classList.remove("hidden");
    }, 700);
  } else {
    twofaMessage.textContent = "Incorrect code.";
    twofaMessage.className = "status-message error";
  }
});

// ===============================
// TABS
// ===============================

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");

    tabButtons.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => {
      c.classList.add("hidden");
      c.classList.remove("active");
    });

    btn.classList.add("active");
    const target = document.getElementById(targetId);
    target.classList.remove("hidden");
    target.classList.add("active");
  });
});

// ===============================
// SAVED RESPONSES (localStorage)
// ===============================

let savedResponses = [];

function loadSavedResponses() {
  try {
    const raw = localStorage.getItem("savedResponses");
    savedResponses = raw ? JSON.parse(raw) : [];
  } catch {
    savedResponses = [];
  }
  renderSavedResponses();
}

function persistSavedResponses() {
  localStorage.setItem("savedResponses", JSON.stringify(savedResponses));
}

function addSavedResponse(tool, inputText, outputText) {
  if (!outputText || !outputText.trim()) return;

  const item = {
    id: Date.now(),
    tool, // "resume" | "advisor" | "interview"
    input: inputText,
    output: outputText,
    createdAt: new Date().toISOString()
  };

  savedResponses.unshift(item);
  persistSavedResponses();
  renderSavedResponses();
}

function deleteSavedResponse(id) {
  savedResponses = savedResponses.filter((item) => item.id !== id);
  persistSavedResponses();
  renderSavedResponses();
}

function renderSavedResponses() {
  const listEl = document.getElementById("saved-list");
  if (!listEl) return;

  if (!savedResponses.length) {
    listEl.innerHTML = "<p>No saved responses yet.</p>";
    return;
  }

  listEl.innerHTML = savedResponses
    .map((item) => {
      return `
        <div class="saved-card">
          <div class="saved-meta">
            <span class="saved-tool">${item.tool}</span>
            <span class="saved-date">${new Date(item.createdAt).toLocaleString()}</span>
          </div>
          <div class="saved-input">
            <strong>Input:</strong>
            <pre>${item.input}</pre>
          </div>
          <div class="saved-output">
            <strong>AI Response:</strong>
            <pre>${item.output}</pre>
          </div>
          <button class="delete-saved-btn" data-id="${item.id}">Delete</button>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".delete-saved-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      deleteSavedResponse(id);
    });
  });
}

// ===============================
// FRONT-END AI CALL (TO LOCAL BACKEND)
// ===============================

async function callAI(systemPrompt, userPrompt) {
  try {
    const response = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt })
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({}));
      console.error("Backend AI error:", errorDetails);
      return "AI Error from backend.";
    }

    const data = await response.json();
    if (!data.text) {
      console.error("No text returned from backend:", data);
      return "AI Error: Empty response.";
    }
    return data.text;
  } catch (err) {
    console.error("Front-end fetch error:", err);
    return "AI Error: Could not connect to backend.";
  }
}

// ===============================
// RESUME FEEDBACK
// ===============================

const resumeInput = document.getElementById("resume-input");
const resumeOutput = document.getElementById("resume-output");
const resumeBtn = document.getElementById("resume-feedback-btn");
const saveResumeBtn = document.getElementById("save-resume-response");

resumeBtn.addEventListener("click", async () => {
  const text = resumeInput.value.trim();
  if (!text) {
    alert("Paste a resume bullet first.");
    return;
  }

  resumeBtn.disabled = true;
  resumeBtn.textContent = "Thinking...";

  const systemPrompt =
    "You help underserved students improve resume bullets. " +
    "Give kind, specific feedback and one improved version. " +
    "Avoid exaggeration and stay ethical.";

  const userPrompt = "Resume bullet:\n" + text;

  try {
    const result = await callAI(systemPrompt, userPrompt);
    resumeOutput.value = result;
  } catch (e) {
    resumeOutput.value = "AI Error. Try again.";
  } finally {
    resumeBtn.disabled = false;
    resumeBtn.textContent = "Get AI feedback";
  }
});

if (saveResumeBtn) {
  saveResumeBtn.addEventListener("click", () => {
    addSavedResponse("resume", resumeInput.value, resumeOutput.value);
  });
}

// ===============================
// CAREER ADVISOR
// ===============================

const advisorInput = document.getElementById("advisor-input");
const advisorOutput = document.getElementById("advisor-output");
const advisorBtn = document.getElementById("advisor-btn");
const saveAdvisorBtn = document.getElementById("save-advisor-response");

advisorBtn.addEventListener("click", async () => {
  const text = advisorInput.value.trim();
  if (!text) {
    alert("Describe the student's background first.");
    return;
  }

  advisorBtn.disabled = true;
  advisorBtn.textContent = "Thinking...";

  const systemPrompt =
    "You are an ethical career counselor serving underserved students. " +
    "Suggest realistic paths, explain tradeoffs, and note missing info.";

  const userPrompt = "Student background:\n" + text;

  try {
    const result = await callAI(systemPrompt, userPrompt);
    advisorOutput.value = result;
  } catch (e) {
    advisorOutput.value = "AI Error. Try again.";
  } finally {
    advisorBtn.disabled = false;
    advisorBtn.textContent = "Get career suggestions";
  }
});

if (saveAdvisorBtn) {
  saveAdvisorBtn.addEventListener("click", () => {
    addSavedResponse("advisor", advisorInput.value, advisorOutput.value);
  });
}

// ===============================
// INTERVIEW PRACTICE
// ===============================

const interviewInput = document.getElementById("interview-input");
const interviewOutput = document.getElementById("interview-output");
const interviewBtn = document.getElementById("interview-btn");
const saveInterviewBtn = document.getElementById("save-interview-response");

interviewBtn.addEventListener("click", async () => {
  const role = interviewInput.value.trim() || "entry level opportunity";

  interviewBtn.disabled = true;
  interviewBtn.textContent = "Thinking...";

  const systemPrompt =
    "Generate clear interview questions for students. " +
    "Mix behavioral and role-specific questions. Number them.";

  const userPrompt = "Target role: " + role;

  try {
    const result = await callAI(systemPrompt, userPrompt);
    interviewOutput.value = result;
  } catch (e) {
    interviewOutput.value = "AI Error. Try again.";
  } finally {
    interviewBtn.disabled = false;
    interviewBtn.textContent = "Generate practice questions";
  }
});

if (saveInterviewBtn) {
  saveInterviewBtn.addEventListener("click", () => {
    addSavedResponse("interview", interviewInput.value, interviewOutput.value);
  });
}

// Load saved responses on startup
loadSavedResponses();

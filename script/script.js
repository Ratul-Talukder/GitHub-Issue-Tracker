const tabContainer = document.getElementById("tabContainer");
const allIssuesContainer = document.getElementById("allIssues");
const openIssuesContainer = document.getElementById("openIssues");
const closedIssuesContainer = document.getElementById("closedIssues");
const issueCountElement = document.getElementById("issueCount");
const modalBox = document.getElementById("modalBox");

const searchBtn = document.getElementById("searchBtn");
const newIssueBtn = document.getElementById("newIssueBtn");
const searchInput = document.getElementById("searchInput");

let activeTab = "ALL";
let allIssues = [];
let open = 0;
let closed = 0;
let all = 0;

const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

/* ---------------- SPINNER ---------------- */

function manageSpinner(status) {
  const spinner = document.getElementById("spinner");

  if (status) {
    spinner.classList.remove("hidden");
    spinner.classList.add("flex");
  } else {
    spinner.classList.add("hidden");
    spinner.classList.remove("flex");
  }
}

/* ---------------- FETCH ISSUES ---------------- */

async function loadIssues() {
  try {
    manageSpinner(true);

    const res = await fetch(API_URL);
    const data = await res.json();

    allIssues = data.data;

    showIssues(allIssues);
  } catch (error) {
    console.error(error);
  } finally {
    manageSpinner(false);
  }
}

/* ---------------- SEARCH ---------------- */

async function searchIssues(query) {
  try {
    manageSpinner(true);

    const res = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`
    );

    const data = await res.json();

    showIssues(data.data);
  } catch (error) {
    console.error(error);
  } finally {
    manageSpinner(false);
  }
}

/* ---------------- SEARCH EVENTS ---------------- */

searchInput.addEventListener("click", () => {
  newIssueBtn.classList.add("hidden");
  searchBtn.classList.remove("hidden");
});

searchBtn.addEventListener("click", () => {
  const text = searchInput.value.trim();

  if (!text) {
    showIssues(allIssues);
    return;
  }

  searchIssues(text);
});

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

searchInput.addEventListener("input", () => {
  if (searchInput.value === "") {
    showIssues(allIssues);
  }
});

/* ---------------- TABS ---------------- */

tabContainer.addEventListener("click", e => {
  const tab = e.target.closest(".btn");
  if (!tab) return;

  const tabs = tabContainer.querySelectorAll(".btn");

  tabs.forEach(t => {
    t.classList.remove("btn-primary");
    t.classList.add("text-[#64748B]");
  });

  tab.classList.remove("text-[#64748B]");
  tab.classList.add("btn-primary");

  activeTab = tab.innerText.toUpperCase();

  showActiveTab();
});

/* ---------------- ISSUE RENDER ---------------- */

function showIssues(issues) {
  allIssuesContainer.innerHTML = "";
  openIssuesContainer.innerHTML = "";
  closedIssuesContainer.innerHTML = "";

  issues.forEach(issue => {
    const status = issue.status.toUpperCase();

    const card = createIssueCard(issue);
    allIssuesContainer.appendChild(card);

    if (status === "OPEN") {
      openIssuesContainer.appendChild(createIssueCard(issue));
      open++;
    } 
    else if (status === "CLOSED") {
      closedIssuesContainer.appendChild(createIssueCard(issue));
      closed++;
    }
  });
  all = issues.length;

  showActiveTab();
}

/* ---------------- SHOW ACTIVE TAB ---------------- */

function showActiveTab() {
  const containers = [
    allIssuesContainer,
    openIssuesContainer,
    closedIssuesContainer
  ];

  containers.forEach(c => {
    c.classList.add("hidden");
    c.classList.remove("grid");
  });

  if (activeTab === "OPEN") {
    openIssuesContainer.classList.remove("hidden");
    openIssuesContainer.classList.add("grid");
  } 
  else if (activeTab === "CLOSED") {
    closedIssuesContainer.classList.remove("hidden");
    closedIssuesContainer.classList.add("grid");
  } 
  else {
    allIssuesContainer.classList.remove("hidden");
    allIssuesContainer.classList.add("grid");
  }

  issueCountElement.innerText =
    activeTab === "OPEN"
      ? open
      : activeTab === "CLOSED"
      ? closed
      : all;
}

/* ---------------- CARD ---------------- */

function createIssueCard(issue) {
  const priorityClasses = {
    HIGH: "px-5 py-2 rounded-full font-semibold bg-[#FEECEC] text-[#EF4444]",
    MEDIUM: "px-5 py-2 rounded-full font-semibold bg-[#FFF6D1] text-[#F59E0B]",
    LOW: "px-5 py-2 rounded-full font-semibold bg-[#EEEFF2] text-[#9CA3AF]"
  };

  const statusClasses = {
    OPEN: "border-t-4 border-t-green-500",
    CLOSED: "border-t-4 border-t-purple-500"
  };

  const statusImages = {
    OPEN: "./assets/open-Status.png",
    CLOSED: "./assets/closed-Status.png"
  };

  const prio = issue.priority.toUpperCase();
  const status = issue.status.toUpperCase();

  const date = new Date(issue.createdAt);

  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  const labelsHTML = issue.labels.map(label => `
    <span class="px-1 py-1 rounded-full border border-yellow-400 text-red-600 text-sm font-sm flex items-center">
      ${label.toUpperCase()}
    </span>
  `).join("");

  const card = document.createElement("div");

  card.className = `bg-white rounded-2xl shadow-md border border-gray-200 p-2 space-y-2 cursor-pointer ${statusClasses[status]}`;

  card.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <img src="${statusImages[status]}" />
          </div>
          <span class="${priorityClasses[prio]}">
            ${prio}
          </span>
        </div>

        <h2 class="text-sm font-semibold">${issue.title}</h2>

        <p class="text-sm text-[#64748B] line-clamp-2">
            ${issue.description}
        </p>

        <div class="flex gap-3">
          ${labelsHTML}
        </div>

        <div class="border-t pt-4 text-gray-500 text-sm space-y-1">
          <p>#${issue.id} by ${issue.author}</p>
          <p>${formattedDate}</p>
        </div>
    `;

  card.addEventListener("click", () => openModal(issue));

  return card;
}

/* ---------------- MODAL ---------------- */

function openModal(issue) {
  const date = new Date(issue.createdAt);
  const status = issue.status.toUpperCase();

  const labelsHTML = issue.labels.map(label => `
    <span class="px-1 py-1 rounded-full border border-yellow-400 text-red-600 text-sm font-sm flex items-center">
      ${label.toUpperCase()}
    </span>
  `).join("");

  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  modalBox.innerHTML = `
        <div class="flex justify-between items-center">
            <div class="badge badge-soft badge-primary">${status}</div>
            <div class="modal-action -translate-y-2">
              <label for="issueModal" class="btn text-red-600"><i class="fa-solid fa-xmark"></i></label>
            </div>
        </div>
        
        <h2 class="text-2xl font-bold">${issue.title}</h2>

        <p class="text-gray-500">${issue.description}</p>

        <div class="flex gap-3">
          ${labelsHTML}
        </div>
        
        <div class="border-t pt-3 text-sm">
          <p>#${issue.id} by ${issue.author}</p>
          <p>${formattedDate}</p>
        </div>

        <div class="modal-action">
            <label for="issueModal" class="btn btn-primary">Close</label>
        </div>
    `;

  document.getElementById("issueModal").checked = true;
}

/* ---------------- INIT ---------------- */

loadIssues();
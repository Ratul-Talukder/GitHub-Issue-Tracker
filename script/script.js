const tabContainer = document.getElementById("tabContainer");
const allIssuesContainer = document.getElementById("allIssues");
const openIssuesContainer = document.getElementById("openIssues");
const closedIssuesContainer = document.getElementById("closedIssues");
const issueCountElement = document.getElementById("issueCount");
const modalBox = document.getElementById("modalBox");

let activeTab = allIssuesContainer;
let open = 0, closed = 0, all = 0;

// Spinner manage
const manageSpinner = (status, tab = activeTab) => {
  const spinner = document.getElementById("spinner");
  if (status) {
    spinner.classList.remove("hidden");
    spinner.classList.add("flex");
    tab.classList.remove("grid");
    tab.classList.add("hidden");
  } else {
    spinner.classList.remove("flex");
    spinner.classList.add("hidden");
    tab.classList.remove("hidden");
    tab.classList.add("grid");
  }
};

// Tab switching
tabContainer.addEventListener("click", function (e) {
  const tab = e.target.closest(".btn");
  if (!tab) return;

  const tabs = tabContainer.querySelectorAll(".btn");
  tabs.forEach(t => {
    t.classList.remove("btn-primary");
    t.classList.add("text-[#64748B]");
  });

  tab.classList.remove("text-[#64748B]");
  tab.classList.add("btn-primary");

  [allIssuesContainer, openIssuesContainer, closedIssuesContainer].forEach(c => {
    c.classList.remove("grid");
    c.classList.add("hidden");
  });

  if (tab.innerText === "All") {
    activeTab = allIssuesContainer;
    issueCountElement.innerText = all;
  } else if (tab.innerText === "Open") {
    activeTab = openIssuesContainer;
    issueCountElement.innerText = open;
  } else {
    activeTab = closedIssuesContainer;
    issueCountElement.innerText = closed;
  }

  activeTab.classList.remove("hidden");
  activeTab.classList.add("grid");
});

// Load issues from API
function loadIssues() {
  manageSpinner(true);
  fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
    .then(res => res.json())
    .then(data => showIssues(data.data))
    .catch(err => console.error(err));
}

// Priority and status classes
const priorityClasses = {
  HIGH: "bg-[#FEECEC] text-[#EF4444]",
  MEDIUM: "bg-[#FFF6D1] text-[#F59E0B]",
  LOW: "bg-[#EEEFF2] text-[#9CA3AF]"
};

const statusClasses = {
  OPEN: "border-t-4 border-t-green-500",
  CLOSED: "border-t-4 border-t-purple-500"
};

function showIssues(issues) {
  [allIssuesContainer, openIssuesContainer, closedIssuesContainer].forEach(c => c.innerHTML = "");
  open = 0; closed = 0; all = 0;

  issues.forEach(issue => {
    const prio = issue.priority.toUpperCase();
    const prioClass = priorityClasses[prio];
    const status = issue.status.toUpperCase();
    const borderTop = statusClasses[status];
    const date = new Date(issue.createdAt);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    function createIssueCard() {
      const card = document.createElement("div");
      card.className = `bg-white rounded-2xl shadow-md border border-gray-200 p-2 space-y-2 cursor-pointer ${borderTop}`;

      const statusImages = {
        OPEN: "./assets/OPEN-Status.png",
        CLOSED: "./assets/CLOSED-Status.png"
      };
      const statusImg = statusImages[status];

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div><img src="${statusImg}" alt="${status}" /></div>
          <span class="px-5 py-2 rounded-full ${prioClass} font-semibold">${prio}</span>
        </div>
        <h2 class="text-sm font-semibold">${issue.title}</h2>
        <p class="text-sm text-[#64748B] line-clamp-2">${issue.description}</p>
        <div class="flex gap-3">
          <span class="px-4 py-1 rounded-full border border-red-300 text-red-500 text-sm font-semibold">
            <i class="fa-solid fa-bug"></i> BUG
          </span>
          <span class="px-4 py-1 rounded-full border border-yellow-400 text-yellow-600 text-sm font-semibold">
            <i class="fa-regular fa-life-ring"></i> HELP WANTED
          </span>
        </div>
        <div class="border-t pt-4 text-gray-500 text-sm space-y-1">
          <p>#${issue.id} by ${issue.author}</p>
          <p>${formattedDate}</p>
        </div>
      `;

      // Click → open modal with details
      card.addEventListener("click", () => {
        modalBox.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="badge badge-soft badge-primary">${status}</div>
            <span class="px-5 py-2 rounded-full ${prioClass} font-semibold">${prio}</span>
          </div>
          <h2 class="text-2xl font-semibold">${issue.title}</h2>
          <p class="text-md text-[#64748B]">${issue.description}</p>
          <div class="flex gap-3">
            <span class="px-4 py-1 rounded-full border border-red-300 text-red-500 text-sm font-semibold">
              <i class="fa-solid fa-bug"></i> BUG
            </span>
            <span class="px-4 py-1 rounded-full border border-yellow-400 text-yellow-600 text-sm font-semibold">
              <i class="fa-regular fa-life-ring"></i> HELP WANTED
            </span>
          </div>
          <div class="border-t pt-4 text-gray-500 text-sm space-y-1">
            <p>#${issue.id} by ${issue.author}</p>
            <p>${formattedDate}</p>
          </div>
          <div class="modal-action">
            <label for="issueModal" class="btn btn-primary">Close</label>
          </div>
        `;
        document.getElementById("issueModal").checked = true;
      });

      return card;
    }

    // Append cards
    allIssuesContainer.appendChild(createIssueCard());
    if (status === "OPEN") {
      openIssuesContainer.appendChild(createIssueCard());
      open++;
    } else {
      closedIssuesContainer.appendChild(createIssueCard());
      closed++;
    }
    all++;
  });

  manageSpinner(false);
}

loadIssues();
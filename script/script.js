const tabContainer = document.getElementById("tabContainer");
const allIssuesContainer = document.getElementById("allIssues");
const openIssuesContainer = document.getElementById("openIssues");
const closedIssuesContainer = document.getElementById("closedIssues");

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
    const contain = [allIssuesContainer,openIssuesContainer,closedIssuesContainer];

    contain.forEach(container => {
        container.classList.remove("grid");
        container.classList.add("hidden");
    });
    if (tab.innerText === "All") {
        allIssuesContainer.classList.remove("hidden");
        allIssuesContainer.classList.add("grid");
    }
    else if (tab.innerText === "Open") {
        openIssuesContainer.classList.remove("hidden");
        openIssuesContainer.classList.add("grid");
    }
    else {
        closedIssuesContainer.classList.remove("hidden");
        closedIssuesContainer.classList.add("grid");
    }
});


function loadIssues() {
    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
        .then(res => res.json())
        .then(data => showIssues(data.data));
}

loadIssues();


const priorityClasses = {
    HIGH: "bg-[#FEECEC] text-[#EF4444]",
    MEDIUM: "bg-[#FFF6D1] text-[#F59E0B]",
    LOW: "bg-[#EEEFF2] text-[#9CA3AF]"
};
const statusClasses = {
    OPEN: "border-t-4 border-t-green-500",
    CLOSED: "border-t-4 border-t-purple-500"
}


function showIssues(issues) {
    allIssuesContainer.innerHTML = "";
    openIssuesContainer.innerHTML = "";
    closedIssuesContainer.innerHTML = "";

    issues.forEach(issue => {
        const prio = issue.priority.toUpperCase();
        const prioClass = priorityClasses[prio];
        const status = issue.status.toUpperCase();
        const borderTop = statusClasses[status];

        const date = new Date(issue.createdAt);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

        // Function to create an issue card
        function createIssueCard() {
            const card = document.createElement("div");
            card.className = `bg-white rounded-2xl shadow-md border border-gray-200 p-2 space-y-2 ${borderTop}`;
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div><img src="./assets/Open-Status.png" alt="" /></div>
                    <span class="px-5 py-2 rounded-full ${prioClass} font-semibold">${prio}</span>
                </div>
                <h2 class="text-sm font-semibold">${issue.title}</h2>
                <p class="text-sm text-[#64748B]">${issue.description}</p>
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
            return card;
        }

        // Append separate cards to each container
        allIssuesContainer.appendChild(createIssueCard());
        if (status === "OPEN") openIssuesContainer.appendChild(createIssueCard());
        else closedIssuesContainer.appendChild(createIssueCard());
    });
}

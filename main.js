
/* ==========================================
   AMEER APP STORE
   MAIN CONTROLLER
========================================== */

// APP FOLDER TARGETS
const APP_FOLDERS = [
    {
        folder: "app1",
        html: "index.html",
        info: "app-info.js",
        icon: "Icon.png"
    },
    {
        folder: "app2",
        html: "index.html",
        info: "app-info.js",
        icon: "Icon.png"
    }

];

// PAGINATION SETTINGS
const APPS_PER_PAGE = 100;

let currentPage = 1;
let loadedApps = [];

// ==========================================
// LOAD APP INFORMATION
// ==========================================

function loadAppInfo(appTarget) {

    return new Promise((resolve) => {

        const script = document.createElement("script");

        script.src = `./${appTarget.folder}/${appTarget.info}`;

        script.onload = function () {

            const info = window.APP_INFO;

            script.remove();
            delete window.APP_INFO;

            if (!info || !info.name) {
                console.error("Invalid app:", appTarget.folder);
                resolve(null);
                return;
            }

            resolve({
                folder: appTarget.folder,
                html: appTarget.html,
                icon: appTarget.icon,
                info: info
            });
        };

        script.onerror = function () {

            console.error(
                "Failed to load:",
                appTarget.folder + "/" + appTarget.info
            );

            script.remove();
            delete window.APP_INFO;

            resolve(null);
        };

        document.head.appendChild(script);
    });
}

// ==========================================
// LOAD ALL APPLICATIONS
// ==========================================

async function loadApplications() {

    const appList = document.getElementById("appList");
    const appCount = document.getElementById("appCount");

    if (!appList || !appCount) {
        console.error("Required HTML elements not found.");
        return;
    }

    appList.innerHTML = "Loading applications...";
    loadedApps = [];

    for (const target of APP_FOLDERS) {

        const app = await loadAppInfo(target);

        if (app) {
            loadedApps.push(app);
        }
    }

    currentPage = 1;
    displayApplications();
}

// ==========================================
// DISPLAY APPLICATIONS
// ==========================================

function displayApplications() {

    const appList = document.getElementById("appList");
    const appCount = document.getElementById("appCount");

    const totalApps = loadedApps.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalApps / APPS_PER_PAGE)
    );

    currentPage = Math.min(currentPage, totalPages);

    appCount.textContent =
        `${totalApps} APPLICATION${totalApps === 1 ? "" : "S"} AVAILABLE`;

    appList.innerHTML = "";

    const start = (currentPage - 1) * APPS_PER_PAGE;

    const visibleApps = loadedApps.slice(
        start,
        start + APPS_PER_PAGE
    );

    if (visibleApps.length === 0) {
        appList.textContent = "No applications available.";
    }

    visibleApps.forEach(app => {

        const info = app.info;

        const card = document.createElement("div");
        card.className = "app-card";

        const icon = document.createElement("img");
        icon.className = "app-icon";
        icon.src = `./${app.folder}/${app.icon}`;
        icon.alt = info.name;

        icon.onerror = function () {
            this.style.display = "none";
        };

        const details = document.createElement("div");
        details.className = "app-details";

        const name = document.createElement("div");
        name.className = "app-name";
        name.textContent = info.name;

        const description = document.createElement("div");
        description.className = "app-description";
        description.textContent =
            info.description || "No description available.";

        const version = document.createElement("div");
        version.className = "app-version";
        version.textContent =
            "VERSION " + (info.version || "1.0");

        details.append(name, description, version);

        const arrow = document.createElement("div");
        arrow.className = "open-icon";
        arrow.textContent = "›";

        card.append(icon, details, arrow);

        card.addEventListener("click", function () {

            // SAVE CURRENT PAGE
            sessionStorage.setItem(
                "AMEER_STORE_PAGE",
                currentPage
            );

            // OPEN APP
            window.location.href =
                `./${app.folder}/${app.html}`;
        });

        appList.appendChild(card);
    });

    updatePagination(totalPages);
}

// ==========================================
// NEXT PAGE
// ==========================================

function nextPage() {

    const totalPages = Math.max(
        1,
        Math.ceil(loadedApps.length / APPS_PER_PAGE)
    );

    if (currentPage < totalPages) {
        currentPage++;
        displayApplications();
    }
}

// ==========================================
// PREVIOUS PAGE
// ==========================================

function previousPage() {

    if (currentPage > 1) {
        currentPage--;
        displayApplications();
    }
}

// ==========================================
// UPDATE PAGINATION
// ==========================================

function updatePagination(totalPages) {

    document.getElementById("pageInfo").textContent =
        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("previousButton").disabled =
        currentPage <= 1;

    document.getElementById("nextButton").disabled =
        currentPage >= totalPages;
}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const savedPage = sessionStorage.getItem(
        "AMEER_STORE_PAGE"
    );

    if (savedPage !== null) {
        currentPage = Math.max(1, Number(savedPage) || 1);
    }

    loadApplications();
});

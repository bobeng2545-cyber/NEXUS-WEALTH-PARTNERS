
/* =========================================================
   NEXUS WEALTH PARTNERS
   COMPLETE ADMINISTRATOR DASHBOARD
   DATABASE-VERIFIED CORRECTED VERSION
========================================================= */


/* =========================================================
   1. SUPABASE CONNECTION
========================================================= */

if (!window.supabase) {
    throw new Error("Supabase library not loaded.");
}

const SUPABASE_URL =
    "https://lzvtgxittsdhgjnfzdpk.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_191rkqJFaFYGbZxZMAzFPQ_DyMa5wi0";

const nexusAdminSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   2. ADMINISTRATOR SETTINGS
========================================================= */

const AUTHORIZED_ADMIN_EMAIL =
    "bobeng2545@gmail.com";


/* =========================================================
   3. ELEMENT REFERENCES
========================================================= */

const adminLoginScreen =
    document.getElementById("adminLoginScreen");

const adminDashboard =
    document.getElementById("adminDashboard");

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminLoginButton =
    document.getElementById("adminLoginButton");

const adminLoginMessage =
    document.getElementById("adminLoginMessage");

const adminProfileEmail =
    document.getElementById("adminProfileEmail");

const adminLogoutButton =
    document.getElementById("adminLogoutButton");

const adminSidebar =
    document.getElementById("adminSidebar");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const adminPageTitle =
    document.getElementById("adminPageTitle");

const refreshDepositsButton =
    document.getElementById("refreshDepositsButton");


/* =========================================================
   4. DASHBOARD PAGE TITLES
========================================================= */

const adminPageTitles = {
    overview: "Dashboard Overview",
    members: "Members Management",
    tellers: "Tellers Management",
    withdrawals: "Withdrawal Requests",
    deposits: "Deposits Management",
    transactions: "Transactions",
    trash: "Transaction Trash",
    savings: "Savings Management",
    "profit-interest": "Profit & Interest",
    reports: "Reports",
    notifications: "Notifications",
    settings: "Platform Settings"
};


/* =========================================================
   5. GENERAL HELPER FUNCTIONS
========================================================= */

function formatNexusAdminMoney(amount) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}


function createAdminTableCell(value) {
    const cell = document.createElement("td");

    cell.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "—"
            : String(value);

    return cell;
}


function showAdminTableMessage(
    tableId,
    columnCount,
    message
) {
    const table = document.getElementById(tableId);

    if (!table) return;

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columnCount;
    cell.className = "empty-table";
    cell.textContent = message;

    row.appendChild(cell);
    table.replaceChildren(row);
}


function formatAdminDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-GH", {
        timeZone: "Africa/Accra",
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}


function formatAdminDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    const formattedDate =
        new Intl.DateTimeFormat("en-GH", {
            timeZone: "Africa/Accra",
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);

    const formattedTime =
        new Intl.DateTimeFormat("en-GH", {
            timeZone: "Africa/Accra",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }).format(date);

    return `${formattedDate}, ${formattedTime}`;
}


function getAdminMemberName(userId, profiles = []) {
    const profile = profiles.find(
        item => item.id === userId
    );

    return profile?.full_name ||
        profile?.member_id ||
        userId ||
        "Unknown Member";
}


function getAdminNumber(value) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


function normalizeAdminStatus(status) {
    return String(status || "unknown")
        .trim()
        .toLowerCase();
}


function getAdminPaymentMethodLabel(method) {
    const methodLabels = {
        mtn: "MTN Mobile Money",
        mtn_momo: "MTN Mobile Money",
        mtn_mobile_money: "MTN Mobile Money",
        telecel: "Telecel Cash",
        telecel_cash: "Telecel Cash",
        at: "AT Money",
        at_money: "AT Money",
        bank: "Bank Account",
        bank_transfer: "Bank Transfer",
        card: "Bank Card"
    };

    const key = String(method || "")
        .trim()
        .toLowerCase();

    return methodLabels[key] || method || "—";
}


function createAdminStatusCell(status) {
    const normalizedStatus =
        normalizeAdminStatus(status);

    const cell = createAdminTableCell(
        normalizedStatus.toUpperCase()
    );

    cell.className =
        "transaction-status status-" +
        normalizedStatus.replace(/[^a-z0-9_-]/g, "");

    return cell;
}


/*
   Parse withdrawal payment_details.

   Confirmed database type:
   withdrawal_requests.payment_details = TEXT

   Supported examples:
   Account Name: John Doe | Account Number: 0240000000
   John Doe | 0240000000
   0240000000

   The original value is never interpreted as HTML.
*/

function parseAdminWithdrawalPaymentDetails(value) {
    const raw = String(value || "").trim();

    if (!raw) {
        return {
            accountName: "",
            accountNumber: ""
        };
    }

    const accountNameMatch = raw.match(
        /Account Name\s*:\s*(.*?)(?=\s*\|\s*Account Number\s*:|$)/i
    );

    const accountNumberMatch = raw.match(
        /Account Number\s*:\s*(.*)$/i
    );

    if (accountNameMatch || accountNumberMatch) {
        return {
            accountName: accountNameMatch
                ? accountNameMatch[1].trim()
                : "",
            accountNumber: accountNumberMatch
                ? accountNumberMatch[1].trim()
                : ""
        };
    }

    const parts = raw.split("|").map(part => part.trim());

    if (parts.length >= 2) {
        return {
            accountName: parts[0],
            accountNumber: parts.slice(1).join(" | ")
        };
    }

    return {
        accountName: "",
        accountNumber: raw
    };
}


/* =========================================================
   6. DASHBOARD CACHES AND LOADING STATE
========================================================= */

let adminProfilesCache = [];
let adminWalletsCache = [];
let adminDepositsCache = [];
let adminWithdrawalsCache = [];
let adminTellersCache = [];

let adminDepositsAvailable = true;
let currentAdminUserId = null;

/*
   These promises prevent overlapping refreshes from
   silently discarding a refresh requested during loading.
*/

let adminDashboardLoadPromise = null;
let adminDashboardRefreshRequested = false;

let adminTellersLoadPromise = null;
let adminTellersRefreshRequested = false;


/* =========================================================
   7. WALLET BALANCE DISPLAY
========================================================= */

/*
   Always display the actual database wallet balance.

   Never deduct withdrawal amounts again in JavaScript.
*/

function getMemberDisplayBalance(wallet) {
    return getAdminNumber(wallet?.balance);
}


/* =========================================================
   8. SHOW ADMIN LOGIN
========================================================= */

function showAdminLogin() {
    if (adminLoginScreen) {
        adminLoginScreen.hidden = false;
    }

    if (adminDashboard) {
        adminDashboard.hidden = true;
    }

    if (adminLoginForm) {
        adminLoginForm.reset();
    }

    if (adminLoginMessage) {
        adminLoginMessage.textContent = "";
    }

    currentAdminUserId = null;
}




/* =========================================================
   9. ADMIN PAGE NAVIGATION
   COMPLETE CORRECTED VERSION
========================================================= */


/* =========================================================
   9.1 PAGE NAVIGATION FUNCTION
========================================================= */

function showAdminPage(pageName) {

    // Validate page name
    if (!pageName || typeof pageName !== "string") {
        console.error("Invalid admin page name:", pageName);
        return;
    }

    // Find requested page
    const selectedPage = document.getElementById(
        "page-" + pageName
    );

    // Stop if page does not exist
    if (!selectedPage) {
        console.error(
            "Admin page not found:",
            "page-" + pageName
        );
        return;
    }

    // Remove active class from all pages
    document.querySelectorAll(".admin-page")
        .forEach(page => {
            page.classList.remove("active");
        });

    // Remove active class from all navigation links
    document.querySelectorAll(".admin-nav-link")
        .forEach(link => {
            link.classList.remove("active");
        });

    // Activate selected page
    selectedPage.classList.add("active");

    // Activate selected navigation link
    const activeLink = document.querySelector(
        '.admin-nav-link[data-page="' + pageName + '"]'
    );

    if (activeLink) {
        activeLink.classList.add("active");
    }

    // Update dashboard page title
    if (typeof adminPageTitle !== "undefined" &&
        adminPageTitle) {

        adminPageTitle.textContent =
            typeof adminPageTitles !== "undefined"
                ? adminPageTitles[pageName] || "Admin Dashboard"
                : "Admin Dashboard";
    }

    // Close sidebar after navigation
    if (typeof adminSidebar !== "undefined" &&
        adminSidebar) {

        adminSidebar.classList.remove("open");
    }

    // Load data required by the selected page
    switch (pageName) {

        case "trash":

            if (typeof loadAdminTrash === "function") {
                Promise.resolve()
                    .then(() => loadAdminTrash())
                    .catch(error => {
                        console.error(
                            "Failed to load deposit trash:",
                            error
                        );
                    });
            }

            break;


        case "tellers":

            if (typeof loadAdminTellers === "function") {
                Promise.resolve()
                    .then(() => loadAdminTellers())
                    .catch(error => {
                        console.error(
                            "Failed to load tellers:",
                            error
                        );
                    });
            }

            break;


        case "notifications":

            if (typeof loadAdminNotifications === "function") {
                Promise.resolve()
                    .then(() => loadAdminNotifications())
                    .catch(error => {
                        console.error(
                            "Failed to load admin notifications:",
                            error
                        );
                    });
            }

            break;


        case "reports":

            if (typeof renderNexusAdminReports === "function") {
                Promise.resolve()
                    .then(() => renderNexusAdminReports())
                    .catch(error => {
                        console.error(
                            "Failed to render admin reports:",
                            error
                        );
                    });
            }

            break;
    }
}


/* =========================================================
   9.2 NAVIGATION CLICK EVENTS
========================================================= */

document.querySelectorAll(".admin-nav-link[data-page]")
    .forEach(button => {

        button.addEventListener("click", function(event) {

            event.preventDefault();

            const selectedPageName = this.dataset.page;

            if (!selectedPageName) {
                console.error(
                    "Navigation link has no data-page attribute:",
                    this
                );
                return;
            }

            showAdminPage(selectedPageName);

        });

    });


/* =========================================================
   END OF SECTION 9
========================================================= */



// =========================================================
// ADMIN NAVIGATION CLICK EVENTS
// =========================================================

document.querySelectorAll(".admin-nav-link[data-page]")
    .forEach(button => {

        button.addEventListener("click", function(event) {

            event.preventDefault();

            const pageName = this.dataset.page;

            if (pageName) {
                showAdminPage(pageName);
            }
        });
    });



/* =========================================================
   10. MOBILE SIDEBAR
========================================================= */

if (sidebarToggle && adminSidebar) {
    sidebarToggle.addEventListener("click", function() {
        adminSidebar.classList.toggle("open");
    });
}


/* =========================================================
   11. DASHBOARD DATE
========================================================= */

function updateAdminDate() {
    const dateElement =
        document.getElementById("dashboardDate");

    if (!dateElement) return;

    dateElement.textContent =
        new Intl.DateTimeFormat("en-GH", {
            timeZone: "Africa/Accra",
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());
}

updateAdminDate();


/* =========================================================
   12. GLOBAL FINANCIAL DATE FILTER
   TIME ZONE: AFRICA/ACCRA
========================================================= */

let adminDateFilterState = {
    preset: "this_month",
    from: "",
    to: ""
};

const adminDateRangeSelect =
    document.getElementById("adminDateRange");

const adminDateFromInput =
    document.getElementById("adminDateFrom");

const adminDateToInput =
    document.getElementById("adminDateTo");

const applyAdminDateFilterButton =
    document.getElementById("applyAdminDateFilter");

const resetAdminDateFilterButton =
    document.getElementById("resetAdminDateFilter");

const adminDateFilterSummary =
    document.getElementById("adminDateFilterSummary");

const adminDateFilterMessage =
    document.getElementById("adminDateFilterMessage");


function getAdminGhanaDateKey(value = new Date()) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Accra",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const values = {};

    parts.forEach(part => {
        values[part.type] = part.value;
    });

    return `${values.year}-${values.month}-${values.day}`;
}


function getAdminGhanaToday() {
    return getAdminGhanaDateKey(new Date());
}


function shiftAdminDateKey(dateKey, numberOfDays) {
    const [year, month, day] =
        dateKey.split("-").map(Number);

    const date = new Date(
        Date.UTC(year, month - 1, day)
    );

    date.setUTCDate(
        date.getUTCDate() + numberOfDays
    );

    return [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
}


function formatAdminDateKey(dateKey) {
    if (!dateKey) return "";

    const [year, month, day] =
        dateKey.split("-").map(Number);

    const date = new Date(
        Date.UTC(year, month - 1, day, 12)
    );

    return new Intl.DateTimeFormat("en-GH", {
        timeZone: "Africa/Accra",
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}


function getAdminFinancialDate(record, type) {
    if (!record) return null;

    const status =
        normalizeAdminStatus(record.status);

    if (type === "deposit") {
        if (status === "successful") {
            return record.paid_at || record.created_at;
        }

        return record.created_at;
    }

    if (type === "withdrawal") {
        if (status === "completed") {
            return record.completed_at || record.created_at;
        }

        return record.created_at;
    }

    return record.created_at;
}


function isAdminRecordWithinDateRange(record, type) {
    const financialDate =
        getAdminFinancialDate(record, type);

    if (!financialDate) return false;

    const recordDate =
        getAdminGhanaDateKey(financialDate);

    if (!recordDate) return false;

    const { from, to } = adminDateFilterState;

    if (from && recordDate < from) {
        return false;
    }

    if (to && recordDate > to) {
        return false;
    }

    return true;
}


function getAdminFilteredDeposits() {
    return adminDepositsCache.filter(deposit =>
        isAdminRecordWithinDateRange(
            deposit,
            "deposit"
        )
    );
}


function getAdminFilteredWithdrawals() {
    return adminWithdrawalsCache.filter(withdrawal =>
        isAdminRecordWithinDateRange(
            withdrawal,
            "withdrawal"
        )
    );
}


function setAdminQuickDateRange(preset) {
    const today = getAdminGhanaToday();

    const [year, month, day] =
        today.split("-").map(Number);

    let from = "";
    let to = today;

    if (preset === "today") {
        from = today;

    } else if (preset === "yesterday") {
        from = shiftAdminDateKey(today, -1);
        to = from;

    } else if (preset === "this_week") {
        const date = new Date(
            Date.UTC(year, month - 1, day)
        );

        const weekday = date.getUTCDay();

        const daysSinceMonday =
            weekday === 0 ? 6 : weekday - 1;

        from = shiftAdminDateKey(
            today,
            -daysSinceMonday
        );

    } else if (preset === "this_month") {
        from =
            `${year}-${String(month).padStart(2, "0")}-01`;

    } else if (preset === "this_year") {
        from = `${year}-01-01`;

    } else if (preset === "all_time") {
        from = "";
        to = "";

    } else {
        return;
    }

    adminDateFilterState = {
        preset,
        from,
        to
    };

    if (adminDateFromInput) {
        adminDateFromInput.value = from;
    }

    if (adminDateToInput) {
        adminDateToInput.value = to;
    }

    if (adminDateFilterMessage) {
        adminDateFilterMessage.textContent = "";
    }

    renderAdminDateFilteredDashboard();
   renderNexusAdminReports();
}


function applyAdminCustomDateRange() {
    const from =
        adminDateFromInput?.value || "";

    const to =
        adminDateToInput?.value || "";

    if (!from || !to) {
        if (adminDateFilterMessage) {
            adminDateFilterMessage.textContent =
                "Please select both the From Date and To Date.";
        }
        return;
    }

    if (from > to) {
        if (adminDateFilterMessage) {
            adminDateFilterMessage.textContent =
                "The From Date cannot be later than the To Date.";
        }
        return;
    }

    adminDateFilterState = {
        preset: "custom",
        from,
        to
    };

    if (adminDateRangeSelect) {
        adminDateRangeSelect.value = "custom";
    }

    if (adminDateFilterMessage) {
        adminDateFilterMessage.textContent = "";
    }

    renderAdminDateFilteredDashboard();
}


function updateAdminDateFilterSummary() {
    if (!adminDateFilterSummary) return;

    const { preset, from, to } =
        adminDateFilterState;

    const labels = {
        today: "Today",
        yesterday: "Yesterday",
        this_week: "This Week",
        this_month: "This Month",
        this_year: "This Year",
        all_time: "All Time"
    };

    if (preset === "custom") {
        adminDateFilterSummary.textContent =
            `${formatAdminDateKey(from)} – ${formatAdminDateKey(to)}`;
        return;
    }

    adminDateFilterSummary.textContent =
        labels[preset] || "Selected Period";
}


/* =========================================================
   13. MEMBER TOTALS
========================================================= */

function getSuccessfulDepositsForMember(
    userId,
    deposits = []
) {
    return deposits
        .filter(deposit =>
            deposit.user_id === userId &&
            normalizeAdminStatus(deposit.status) === "successful"
        )
        .reduce((total, deposit) => {
            return total + getAdminNumber(deposit.amount);
        }, 0);
}


function getCompletedWithdrawalsForMember(
    userId,
    withdrawals = []
) {
    return withdrawals
        .filter(request =>
            request.user_id === userId &&
            normalizeAdminStatus(request.status) === "completed"
        )
        .reduce((total, request) => {
            return total + getAdminNumber(request.amount);
        }, 0);
}


/* =========================================================
   14. MEMBER SEARCH AND DIRECTORY
========================================================= */

function displayAdminMembers(profiles = []) {
    const table =
        document.getElementById("membersTable");

    if (!table) return;

    const searchInput =
        document.getElementById("memberSearchInput");

    const searchTerm = String(
        searchInput?.value || ""
    ).trim().toLowerCase();

    const filteredProfiles = profiles.filter(profile => {
        const searchableValues = [
            profile.member_id,
            profile.full_name,
            profile.email,
            profile.phone
        ];

        return searchableValues.some(value =>
            String(value || "")
                .toLowerCase()
                .includes(searchTerm)
        );
    });

    const resultsLabel =
        document.getElementById("memberSearchResults");

    if (resultsLabel) {
        resultsLabel.textContent =
            searchTerm
                ? `${filteredProfiles.length} matching member(s) found.`
                : `${profiles.length} registered member(s).`;
    }

    const totalElement =
        document.getElementById("memberManagementTotal");

    if (totalElement) {
        totalElement.textContent =
            profiles.length.toLocaleString("en-GH");
    }

    const walletTotalElement =
        document.getElementById("memberManagementWallets");

    if (walletTotalElement) {
        const totalWallets = adminWalletsCache.reduce(
            (sum, wallet) =>
                sum + getMemberDisplayBalance(wallet),
            0
        );

        walletTotalElement.textContent =
            formatNexusAdminMoney(totalWallets);
    }

    if (!filteredProfiles.length) {
        showAdminTableMessage(
            "membersTable",
            7,
            searchTerm
                ? "No members match your search."
                : "No registered members found."
        );
        return;
    }

    table.replaceChildren();

    filteredProfiles.forEach(profile => {
        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(profile.member_id)
        );

        row.appendChild(
            createAdminTableCell(profile.full_name)
        );

        row.appendChild(
            createAdminTableCell(profile.email)
        );

        row.appendChild(
            createAdminTableCell(profile.phone)
        );

        row.appendChild(
            createAdminTableCell(
                formatAdminDate(profile.created_at)
            )
        );

        const normalizedStatus =
            normalizeAdminStatus(profile.status);

        const statusCell =
            document.createElement("td");

        const statusLabel =
            document.createElement("span");

        statusLabel.className =
            "member-status " +
            (
                ["active", "suspended", "pending"]
                    .includes(normalizedStatus)
                    ? normalizedStatus
                    : "unknown"
            );

        statusLabel.textContent =
            profile.status || "Unknown";

        statusCell.appendChild(statusLabel);
        row.appendChild(statusCell);

        const actionCell =
            document.createElement("td");

        const viewButton =
            document.createElement("button");

        viewButton.type = "button";
        viewButton.className = "view-member-button";
        viewButton.textContent = "View Profile";

        viewButton.addEventListener("click", () => {
            openAdminMemberProfile(profile.id);
        });

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);

        table.appendChild(row);
    });
}


const memberSearchInput =
    document.getElementById("memberSearchInput");

const clearMemberSearch =
    document.getElementById("clearMemberSearch");

if (memberSearchInput) {
    memberSearchInput.addEventListener("input", () => {
        displayAdminMembers(adminProfilesCache);
    });
}

if (clearMemberSearch) {
    clearMemberSearch.addEventListener("click", () => {
        if (memberSearchInput) {
            memberSearchInput.value = "";
        }

        displayAdminMembers(adminProfilesCache);
        memberSearchInput?.focus();
    });
}


/* =========================================================
   15. MEMBER PROFILE MODAL
========================================================= */

const memberProfileModal =
    document.getElementById("memberProfileModal");

const suspendMemberButton =
    document.getElementById("suspendMemberButton");

const activateMemberButton =
    document.getElementById("activateMemberButton");


function updateMemberAccountActionButtons(profile) {
    if (!suspendMemberButton || !activateMemberButton) {
        return;
    }

    suspendMemberButton.hidden = true;
    activateMemberButton.hidden = true;

    suspendMemberButton.disabled = false;
    activateMemberButton.disabled = false;

    if (!profile) return;

    if (
        profile.id === currentAdminUserId ||
        String(profile.email || "").toLowerCase() ===
            AUTHORIZED_ADMIN_EMAIL
    ) {
        return;
    }

    const status =
        normalizeAdminStatus(profile.status);

    if (status === "active") {
        suspendMemberButton.hidden = false;
    } else if (status === "suspended") {
        activateMemberButton.hidden = false;
    }
}


function openAdminMemberProfile(userId) {
    const profile = adminProfilesCache.find(
        item => item.id === userId
    );

    if (!profile) {
        alert("Member information could not be found.");
        return;
    }

    const wallet = adminWalletsCache.find(
        item => item.user_id === userId
    );

    const balance =
        getMemberDisplayBalance(wallet);

    const filteredDeposits =
        getAdminFilteredDeposits();

    const filteredWithdrawals =
        getAdminFilteredWithdrawals();

    const successfulDeposits =
        getSuccessfulDepositsForMember(
            userId,
            filteredDeposits
        );

    const completedWithdrawals =
        getCompletedWithdrawalsForMember(
            userId,
            filteredWithdrawals
        );

    const setProfileValue = (elementId, value) => {
        const element =
            document.getElementById(elementId);

        if (element) {
            element.textContent =
                value === null ||
                value === undefined ||
                value === ""
                    ? "—"
                    : String(value);
        }
    };

    setProfileValue("profileMemberId", profile.member_id);
    setProfileValue("profileMemberName", profile.full_name);
    setProfileValue("profileMemberEmail", profile.email);
    setProfileValue("profileMemberPhone", profile.phone);

    setProfileValue(
        "profileMemberJoined",
        formatAdminDateTime(profile.created_at)
    );

    setProfileValue(
        "profileMemberStatus",
        profile.status || "Unknown"
    );

    setProfileValue(
        "profileWalletBalance",
        formatNexusAdminMoney(balance)
    );

    setProfileValue(
        "profileWalletDeposits",
        adminDepositsAvailable
            ? formatNexusAdminMoney(successfulDeposits)
            : "Unavailable"
    );

    setProfileValue(
        "profileWalletWithdrawals",
        formatNexusAdminMoney(completedWithdrawals)
    );

    if (memberProfileModal) {
        memberProfileModal.dataset.memberId = userId;
        memberProfileModal.hidden = false;
        document.body.style.overflow = "hidden";
    }

    updateMemberAccountActionButtons(profile);

    displayAdminMemberTransactions(userId);
}


function displayAdminMemberTransactions(userId) {
    const table =
        document.getElementById("memberProfileTransactions");

    if (!table) return;

    const memberTransactions = [];

    const deposits =
        getAdminFilteredDeposits();

    const withdrawals =
        getAdminFilteredWithdrawals();

    if (adminDepositsAvailable) {
        deposits
            .filter(deposit => deposit.user_id === userId)
            .forEach(deposit => {
                memberTransactions.push({
                    reference: deposit.reference || deposit.id,
                    type: "Deposit",
                    amount: deposit.amount,
                    status: deposit.status,
                    created_at: getAdminFinancialDate(
                        deposit,
                        "deposit"
                    )
                });
            });
    }

    withdrawals
        .filter(withdrawal => withdrawal.user_id === userId)
        .forEach(withdrawal => {
            memberTransactions.push({
                reference:
                    "WDR-" +
                    String(withdrawal.id).slice(0, 8),
                type: "Withdrawal",
                amount: withdrawal.amount,
                status: withdrawal.status,
                created_at: getAdminFinancialDate(
                    withdrawal,
                    "withdrawal"
                )
            });
        });

    memberTransactions.sort((a, b) => {
        return new Date(b.created_at || 0) -
            new Date(a.created_at || 0);
    });

    if (!memberTransactions.length) {
        showAdminTableMessage(
            "memberProfileTransactions",
            5,
            adminDepositsAvailable
                ? "No transactions found for this member in the selected period."
                : "Deposit history is currently unavailable."
        );
        return;
    }

    table.replaceChildren();

    memberTransactions.forEach(transaction => {
        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(transaction.reference)
        );

        const typeCell =
            createAdminTableCell(transaction.type);

        typeCell.className =
            transaction.type === "Deposit"
                ? "transaction-type deposit"
                : "transaction-type withdrawal";

        row.appendChild(typeCell);

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(transaction.amount)
            )
        );

        row.appendChild(
            createAdminStatusCell(transaction.status)
        );

        row.appendChild(
            createAdminTableCell(
                formatAdminDateTime(transaction.created_at)
            )
        );

        table.appendChild(row);
    });
}


/* =========================================================
   16. UPDATE MEMBER ACCOUNT STATUS
========================================================= */

async function updateNexusMemberStatus(newStatus) {
    const selectedMemberId =
        memberProfileModal?.dataset.memberId;

    const profile = adminProfilesCache.find(
        member => member.id === selectedMemberId
    );

    if (!profile) {
        alert("Member information could not be found.");
        return;
    }

    if (!["Active", "Suspended"].includes(newStatus)) {
        alert("Invalid account status.");
        return;
    }

    if (
        profile.id === currentAdminUserId ||
        String(profile.email || "").toLowerCase() ===
            AUTHORIZED_ADMIN_EMAIL
    ) {
        alert("Administrator accounts cannot be changed here.");
        return;
    }

    const confirmed = window.confirm(
        newStatus === "Suspended"
            ? `Are you sure you want to suspend ${profile.full_name || "this member"}?`
            : `Are you sure you want to activate ${profile.full_name || "this member"}?`
    );

    if (!confirmed) return;

    const button =
        newStatus === "Suspended"
            ? suspendMemberButton
            : activateMemberButton;

    const originalText =
        button?.textContent || "";

    if (button) {
        button.disabled = true;
        button.textContent = "Updating...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_update_member_status",
                {
                    p_user_id: profile.id,
                    p_new_status: newStatus
                }
            );

        if (error) throw error;

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "The member account status could not be updated."
            );
        }

        profile.status = newStatus;

        displayAdminMembers(adminProfilesCache);
        openAdminMemberProfile(profile.id);

        alert(
            data.message ||
            `Member account ${newStatus.toLowerCase()} successfully.`
        );

    } catch (error) {
        console.error(
            "Member account status update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update the member account."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


if (suspendMemberButton) {
    suspendMemberButton.addEventListener(
        "click",
        () => updateNexusMemberStatus("Suspended")
    );
}

if (activateMemberButton) {
    activateMemberButton.addEventListener(
        "click",
        () => updateNexusMemberStatus("Active")
    );
}


/* =========================================================
   17. CLOSE MEMBER PROFILE MODAL
========================================================= */

function closeAdminMemberProfile() {
    if (memberProfileModal) {
        memberProfileModal.hidden = true;
        delete memberProfileModal.dataset.memberId;
    }

    document.body.style.overflow = "";

    if (suspendMemberButton) {
        suspendMemberButton.hidden = true;
        suspendMemberButton.disabled = false;
    }

    if (activateMemberButton) {
        activateMemberButton.hidden = true;
        activateMemberButton.disabled = false;
    }
}


const closeMemberProfile =
    document.getElementById("closeMemberProfile");

const closeMemberProfileFooter =
    document.getElementById("closeMemberProfileFooter");

if (closeMemberProfile) {
    closeMemberProfile.addEventListener(
        "click",
        closeAdminMemberProfile
    );
}

if (closeMemberProfileFooter) {
    closeMemberProfileFooter.addEventListener(
        "click",
        closeAdminMemberProfile
    );
}

if (memberProfileModal) {
    memberProfileModal.addEventListener(
        "click",
        event => {
            if (event.target === memberProfileModal) {
                closeAdminMemberProfile();
            }
        }
    );
}

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        memberProfileModal &&
        !memberProfileModal.hidden
    ) {
        closeAdminMemberProfile();
    }
});


/* =========================================================
   18. DISPLAY WITHDRAWAL REQUESTS
========================================================= */

function displayAdminWithdrawals(
    withdrawals = [],
    profiles = []
) {
    const table =
        document.getElementById("withdrawalsTable");

    const recentTable =
        document.getElementById("recentWithdrawalsTable");

    const sortedWithdrawals = [...withdrawals].sort(
        (a, b) => {
            return new Date(
                getAdminFinancialDate(b, "withdrawal") || 0
            ) - new Date(
                getAdminFinancialDate(a, "withdrawal") || 0
            );
        }
    );

    if (table) table.replaceChildren();
    if (recentTable) recentTable.replaceChildren();

    if (!sortedWithdrawals.length) {
        showAdminTableMessage(
            "withdrawalsTable",
            8,
            "No withdrawal requests found in the selected period."
        );

        showAdminTableMessage(
            "recentWithdrawalsTable",
            5,
            "No withdrawal requests found in the selected period."
        );

        return;
    }

    sortedWithdrawals.forEach((request, index) => {
        const memberName = getAdminMemberName(
            request.user_id,
            profiles
        );

        const requestId =
            String(request.id).slice(0, 8);

        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(requestId)
        );

        row.appendChild(
            createAdminTableCell(memberName)
        );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(request.amount)
            )
        );

        row.appendChild(
            createAdminTableCell(
                getAdminPaymentMethodLabel(
                    request.withdrawal_method
                )
            )
        );

        /* Recipient account information */

        const paymentDetailsCell =
            document.createElement("td");

        const parsedDetails =
            parseAdminWithdrawalPaymentDetails(
                request.payment_details
            );

        const accountNameLine =
            document.createElement("div");

        accountNameLine.textContent =
            "Account Name: " +
            (parsedDetails.accountName || "—");

        const accountNumberLine =
            document.createElement("div");

        accountNumberLine.textContent =
            "Account Number: " +
            (parsedDetails.accountNumber || "—");

        paymentDetailsCell.appendChild(accountNameLine);
        paymentDetailsCell.appendChild(accountNumberLine);

        paymentDetailsCell.className =
            "withdrawal-payment-details";

        row.appendChild(paymentDetailsCell);

        row.appendChild(
            createAdminStatusCell(request.status)
        );

        /* Withdrawal actions */

        const actionCell =
            document.createElement("td");

        const status =
            normalizeAdminStatus(request.status);

        if (status === "pending" || status === "processing") {
            if (status === "pending") {
                const processButton =
                    document.createElement("button");

                processButton.type = "button";
                processButton.textContent = "Process";
                processButton.className =
                    "admin-action-button";

                processButton.addEventListener("click", () => {
                    reviewNexusWithdrawal(
                        request.id,
                        "processing",
                        processButton
                    );
                });

                actionCell.appendChild(processButton);
            }

            const rejectButton =
                document.createElement("button");

            rejectButton.type = "button";
            rejectButton.textContent = "Reject";
            rejectButton.className =
                "admin-action-button reject";

            rejectButton.addEventListener("click", () => {
                reviewNexusWithdrawal(
                    request.id,
                    "rejected",
                    rejectButton
                );
            });

            actionCell.appendChild(rejectButton);

        } else {
            actionCell.textContent = "No action";
        }

        row.appendChild(actionCell);

        const dateTimeCell =
            createAdminTableCell(
                formatAdminDateTime(
                    getAdminFinancialDate(
                        request,
                        "withdrawal"
                    )
                )
            );

        dateTimeCell.className =
            "withdrawal-date-time";

        if (request.created_at) {
            const requestDate =
                new Date(request.created_at);

            if (!Number.isNaN(requestDate.getTime())) {
                dateTimeCell.title =
                    requestDate.toISOString();
            }
        }

        row.appendChild(dateTimeCell);

        if (table) {
            table.appendChild(row);
        }

        /* Recent withdrawals */

        if (index < 5 && recentTable) {
            const recentRow =
                document.createElement("tr");

            recentRow.appendChild(
                createAdminTableCell(requestId)
            );

            recentRow.appendChild(
                createAdminTableCell(memberName)
            );

            recentRow.appendChild(
                createAdminTableCell(
                    formatNexusAdminMoney(request.amount)
                )
            );

            recentRow.appendChild(
                createAdminTableCell(
                    getAdminPaymentMethodLabel(
                        request.withdrawal_method
                    )
                )
            );

            recentRow.appendChild(
                createAdminTableCell(
                    String(request.status || "").toUpperCase()
                )
            );

            recentTable.appendChild(recentRow);
        }
    });
}


/* =========================================================
   19. DISPLAY SAVINGS DATA
========================================================= */

function displayAdminSavings(
    wallets = [],
    profiles = [],
    deposits = [],
    withdrawals = [],
    depositsAvailable = true
) {
    const table =
        document.getElementById("savingsTable");

    if (!table) return;

    if (!wallets.length) {
        showAdminTableMessage(
            "savingsTable",
            5,
            "No wallet records found."
        );
        return;
    }

    table.replaceChildren();

    wallets.forEach(wallet => {
        const row = document.createElement("tr");

        const memberProfile = profiles.find(
            profile => profile.id === wallet.user_id
        );

        row.appendChild(
            createAdminTableCell(
                memberProfile?.member_id
            )
        );

        row.appendChild(
            createAdminTableCell(
                getAdminMemberName(
                    wallet.user_id,
                    profiles
                )
            )
        );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    getMemberDisplayBalance(wallet)
                )
            )
        );

        row.appendChild(
            createAdminTableCell(
                depositsAvailable
                    ? formatNexusAdminMoney(
                        getSuccessfulDepositsForMember(
                            wallet.user_id,
                            deposits
                        )
                    )
                    : "Unavailable"
            )
        );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    getCompletedWithdrawalsForMember(
                        wallet.user_id,
                        withdrawals
                    )
                )
            )
        );

        table.appendChild(row);
    });
}


/* =========================================================
   20. SECURE ADMIN DEPOSIT VERIFICATION
========================================================= */

async function verifyNexusDeposit(depositId, button) {
    if (!depositId) {
        alert("Deposit ID is missing.");
        return;
    }

    const confirmed = window.confirm(
        "Verify this deposit directly with Paystack and credit the member's wallet only if payment is confirmed?"
    );

    if (!confirmed) return;

    const originalText =
        button?.textContent || "Verify";

    if (button) {
        button.disabled = true;
        button.textContent = "Verifying...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.functions.invoke(
                "nexus-admin-verify-deposit",
                {
                    body: {
                        deposit_id: depositId
                    }
                }
            );

        if (error) {
            let details = "";

            try {
                const response = error.context;

                if (
                    response &&
                    typeof response.json === "function"
                ) {
                    const result = await response.json();
                    details = result.message || "";
                }
            } catch (_) {
                // Retain original error.
            }

            throw new Error(
                details ||
                error.message ||
                "Could not contact the verification service."
            );
        }

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "Deposit verification was unsuccessful."
            );
        }

        alert(
            data.already_processed
                ? "This deposit was already credited. No additional credit was made."
                : "Deposit verified successfully. The member's wallet has been credited."
        );

        await loadAdminDashboardData();

    } catch (error) {
        console.error(
            "Nexus deposit verification error:",
            error
        );

        alert(
            error.message ||
            "Deposit verification failed. Please try again."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


/* =========================================================
   21. DISPLAY DEPOSIT RECORDS
========================================================= */

function displayAdminDeposits(
    deposits = [],
    profiles = []
) {
    const table =
        document.getElementById("depositsTable");

    if (!table) return;

    const sortedDeposits = [...deposits].sort(
        (a, b) => {
            return new Date(
                getAdminFinancialDate(b, "deposit") || 0
            ) - new Date(
                getAdminFinancialDate(a, "deposit") || 0
            );
        }
    );

    if (!sortedDeposits.length) {
        showAdminTableMessage(
            "depositsTable",
            8,
            "No deposit transactions found in the selected period."
        );
        return;
    }

    table.replaceChildren();

    sortedDeposits.forEach(deposit => {
        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(
                deposit.reference || deposit.id
            )
        );

        row.appendChild(
            createAdminTableCell(
                getAdminMemberName(
                    deposit.user_id,
                    profiles
                )
            )
        );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(deposit.amount)
            )
        );

        row.appendChild(
            createAdminTableCell(
                getAdminPaymentMethodLabel(
                    deposit.payment_method
                )
            )
        );

        row.appendChild(
            createAdminTableCell(deposit.payment_phone)
        );

        row.appendChild(
            createAdminStatusCell(deposit.status)
        );

        row.appendChild(
            createAdminTableCell(
                formatAdminDateTime(
                    getAdminFinancialDate(deposit, "deposit")
                )
            )
        );

        const actionCell =
            document.createElement("td");

        const status =
            normalizeAdminStatus(deposit.status);

        if (status === "pending") {
            const verifyButton =
                document.createElement("button");

            verifyButton.type = "button";
            verifyButton.textContent = "Verify Deposit";
            verifyButton.className = "admin-action-button";

            verifyButton.addEventListener("click", () => {
                verifyNexusDeposit(
                    deposit.id,
                    verifyButton
                );
            });

            actionCell.appendChild(verifyButton);

        } else if (status === "successful") {
            const creditedLabel =
                document.createElement("span");

            creditedLabel.textContent = "Credited";
            actionCell.appendChild(creditedLabel);

        } else {
            actionCell.textContent = "No action";
        }

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className =
            "admin-action-button reject";

        deleteButton.style.marginLeft = "6px";

        deleteButton.addEventListener("click", () => {
            moveDepositToTrash(
                deposit.id,
                deleteButton
            );
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        table.appendChild(row);
    });
}


/* =========================================================
   22. UPDATE DEPOSIT STATISTICS
========================================================= */

function updateAdminDepositStatistics(
    deposits = [],
    depositsAvailable = true
) {
    const pendingElement =
        document.getElementById("adminPendingDeposits");

    const successfulElement =
        document.getElementById("adminSuccessfulDeposits");

    const failedElement =
        document.getElementById("adminFailedDeposits");

    const totalElement =
        document.getElementById("adminDepositTotal");

    const badge =
        document.getElementById("pendingDepositBadge");

    if (!depositsAvailable) {
        if (pendingElement) pendingElement.textContent = "—";
        if (successfulElement) successfulElement.textContent = "—";
        if (failedElement) failedElement.textContent = "—";
        if (totalElement) totalElement.textContent = "Unavailable";
        if (badge) badge.hidden = true;
        return;
    }

    const pendingDeposits =
        deposits.filter(deposit =>
            normalizeAdminStatus(deposit.status) === "pending"
        );

    const successfulDeposits =
        deposits.filter(deposit =>
            normalizeAdminStatus(deposit.status) === "successful"
        );

    const failedDeposits =
        deposits.filter(deposit =>
            normalizeAdminStatus(deposit.status) === "failed"
        );

    const successfulTotal =
        successfulDeposits.reduce((total, deposit) => {
            return total + getAdminNumber(deposit.amount);
        }, 0);

    if (pendingElement) {
        pendingElement.textContent =
            pendingDeposits.length.toLocaleString("en-GH");
    }

    if (successfulElement) {
        successfulElement.textContent =
            successfulDeposits.length.toLocaleString("en-GH");
    }

    if (failedElement) {
        failedElement.textContent =
            failedDeposits.length.toLocaleString("en-GH");
    }

    if (totalElement) {
        totalElement.textContent =
            formatNexusAdminMoney(successfulTotal);
    }

    if (badge) {
        badge.textContent = pendingDeposits.length;
        badge.hidden = pendingDeposits.length === 0;
    }
}


/* =========================================================
   23. REVERSE FINANCIAL TRANSACTION
========================================================= */

async function reverseNexusTransaction(
    transactionType,
    transactionId,
    amount,
    button
) {
    const cleanType = String(
        transactionType || ""
    ).trim().toLowerCase();

    const cleanId = String(
        transactionId || ""
    ).trim();

    if (
        !["deposit", "withdrawal"].includes(cleanType) ||
        !cleanId
    ) {
        alert("The transaction details are invalid.");
        return;
    }

    const reasonInput = prompt(
        "Enter the reason for this transaction reversal.\n\n" +
        "The reason must contain at least 5 characters."
    );

    if (reasonInput === null) return;

    const cleanReason = reasonInput.trim();

    if (cleanReason.length < 5) {
        alert("Please enter a reason with at least 5 characters.");
        return;
    }

    const amountText =
        formatNexusAdminMoney(amount);

    const confirmationMessage =
        cleanType === "deposit"
            ? "You are about to REVERSE this successful deposit.\n\n" +
              "Amount: " + amountText + "\n\n" +
              "The database function will deduct the previously credited amount only if the wallet has sufficient funds.\n\n" +
              "Continue only if you have verified the transaction."
            : "You are about to CANCEL this pending withdrawal.\n\n" +
              "Amount: " + amountText + "\n\n" +
              "Pending withdrawal cancellation does not deduct or refund wallet funds.\n\n" +
              "Continue?";

    if (!window.confirm(confirmationMessage)) {
        return;
    }

    const originalButtonText =
        button?.textContent || "";

    if (button) {
        button.disabled = true;
        button.textContent = "Processing...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_reverse_nexus_transaction",
                {
                    p_transaction_type: cleanType,
                    p_transaction_id: cleanId,
                    p_reason: cleanReason
                }
            );

        if (error) throw error;

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "The transaction reversal was not completed."
            );
        }

        alert(
            data.message ||
            "The transaction was processed successfully."
        );

        await loadAdminDashboardData();

    } catch (error) {
        console.error(
            "Nexus transaction reversal error:",
            error
        );

        alert(
            error.message ||
            "Unable to process this transaction. Please try again."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalButtonText;
        }
    }
}


/* =========================================================
   24. DISPLAY ALL FINANCIAL TRANSACTIONS
========================================================= */

function displayAdminTransactions(
    deposits = [],
    withdrawals = [],
    profiles = []
) {
    const table =
        document.getElementById("transactionsTable");

    if (!table) {
        console.error(
            "The transactionsTable element was not found."
        );
        return;
    }

    const parentTable =
        table.closest("table");

    if (parentTable) {
        let thead =
            parentTable.querySelector("thead");

        if (!thead) {
            thead = document.createElement("thead");
            parentTable.prepend(thead);
        }

        const headingRow =
            document.createElement("tr");

        [
            "Transaction Reference",
            "Member",
            "Transaction Type",
            "Amount",
            "Payment Method",
            "Status",
            "Date & Time",
            "Actions"
        ].forEach(heading => {
            const th = document.createElement("th");
            th.textContent = heading;
            headingRow.appendChild(th);
        });

        thead.replaceChildren(headingRow);
    }

    const transactions = [];

    deposits.forEach(deposit => {
        transactions.push({
            id: deposit.id,
            reference: deposit.reference,
            user_id: deposit.user_id,
            type: "Deposit",
            amount: deposit.amount,
            payment_method: deposit.payment_method,
            status: deposit.status,
            created_at: getAdminFinancialDate(
                deposit,
                "deposit"
            )
        });
    });

    withdrawals.forEach(withdrawal => {
        transactions.push({
            id: withdrawal.id,
            reference:
                "WDR-" +
                String(withdrawal.id).slice(0, 8),
            user_id: withdrawal.user_id,
            type: "Withdrawal",
            amount: withdrawal.amount,
            payment_method: withdrawal.withdrawal_method,
            status: withdrawal.status,
            created_at: getAdminFinancialDate(
                withdrawal,
                "withdrawal"
            )
        });
    });

    transactions.sort((a, b) => {
        return new Date(b.created_at || 0) -
            new Date(a.created_at || 0);
    });

    if (!transactions.length) {
        showAdminTableMessage(
            "transactionsTable",
            8,
            "No financial transactions found in the selected period."
        );
        return;
    }

    table.replaceChildren();

    transactions.forEach(transaction => {
        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(
                transaction.reference || transaction.id
            )
        );

        row.appendChild(
            createAdminTableCell(
                getAdminMemberName(
                    transaction.user_id,
                    profiles
                )
            )
        );

        const typeCell =
            createAdminTableCell(transaction.type);

        typeCell.className =
            transaction.type === "Deposit"
                ? "transaction-type deposit"
                : "transaction-type withdrawal";

        row.appendChild(typeCell);

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(transaction.amount)
            )
        );

        row.appendChild(
            createAdminTableCell(
                getAdminPaymentMethodLabel(
                    transaction.payment_method
                )
            )
        );

        row.appendChild(
            createAdminStatusCell(transaction.status)
        );

        row.appendChild(
            createAdminTableCell(
                formatAdminDateTime(transaction.created_at)
            )
        );

        const actionCell =
            document.createElement("td");

        const normalizedStatus =
            normalizeAdminStatus(transaction.status);

        const isDeposit =
            transaction.type === "Deposit";

        const canReverseDeposit =
            isDeposit &&
            normalizedStatus === "successful";

        const canCancelWithdrawal =
            !isDeposit &&
            normalizedStatus === "pending";

        if (canReverseDeposit || canCancelWithdrawal) {
            const actionButton =
                document.createElement("button");

            actionButton.type = "button";
            actionButton.className =
                "admin-action-button reject";

            actionButton.textContent = isDeposit
                ? "Reverse Deposit"
                : "Cancel Withdrawal";

            actionButton.addEventListener("click", () => {
                reverseNexusTransaction(
                    isDeposit ? "deposit" : "withdrawal",
                    transaction.id,
                    transaction.amount,
                    actionButton
                );
            });

            actionCell.appendChild(actionButton);

        } else if (
            !isDeposit &&
            ["processing", "completed"].includes(normalizedStatus)
        ) {
            actionCell.textContent =
                "Payout verification required";

        } else {
            actionCell.textContent = "No action";
        }

        row.appendChild(actionCell);
        table.appendChild(row);
    });

    console.log(
        "Admin financial transactions displayed:",
        {
            deposits: deposits.length,
            withdrawals: withdrawals.length,
            total: transactions.length
        }
    );
}


/* =========================================================
   25. RENDER DATE-FILTERED FINANCIAL DASHBOARD
========================================================= */

function renderAdminDateFilteredDashboard() {
    const deposits =
        getAdminFilteredDeposits();

    const withdrawals =
        getAdminFilteredWithdrawals();

    const profiles =
        adminProfilesCache;

    updateAdminDateFilterSummary();

    const successfulDeposits =
        deposits.filter(deposit =>
            normalizeAdminStatus(deposit.status) === "successful"
        );

    const totalDeposits =
        successfulDeposits.reduce((total, deposit) => {
            return total + getAdminNumber(deposit.amount);
        }, 0);

    const totalDepositsElement =
        document.getElementById("totalDeposits");

    if (totalDepositsElement) {
        totalDepositsElement.textContent =
            adminDepositsAvailable
                ? formatNexusAdminMoney(totalDeposits)
                : "Unavailable";
    }

    const completedWithdrawals =
        withdrawals.filter(withdrawal =>
            normalizeAdminStatus(withdrawal.status) === "completed"
        );

    const totalWithdrawals =
        completedWithdrawals.reduce((total, withdrawal) => {
            return total + getAdminNumber(withdrawal.amount);
        }, 0);

    const totalWithdrawalsElement =
        document.getElementById("totalWithdrawals");

    if (totalWithdrawalsElement) {
        totalWithdrawalsElement.textContent =
            formatNexusAdminMoney(totalWithdrawals);
    }

    const pending =
        withdrawals.filter(withdrawal =>
            normalizeAdminStatus(withdrawal.status) === "pending"
        ).length;

    const processing =
        withdrawals.filter(withdrawal =>
            normalizeAdminStatus(withdrawal.status) === "processing"
        ).length;

    const completed = completedWithdrawals.length;

    const pendingElement =
        document.getElementById("overviewPendingWithdrawals");

    const processingElement =
        document.getElementById("overviewProcessingWithdrawals");

    const completedElement =
        document.getElementById("overviewCompletedWithdrawals");

    if (pendingElement) pendingElement.textContent = pending;
    if (processingElement) processingElement.textContent = processing;
    if (completedElement) completedElement.textContent = completed;

    const withdrawalBadge =
        document.getElementById("pendingWithdrawalBadge");

    if (withdrawalBadge) {
        withdrawalBadge.textContent = pending;
        withdrawalBadge.hidden = pending === 0;
    }

    displayAdminWithdrawals(
        withdrawals,
        profiles
    );

    displayAdminSavings(
        adminWalletsCache,
        profiles,
        deposits,
        withdrawals,
        adminDepositsAvailable
    );

    if (adminDepositsAvailable) {
        displayAdminDeposits(
            deposits,
            profiles
        );
    } else {
        showAdminTableMessage(
            "depositsTable",
            8,
            "Deposit records are currently unavailable."
        );
    }

    updateAdminDepositStatistics(
        deposits,
        adminDepositsAvailable
    );

    displayAdminTransactions(
        deposits,
        withdrawals,
        profiles
    );

    const openModal =
        document.getElementById("memberProfileModal");

    if (
        openModal &&
        !openModal.hidden &&
        openModal.dataset.memberId
    ) {
        openAdminMemberProfile(
            openModal.dataset.memberId
        );
    }
}


/* Date filter events */

if (adminDateRangeSelect) {
    adminDateRangeSelect.addEventListener(
        "change",
        function() {
            const preset = this.value;

            if (preset === "custom") {
                if (adminDateFilterMessage) {
                    adminDateFilterMessage.textContent =
                        "Choose your From Date and To Date, then click Apply Filter.";
                }
                return;
            }

            setAdminQuickDateRange(preset);
        }
    );
}

if (applyAdminDateFilterButton) {
    applyAdminDateFilterButton.addEventListener(
        "click",
        applyAdminCustomDateRange
    );
}

if (resetAdminDateFilterButton) {
    resetAdminDateFilterButton.addEventListener(
        "click",
        function() {
            if (adminDateRangeSelect) {
                adminDateRangeSelect.value = "this_month";
            }

            setAdminQuickDateRange("this_month");
        }
    );
}

setAdminQuickDateRange("this_month");


/* =========================================================
   26. ADMINISTRATOR LOGIN
========================================================= */

if (adminLoginForm) {
    adminLoginForm.addEventListener(
        "submit",
        async function(event) {
            event.preventDefault();

            const email = document
                .getElementById("adminEmail")
                ?.value.trim().toLowerCase();

            const password = document
                .getElementById("adminPassword")
                ?.value;

            if (!email || !password) {
                if (adminLoginMessage) {
                    adminLoginMessage.textContent =
                        "Enter your administrator email and password.";
                }
                return;
            }

            if (email !== AUTHORIZED_ADMIN_EMAIL) {
                if (adminLoginMessage) {
                    adminLoginMessage.textContent =
                        "This email is not authorized for administrator access.";
                }
                return;
            }

            if (adminLoginButton) {
                adminLoginButton.disabled = true;
                adminLoginButton.textContent = "Signing In...";
            }

            if (adminLoginMessage) {
                adminLoginMessage.textContent = "";
            }

            try {
                const { data, error } =
                    await nexusAdminSupabase.auth
                        .signInWithPassword({
                            email,
                            password
                        });

                if (error) throw error;

                if (!data.user) {
                    throw new Error(
                        "Unable to verify your account."
                    );
                }

                const authenticatedEmail =
                    (data.user.email || "")
                        .trim()
                        .toLowerCase();

                if (
                    authenticatedEmail !==
                    AUTHORIZED_ADMIN_EMAIL
                ) {
                    await nexusAdminSupabase.auth.signOut();

                    throw new Error(
                        "This account is not authorized to access the admin dashboard."
                    );
                }

                await showAdminDashboard(
                    authenticatedEmail
                );

                console.log(
                    "Administrator authenticated successfully."
                );

            } catch (error) {
                console.error(
                    "Administrator login error:",
                    error
                );

                if (adminLoginMessage) {
                    adminLoginMessage.textContent =
                        error.message ||
                        "Login failed. Please check your details.";
                }

            } finally {
                if (adminLoginButton) {
                    adminLoginButton.disabled = false;
                    adminLoginButton.textContent =
                        "Sign In to Dashboard";
                }
            }
        }
    );
}


/* =========================================================
   27. SHOW ADMIN DASHBOARD
========================================================= */

async function showAdminDashboard(email) {
    console.log(
        "Verifying Nexus administrator..."
    );

    if (adminLoginScreen) {
        adminLoginScreen.hidden = false;
    }

    if (adminDashboard) {
        adminDashboard.hidden = true;
    }

    const { data, error } =
        await nexusAdminSupabase.rpc(
            "is_nexus_admin"
        );

    if (error) {
        console.error(
            "Administrator verification failed:",
            error
        );

        throw new Error(
            "Supabase administrator verification failed: " +
            error.message
        );
    }

    if (data !== true) {
        await nexusAdminSupabase.auth.signOut();
        showAdminLogin();

        throw new Error(
            "Your account is not registered as an authorized administrator."
        );
    }

    const {
        data: adminUserData,
        error: adminUserError
    } = await nexusAdminSupabase.auth.getUser();

    if (adminUserError || !adminUserData.user) {
        throw new Error(
            "Could not verify the administrator account."
        );
    }

    currentAdminUserId =
        adminUserData.user.id;

    if (adminLoginScreen) {
        adminLoginScreen.hidden = true;
    }

    if (adminDashboard) {
        adminDashboard.hidden = false;
    }

    if (adminProfileEmail) {
        adminProfileEmail.textContent = email;
    }

    showAdminPage("overview");

    try {
        await loadAdminDashboardData();

    } catch (error) {
        console.error(
            "Dashboard data loading error:",
            error
        );

        alert(
            "Dashboard opened, but some records could not load: " +
            error.message
        );
    }
}


/* =========================================================
   28. CHECK EXISTING LOGIN SESSION
========================================================= */

async function checkAdminSession() {
    try {
        const { data, error } =
            await nexusAdminSupabase.auth.getSession();

        if (error) throw error;

        const user = data.session?.user;

        if (!user) {
            showAdminLogin();
            return;
        }

        const email =
            (user.email || "")
                .trim()
                .toLowerCase();

        if (email !== AUTHORIZED_ADMIN_EMAIL) {
            await nexusAdminSupabase.auth.signOut();
            showAdminLogin();
            return;
        }

        await showAdminDashboard(email);

    } catch (error) {
        console.error(
            "Admin session error:",
            error
        );

        showAdminLogin();
    }
}


/* =========================================================
   29. ADMIN SIGN OUT
========================================================= */

if (adminLogoutButton) {
    adminLogoutButton.addEventListener(
        "click",
        async function() {
            const confirmed = window.confirm(
                "Are you sure you want to sign out?"
            );

            if (!confirmed) return;

            adminLogoutButton.disabled = true;

            try {
                const { error } =
                    await nexusAdminSupabase.auth.signOut();

                if (error) throw error;

                showAdminLogin();

            } catch (error) {
                console.error(
                    "Admin logout error:",
                    error
                );

                alert(
                    "Unable to sign out. Please try again."
                );

            } finally {
                adminLogoutButton.disabled = false;
            }
        }
    );
}


nexusAdminSupabase.auth.onAuthStateChange(
    (event) => {
        if (event === "SIGNED_OUT") {
            showAdminLogin();
        }
    }
);


/* =========================================================
   30. ADMIN WITHDRAWAL REVIEW
========================================================= */

async function reviewNexusWithdrawal(
    requestId,
    action,
    button
) {
    if (
        !["processing", "rejected"].includes(action)
    ) {
        alert("Invalid withdrawal action.");
        return;
    }

    const confirmationMessage =
        action === "rejected"
            ? "Are you sure you want to reject this withdrawal?\n\nThe database function will change the request status. It will not deduct or refund wallet funds."
            : "Are you sure you want to move this withdrawal to processing?\n\nThe member must have an Active account.";

    if (!window.confirm(confirmationMessage)) {
        return;
    }

    const originalText =
        button?.textContent || "";

    if (button) {
        button.disabled = true;
        button.textContent = "Updating...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_review_withdrawal",
                {
                    p_request_id: requestId,
                    p_action: action
                }
            );

        if (error) throw error;

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "Withdrawal update failed."
            );
        }

        alert(
            data.message ||
            (
                action === "rejected"
                    ? "Withdrawal rejected successfully."
                    : "Withdrawal moved to processing successfully."
            )
        );

        await loadAdminDashboardData();

    } catch (error) {
        console.error(
            "Withdrawal review error:",
            error
        );

        alert(
            "Unable to update withdrawal: " +
            error.message
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


/* =========================================================
   31. DEPOSIT TRANSACTION TRASH
========================================================= */

const refreshTrashButton =
    document.getElementById("refreshTrashButton");

const trashTransactionsTable =
    document.getElementById("trashTransactionsTable");

const trashCountBadge =
    document.getElementById("trashCountBadge");


async function moveDepositToTrash(
    depositId,
    button
) {
    if (!depositId) {
        alert("Transaction ID is missing.");
        return;
    }

    const confirmed = window.confirm(
        "Move this deposit transaction to Trash? You can restore it later. This action will not directly change the member's wallet balance."
    );

    if (!confirmed) return;

    const originalText =
        button?.textContent || "Delete";

    if (button) {
        button.disabled = true;
        button.textContent = "Moving...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_trash_deposit",
                {
                    p_deposit_id: depositId
                }
            );

        if (error) throw error;

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "Could not move this transaction to Trash."
            );
        }

        alert(
            data.message ||
            "Transaction moved to Trash successfully."
        );

        await loadAdminDashboardData();

    } catch (error) {
        console.error(
            "Move deposit to Trash error:",
            error
        );

        alert(
            error.message ||
            "Unable to move this transaction to Trash."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


/* Load trash using the confirmed SETOF return type */

async function loadAdminTrash() {
    if (!trashTransactionsTable) return;

    if (trashCountBadge) {
        trashCountBadge.hidden = true;
    }

    showAdminTableMessage(
        "trashTransactionsTable",
        7,
        "Loading deleted transactions..."
    );

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_list_deposit_trash"
            );

        if (error) throw error;

        const trashRecords =
            Array.isArray(data) ? data : [];

        if (trashCountBadge) {
            trashCountBadge.textContent =
                trashRecords.length;

            trashCountBadge.hidden =
                trashRecords.length === 0;
        }

        if (!trashRecords.length) {
            showAdminTableMessage(
                "trashTransactionsTable",
                7,
                "Your Trash is empty."
            );
            return;
        }

        trashTransactionsTable.replaceChildren();

        trashRecords.forEach(deposit => {
            const row = document.createElement("tr");

            row.appendChild(
                createAdminTableCell(
                    deposit.reference || deposit.id
                )
            );

            row.appendChild(
                createAdminTableCell(
                    getAdminMemberName(
                        deposit.user_id,
                        adminProfilesCache
                    )
                )
            );

            row.appendChild(
                createAdminTableCell(
                    formatNexusAdminMoney(deposit.amount)
                )
            );

            row.appendChild(
                createAdminTableCell(
                    getAdminPaymentMethodLabel(
                        deposit.payment_method
                    )
                )
            );

            row.appendChild(
                createAdminStatusCell(deposit.status)
            );

            row.appendChild(
                createAdminTableCell(
                    formatAdminDateTime(deposit.deleted_at)
                )
            );

            const actionCell =
                document.createElement("td");

            const restoreButton =
                document.createElement("button");

            restoreButton.type = "button";
            restoreButton.textContent = "Restore";
            restoreButton.className =
                "admin-action-button";

            restoreButton.addEventListener("click", () => {
                restoreDepositFromTrash(
                    deposit.id,
                    restoreButton
                );
            });

            actionCell.appendChild(restoreButton);
            row.appendChild(actionCell);

            trashTransactionsTable.appendChild(row);
        });

        console.log(
            "Nexus Trash loaded:",
            trashRecords.length
        );

    } catch (error) {
        console.error(
            "Trash loading error:",
            error
        );

        showAdminTableMessage(
            "trashTransactionsTable",
            7,
            "Unable to load Trash: " + error.message
        );
    }
}


async function restoreDepositFromTrash(
    depositId,
    button
) {
    if (!depositId) {
        alert("Transaction ID is missing.");
        return;
    }

    const confirmed = window.confirm(
        "Restore this deposit transaction? It will return to the Deposits page."
    );

    if (!confirmed) return;

    const originalText =
        button?.textContent || "Restore";

    if (button) {
        button.disabled = true;
        button.textContent = "Restoring...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_restore_deposit",
                {
                    p_deposit_id: depositId
                }
            );

        if (error) throw error;

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "Could not restore this transaction."
            );
        }

        alert(
            data.message ||
            "Transaction restored successfully."
        );

        await loadAdminDashboardData();

    } catch (error) {
        console.error(
            "Restore deposit error:",
            error
        );

        alert(
            error.message ||
            "Unable to restore this transaction."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


if (refreshTrashButton) {
    refreshTrashButton.addEventListener(
        "click",
        async function() {
            refreshTrashButton.disabled = true;

            const originalText =
                refreshTrashButton.textContent;

            refreshTrashButton.textContent =
                "Refreshing...";

            try {
                await loadAdminTrash();

            } finally {
                refreshTrashButton.disabled = false;
                refreshTrashButton.textContent =
                    originalText;
            }
        }
    );
}


/* =========================================================
   32. LOAD ALL DASHBOARD RECORDS
   REFRESH REQUESTS ARE QUEUED SAFELY
========================================================= */

async function loadAdminDashboardData() {
    /*
       If a load is already running, request another complete
       load after the current one finishes.
    */

    if (adminDashboardLoadPromise) {
        adminDashboardRefreshRequested = true;

        return adminDashboardLoadPromise;
    }

    adminDashboardLoadPromise = (async () => {
        let loadError = null;

        try {
            do {
                adminDashboardRefreshRequested = false;

                if (refreshDepositsButton) {
                    refreshDepositsButton.disabled = true;
                    refreshDepositsButton.textContent =
                        "Refreshing...";
                }

                console.log(
                    "Loading Nexus admin dashboard data..."
                );

                const [
                    profilesResult,
                    walletsResult,
                    withdrawalsResult,
                    depositsResult
                ] = await Promise.all([
                    nexusAdminSupabase
                        .from("profiles")
                        .select(
                            "id, full_name, phone, member_id, email, status, created_at"
                        )
                        .order(
                            "created_at",
                            { ascending: false }
                        ),

                    nexusAdminSupabase
                        .from("wallets")
                        .select(
                            "id, user_id, balance, total_deposits, total_withdrawals"
                        ),

                    nexusAdminSupabase
                        .from("withdrawal_requests")
                        .select(
                            "id, user_id, amount, withdrawal_method, payment_details, status, created_at, completed_at"
                        )
                        .order(
                            "created_at",
                            { ascending: false }
                        ),

                    nexusAdminSupabase
                        .from("deposit_transactions")
                        .select(
                            "id, user_id, amount, payment_method, payment_phone, reference, status, created_at, paid_at, deleted_at"
                        )
                        .is("deleted_at", null)
                        .order(
                            "created_at",
                            { ascending: false }
                        )
                ]);

                if (profilesResult.error) {
                    throw profilesResult.error;
                }

                if (walletsResult.error) {
                    throw walletsResult.error;
                }

                if (withdrawalsResult.error) {
                    throw withdrawalsResult.error;
                }

                const profiles =
                    profilesResult.data || [];

                const wallets =
                    walletsResult.data || [];

                const withdrawals =
                    withdrawalsResult.data || [];

                const depositsAvailable =
                    !depositsResult.error;

                const deposits =
                    depositsAvailable
                        ? (depositsResult.data || [])
                        : [];

                adminProfilesCache = profiles;
                adminWalletsCache = wallets;
                adminDepositsCache = deposits;
                adminWithdrawalsCache = withdrawals;
                adminDepositsAvailable = depositsAvailable;

                if (depositsResult.error) {
                    console.error(
                        "Deposit transaction loading error:",
                        depositsResult.error
                    );
                }

                const totalMembersElement =
                    document.getElementById("totalMembers");

                if (totalMembersElement) {
                    totalMembersElement.textContent =
                        profiles.length.toLocaleString("en-GH");
                }

                const totalBalances =
                    wallets.reduce((sum, wallet) => {
                        return sum +
                            getMemberDisplayBalance(wallet);
                    }, 0);

                const totalWalletBalancesElement =
                    document.getElementById("totalWalletBalances");

                if (totalWalletBalancesElement) {
                    totalWalletBalancesElement.textContent =
                        formatNexusAdminMoney(totalBalances);
                }

                displayAdminMembers(profiles);

                renderAdminDateFilteredDashboard();

                await loadAdminTrash();

                console.log(
                    "Nexus admin dashboard data loaded.",
                    {
                        members: profiles.length,
                        wallets: wallets.length,
                        totalWalletBalances: totalBalances,
                        depositTransactions: deposits.length,
                        withdrawalRequests: withdrawals.length,
                        totalFinancialTransactions:
                            deposits.length + withdrawals.length,
                        selectedDateRange: adminDateFilterState
                    }
                );

            } while (adminDashboardRefreshRequested);

        } catch (error) {
            loadError = error;

            console.error(
                "Dashboard data loading error:",
                error
            );

        } finally {
            adminDashboardLoadPromise = null;

            if (refreshDepositsButton) {
                refreshDepositsButton.disabled = false;
                refreshDepositsButton.textContent =
                    "↻ Refresh Deposits";
            }
        }

        if (loadError) {
            throw loadError;
        }
    })();

    return adminDashboardLoadPromise;
}


/* =========================================================
   33. REFRESH DASHBOARD BUTTON
========================================================= */

if (refreshDepositsButton) {
    refreshDepositsButton.addEventListener(
        "click",
        async function() {
            try {
                await loadAdminDashboardData();

            } catch (error) {
                console.error(
                    "Dashboard refresh error:",
                    error
                );

                alert(
                    "Could not refresh dashboard records: " +
                    error.message
                );
            }
        }
    );
}


/* =========================================================
   34. NEXUS TELLER MANAGEMENT SYSTEM
========================================================= */

const createTellerForm =
    document.getElementById("createTellerForm");

const createTellerButton =
    document.getElementById("createTellerButton");

const createTellerMessage =
    document.getElementById("createTellerMessage");

const tellerSearchInput =
    document.getElementById("tellerSearchInput");

const tellersTable =
    document.getElementById("tellersTable");

const refreshTellersButton =
    document.getElementById("refreshTellersButton");


/* Teller statistics */

function updateAdminTellerStatistics(tellers = []) {
    const total =
        document.getElementById("tellerTotalCount");

    const active =
        document.getElementById("activeTellerCount");

    const suspended =
        document.getElementById("suspendedTellerCount");

    const inactive =
        document.getElementById("inactiveTellerCount");

    const badge =
        document.getElementById("tellerCountBadge");

    const activeCount = tellers.filter(
        teller =>
            normalizeAdminStatus(teller.status) === "active"
    ).length;

    const suspendedCount = tellers.filter(
        teller =>
            normalizeAdminStatus(teller.status) === "suspended"
    ).length;

    const inactiveCount = tellers.filter(
        teller =>
            normalizeAdminStatus(teller.status) === "inactive"
    ).length;

    if (total) {
        total.textContent =
            tellers.length.toLocaleString("en-GH");
    }

    if (active) {
        active.textContent =
            activeCount.toLocaleString("en-GH");
    }

    if (suspended) {
        suspended.textContent =
            suspendedCount.toLocaleString("en-GH");
    }

    if (inactive) {
        inactive.textContent =
            inactiveCount.toLocaleString("en-GH");
    }

    if (badge) {
        badge.textContent = tellers.length;
        badge.hidden = tellers.length === 0;
    }
}


/* Display teller directory */

function displayAdminTellers(tellers = []) {
    if (!tellersTable) return;

    const searchTerm = String(
        tellerSearchInput?.value || ""
    ).trim().toLowerCase();

    const filteredTellers = tellers.filter(teller => {
        const searchableValues = [
            teller.teller_code,
            teller.full_name,
            teller.email,
            teller.phone,
            teller.status
        ];

        return searchableValues.some(value =>
            String(value || "")
                .toLowerCase()
                .includes(searchTerm)
        );
    });

    const results =
        document.getElementById("tellerSearchResults");

    if (results) {
        results.textContent = searchTerm
            ? `${filteredTellers.length} matching teller account(s) found.`
            : `${tellers.length} registered teller account(s).`;
    }

    updateAdminTellerStatistics(tellers);

    if (!filteredTellers.length) {
        showAdminTableMessage(
            "tellersTable",
            7,
            searchTerm
                ? "No teller accounts match your search."
                : "No teller accounts have been created yet."
        );
        return;
    }

    tellersTable.replaceChildren();

    filteredTellers.forEach(teller => {
        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(teller.teller_code)
        );

        row.appendChild(
            createAdminTableCell(teller.full_name)
        );

        row.appendChild(
            createAdminTableCell(teller.email)
        );

        row.appendChild(
            createAdminTableCell(teller.phone)
        );

        row.appendChild(
            createAdminTableCell(
                formatAdminDate(teller.created_at)
            )
        );

        const statusCell =
            document.createElement("td");

        const statusLabel =
            document.createElement("span");

        const status =
            normalizeAdminStatus(teller.status);

        statusLabel.className =
            "member-status " +
            (
                ["active", "suspended", "inactive"]
                    .includes(status)
                    ? status
                    : "unknown"
            );

        statusLabel.textContent =
            status.toUpperCase();

        statusCell.appendChild(statusLabel);
        row.appendChild(statusCell);

        const actionCell =
            document.createElement("td");

        const createActionButton = (
            label,
            action,
            className = "admin-action-button"
        ) => {
            const button =
                document.createElement("button");

            button.type = "button";
            button.textContent = label;
            button.className = className;

            button.addEventListener("click", () => {
                updateAdminTellerStatus(
                    teller.user_id,
                    action,
                    button
                );
            });

            return button;
        };

        if (status === "active") {
            actionCell.appendChild(
                createActionButton(
                    "Suspend",
                    "suspended"
                )
            );

            actionCell.appendChild(
                createActionButton(
                    "Deactivate",
                    "inactive",
                    "admin-action-button reject"
                )
            );

        } else if (status === "suspended") {
            actionCell.appendChild(
                createActionButton(
                    "Activate",
                    "active"
                )
            );

            actionCell.appendChild(
                createActionButton(
                    "Deactivate",
                    "inactive",
                    "admin-action-button reject"
                )
            );

        } else if (status === "inactive") {
            actionCell.appendChild(
                createActionButton(
                    "Activate",
                    "active"
                )
            );

        } else {
            actionCell.textContent = "No action";
        }

        row.appendChild(actionCell);
        tellersTable.appendChild(row);
    });
}


/* =========================================================
   35. LOAD TELLER ACCOUNTS
   REFRESH REQUESTS ARE QUEUED SAFELY
========================================================= */

async function loadAdminTellers() {
    if (!tellersTable) return;

    if (adminTellersLoadPromise) {
        adminTellersRefreshRequested = true;
        return adminTellersLoadPromise;
    }

    adminTellersLoadPromise = (async () => {
        let loadError = null;

        try {
            do {
                adminTellersRefreshRequested = false;

                showAdminTableMessage(
                    "tellersTable",
                    7,
                    "Loading teller accounts..."
                );

                const { data, error } =
                    await nexusAdminSupabase
                        .from("nexus_tellers")
                        .select(`
                            user_id,
                            teller_code,
                            full_name,
                            email,
                            phone,
                            status,
                            created_at,
                            updated_at
                        `)
                        .order(
                            "created_at",
                            { ascending: false }
                        );

                if (error) throw error;

                adminTellersCache = data || [];

                displayAdminTellers(adminTellersCache);

                console.log(
                    "Nexus teller accounts loaded:",
                    adminTellersCache.length
                );

            } while (adminTellersRefreshRequested);

        } catch (error) {
            loadError = error;

            console.error(
                "Teller loading error:",
                error
            );

            showAdminTableMessage(
                "tellersTable",
                7,
                "Unable to load teller accounts: " +
                error.message
            );

            if (createTellerMessage) {
                createTellerMessage.textContent =
                    "Teller records could not be loaded.";
            }

        } finally {
            adminTellersLoadPromise = null;
        }

        if (loadError) {
            throw loadError;
        }
    })();

    return adminTellersLoadPromise;
}


/* =========================================================
   36. CREATE NEW TELLER ACCOUNT
========================================================= */

if (createTellerForm) {
    createTellerForm.addEventListener(
        "submit",
        async function(event) {
            event.preventDefault();

            const fullName =
                document.getElementById("tellerFullName")
                    ?.value.trim();

            const email =
                document.getElementById("tellerEmail")
                    ?.value.trim().toLowerCase();

            const phone =
                document.getElementById("tellerPhone")
                    ?.value.trim();

            if (!fullName || !email || !phone) {
                if (createTellerMessage) {
                    createTellerMessage.textContent =
                        "Please complete all teller details.";
                }
                return;
            }

            if (fullName.length < 2) {
                if (createTellerMessage) {
                    createTellerMessage.textContent =
                        "Enter a valid teller full name.";
                }
                return;
            }

            const confirmed = window.confirm(
                "Create a teller account for " +
                fullName +
                "?\n\nAn email invitation will be sent to " +
                email +
                "."
            );

            if (!confirmed) return;

            const originalText =
                createTellerButton?.textContent ||
                "+ Create Teller";

            if (createTellerButton) {
                createTellerButton.disabled = true;
                createTellerButton.textContent =
                    "Creating Account...";
            }

            if (createTellerMessage) {
                createTellerMessage.textContent =
                    "Creating teller account and sending invitation...";
            }

            try {
                const { data, error } =
                    await nexusAdminSupabase.functions.invoke(
                        "create-nexus-teller",
                        {
                            body: {
                                full_name: fullName,
                                email,
                                phone
                            }
                        }
                    );

                if (error) {
                    let details = "";

                    try {
                        const response = error.context;

                        if (
                            response &&
                            typeof response.json === "function"
                        ) {
                            const result =
                                await response.json();

                            details =
                                result.message || "";
                        }
                    } catch (_) {
                        // Keep original error.
                    }

                    throw new Error(
                        details ||
                        error.message ||
                        "The teller creation service could not be reached."
                    );
                }

                if (!data || data.success !== true) {
                    throw new Error(
                        data?.message ||
                        "The teller account could not be created."
                    );
                }

                createTellerForm.reset();

                if (createTellerMessage) {
                    createTellerMessage.textContent =
                        "Teller account created successfully. " +
                        "Invitation sent to " +
                        email +
                        ". Teller Code: " +
                        (data.teller?.teller_code || "Created");
                }

                alert(
                    "Teller account created successfully.\n\n" +
                    "Name: " + fullName + "\n" +
                    "Email: " + email + "\n" +
                    "Teller Code: " +
                    (data.teller?.teller_code || "Created") +
                    "\n\nThe teller should check their email to set their password."
                );

                await loadAdminTellers();

            } catch (error) {
                console.error(
                    "Create teller error:",
                    error
                );

                if (createTellerMessage) {
                    createTellerMessage.textContent =
                        error.message ||
                        "Unable to create teller account.";
                }

                alert(
                    error.message ||
                    "Teller account creation failed."
                );

            } finally {
                if (createTellerButton) {
                    createTellerButton.disabled = false;
                    createTellerButton.textContent =
                        originalText;
                }
            }
        }
    );
}


/* =========================================================
   37. UPDATE TELLER ACCOUNT STATUS
========================================================= */

async function updateAdminTellerStatus(
    userId,
    newStatus,
    button
) {
    if (
        !userId ||
        !["active", "suspended", "inactive"]
            .includes(newStatus)
    ) {
        alert("Invalid teller account details.");
        return;
    }

    const teller = adminTellersCache.find(
        item => item.user_id === userId
    );

    if (!teller) {
        alert("Teller account could not be found.");
        return;
    }

    const actionLabels = {
        active: "activate",
        suspended: "suspend",
        inactive: "deactivate"
    };

    const confirmed = window.confirm(
        "Are you sure you want to " +
        actionLabels[newStatus] +
        " the teller account belonging to " +
        (teller.full_name || teller.email || "this teller") +
        "?"
    );

    if (!confirmed) return;

    const originalText =
        button?.textContent || "";

    if (button) {
        button.disabled = true;
        button.textContent = "Updating...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_update_nexus_teller_status",
                {
                    p_user_id: userId,
                    p_new_status: newStatus
                }
            );

        if (error) throw error;

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "Teller account status could not be updated."
            );
        }

        alert(
            data.message ||
            "Teller account updated successfully."
        );

        await loadAdminTellers();

    } catch (error) {
        console.error(
            "Teller status update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update teller account."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


/* =========================================================
   38. TELLER SEARCH
========================================================= */

if (tellerSearchInput) {
    tellerSearchInput.addEventListener(
        "input",
        function() {
            displayAdminTellers(
                adminTellersCache
            );
        }
    );
}


/* =========================================================
   39. REFRESH TELLER DIRECTORY
========================================================= */

if (refreshTellersButton) {
    refreshTellersButton.addEventListener(
        "click",
        async function() {
            const originalText =
                refreshTellersButton.textContent;

            refreshTellersButton.disabled = true;
            refreshTellersButton.textContent =
                "Refreshing...";

            try {
                await loadAdminTellers();

            } catch (error) {
                console.error(
                    "Teller refresh error:",
                    error
                );

                alert(
                    "Could not refresh teller records: " +
                    error.message
                );

            } finally {
                refreshTellersButton.disabled = false;
                refreshTellersButton.textContent =
                    originalText;
            }
        }
    );
}


/* =========================================================
   40. ADMIN NOTIFICATION DATABASE INTEGRATION
========================================================= */

const adminNotificationsList =
    document.getElementById("adminNotificationsList");

const refreshAdminNotificationsButton =
    document.getElementById("refreshAdminNotifications");

let adminNotificationsCache = [];
let adminNotificationsLoadPromise = null;


function updateAdminNotificationBadge() {
    const unreadCount =
        adminNotificationsCache.filter(
            notification => !notification.is_read
        ).length;

    const badge =
        document.getElementById("adminNotificationBadge");

    if (badge) {
        badge.textContent = unreadCount;
        badge.hidden = unreadCount === 0;
    }
}


function displayAdminNotifications(notifications = []) {
    if (!adminNotificationsList) return;

    adminNotificationsList.replaceChildren();

    if (!notifications.length) {
        const empty = document.createElement("p");

        empty.className = "empty-table";
        empty.textContent = "No notifications found.";

        adminNotificationsList.appendChild(empty);

        updateAdminNotificationBadge();
        return;
    }

    notifications.forEach(notification => {
        const card = document.createElement("div");

        card.className =
            "admin-notification-item" +
            (notification.is_read ? " read" : " unread");

        const heading = document.createElement("h4");
        heading.textContent =
            notification.title || "Notification";

        const message = document.createElement("p");
        message.textContent =
            notification.message || "";

        const details = document.createElement("small");

        const profile = adminProfilesCache.find(
            item => item.id === notification.user_id
        );

        details.textContent =
            (profile?.full_name ||
                profile?.member_id ||
                "Member") +
            " · " +
            (notification.type || "account") +
            " · " +
            formatAdminDateTime(notification.created_at);

        card.appendChild(heading);
        card.appendChild(message);
        card.appendChild(details);

        if (!notification.is_read) {
            const markReadButton =
                document.createElement("button");

            markReadButton.type = "button";
            markReadButton.textContent = "Mark as read";
            markReadButton.className =
                "admin-action-button";

            markReadButton.addEventListener("click", () => {
                markAdminNotificationRead(
                    notification.id,
                    markReadButton
                );
            });

            card.appendChild(markReadButton);
        } else {
            const readLabel =
                document.createElement("small");

            readLabel.textContent = "Read";
            card.appendChild(readLabel);
        }

        adminNotificationsList.appendChild(card);
    });

    updateAdminNotificationBadge();
}


async function loadAdminNotifications() {
    if (!adminNotificationsList) return;

    if (adminNotificationsLoadPromise) {
        return adminNotificationsLoadPromise;
    }

    adminNotificationsLoadPromise = (async () => {
        adminNotificationsList.textContent =
            "Loading notifications...";

        try {
            const { data, error } =
                await nexusAdminSupabase.rpc(
                    "admin_list_nexus_notifications"
                );

            if (error) throw error;

            adminNotificationsCache =
                Array.isArray(data) ? data : [];

            displayAdminNotifications(
                adminNotificationsCache
            );

            console.log(
                "Administrator notifications loaded:",
                adminNotificationsCache.length
            );

        } catch (error) {
            console.error(
                "Administrator notification loading error:",
                error
            );

            adminNotificationsList.textContent =
                "Unable to load notifications: " +
                error.message;

            throw error;

        } finally {
            adminNotificationsLoadPromise = null;
        }
    })();

    return adminNotificationsLoadPromise;
}


async function markAdminNotificationRead(
    notificationId,
    button
) {
    if (!notificationId) return;

    const originalText =
        button?.textContent || "Mark as read";

    if (button) {
        button.disabled = true;
        button.textContent = "Updating...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_mark_nexus_notification_read",
                {
                    p_notification_id: notificationId
                }
            );

        if (error) throw error;

        if (data !== true) {
            throw new Error(
                "Notification could not be marked as read."
            );
        }

        const notification =
            adminNotificationsCache.find(
                item => item.id === notificationId
            );

        if (notification) {
            notification.is_read = true;
        }

        displayAdminNotifications(
            adminNotificationsCache
        );

    } catch (error) {
        console.error(
            "Mark notification as read error:",
            error
        );

        alert(
            error.message ||
            "Unable to update notification."
        );

        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


async function markAllAdminNotificationsRead() {
    const unreadCount =
        adminNotificationsCache.filter(
            item => !item.is_read
        ).length;

    if (!unreadCount) {
        alert("There are no unread notifications.");
        return;
    }

    if (!window.confirm(
        "Mark all administrator notifications as read?"
    )) {
        return;
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_mark_all_nexus_notifications_read"
            );

        if (error) throw error;

        adminNotificationsCache.forEach(item => {
            item.is_read = true;
        });

        displayAdminNotifications(
            adminNotificationsCache
        );

        alert(
            `${Number(data) || 0} notification(s) marked as read.`
        );

    } catch (error) {
        console.error(
            "Mark all notifications as read error:",
            error
        );

        alert(
            error.message ||
            "Unable to mark notifications as read."
        );
    }
}


if (refreshAdminNotificationsButton) {
    refreshAdminNotificationsButton.addEventListener(
        "click",
        async function() {
            const originalText =
                this.textContent;

            this.disabled = true;
            this.textContent = "Refreshing...";

            try {
                await loadAdminNotifications();

            } catch (_) {
                // Error is already displayed in the notifications area.
            } finally {
                this.disabled = false;
                this.textContent = originalText;
            }
        }
    );
}


const markAllAdminNotificationsButton =
    document.getElementById(
        "markAllAdminNotificationsRead"
    );

if (markAllAdminNotificationsButton) {
    markAllAdminNotificationsButton.addEventListener(
        "click",
        markAllAdminNotificationsRead
    );
}


/* =========================================================
   41. NEXUS ADMIN REPORTS
   Uses the global admin date filter
========================================================= */


/* ---------------------------------------------------------
   1. GET THE DATE RANGE
--------------------------------------------------------- */

function getNexusReportDateRange() {
    const state = adminDateFilterState || {};

    return {
        from: state.from || "",
        to: state.to || ""
    };
}


/* ---------------------------------------------------------
   2. GET THE CORRECT FINANCIAL DATE FOR EACH RECORD

   Deposits:
   - Successful: paid_at, otherwise created_at
   - Other statuses: created_at

   Withdrawals:
   - Completed: completed_at, otherwise created_at
   - Other statuses: created_at
--------------------------------------------------------- */

function getNexusReportDateKey(item, type) {
    if (!item) return "";

    let dateValue = item.created_at || null;

    const status = normalizeAdminStatus(item.status);

    if (type === "deposit" && status === "successful") {
        dateValue = item.paid_at || item.created_at || null;
    }

    if (type === "withdrawal" && status === "completed") {
        dateValue = item.completed_at || item.created_at || null;
    }

    if (!dateValue) return "";

    return getAdminGhanaDateKey(dateValue);
}


/* ---------------------------------------------------------
   3. CHECK WHETHER A RECORD IS INSIDE THE DATE RANGE
--------------------------------------------------------- */

function isNexusReportDateIncluded(item, type) {
    const range = getNexusReportDateRange();

    const dateKey = getNexusReportDateKey(item, type);

    if (!dateKey) return false;

    if (range.from && dateKey < range.from) {
        return false;
    }

    if (range.to && dateKey > range.to) {
        return false;
    }

    return true;
}


/* ---------------------------------------------------------
   4. GET FILTERED REPORT RECORDS

   These functions use the loaded admin caches and apply
   the selected date range directly.
--------------------------------------------------------- */

function getNexusReportDeposits() {
    const records = Array.isArray(adminDepositsCache)
        ? adminDepositsCache
        : [];

    return records.filter(item =>
        isNexusReportDateIncluded(item, "deposit")
    );
}


function getNexusReportWithdrawals() {
    const records = Array.isArray(adminWithdrawalsCache)
        ? adminWithdrawalsCache
        : [];

    return records.filter(item =>
        isNexusReportDateIncluded(item, "withdrawal")
    );
}


function getNexusReportNewMembers() {
    const records = Array.isArray(adminProfilesCache)
        ? adminProfilesCache
        : [];

    return records.filter(profile =>
        isNexusReportDateIncluded(profile, "member")
    );
}


/* ---------------------------------------------------------
   5. RENDER REPORTS
--------------------------------------------------------- */

function renderNexusAdminReports() {
    const deposits = getNexusReportDeposits();
    const withdrawals = getNexusReportWithdrawals();
    const newMembers = getNexusReportNewMembers();

    const successfulDeposits = deposits.filter(item =>
        normalizeAdminStatus(item.status) === "successful"
    );

    const completedWithdrawals = withdrawals.filter(item =>
        normalizeAdminStatus(item.status) === "completed"
    );

    const totalDepositAmount = successfulDeposits.reduce(
        (sum, item) =>
            sum + getAdminNumber(item.amount),
        0
    );

    const totalWithdrawalAmount = completedWithdrawals.reduce(
        (sum, item) =>
            sum + getAdminNumber(item.amount),
        0
    );

    const transactionCount =
        deposits.length + withdrawals.length;

    const reportValues = {
        reportDepositTotal: adminDepositsAvailable
            ? formatNexusAdminMoney(totalDepositAmount)
            : "Unavailable",

        reportWithdrawalTotal:
            formatNexusAdminMoney(totalWithdrawalAmount),

        reportNewMembers:
            newMembers.length.toLocaleString("en-GH"),

        reportTransactionCount:
            transactionCount.toLocaleString("en-GH")
    };

    Object.entries(reportValues).forEach(
        ([elementId, value]) => {
            const element =
                document.getElementById(elementId);

            if (element) {
                element.textContent = value;
            }
        }
    );

    const range = getNexusReportDateRange();

    const message =
        document.getElementById("adminReportMessage");

    if (message) {
        message.textContent =
            `Report period: ${range.from || "Beginning"} to ${range.to || "Today"}. ` +
            `${deposits.length} deposits, ` +
            `${withdrawals.length} withdrawals and ` +
            `${newMembers.length} new members found.`;
    }
}


/* ---------------------------------------------------------
   6. CSV EXPORT
--------------------------------------------------------- */

function exportNexusAdminReport() {
    if (!adminDepositsAvailable) {
        alert(
            "Deposit records are unavailable. The report cannot be exported as a complete financial report."
        );
        return;
    }

    const deposits = getNexusReportDeposits();
    const withdrawals = getNexusReportWithdrawals();

    const rows = [
        [
            "Reference",
            "Member",
            "Type",
            "Amount (GHS)",
            "Payment Method",
            "Status",
            "Date"
        ]
    ];

    deposits.forEach(deposit => {
        rows.push([
            deposit.reference || deposit.id,

            getAdminMemberName(
                deposit.user_id,
                adminProfilesCache
            ),

            "Deposit",

            getAdminNumber(deposit.amount).toFixed(2),

            getAdminPaymentMethodLabel(
                deposit.payment_method
            ),

            deposit.status,

            formatAdminDateTime(
                deposit.paid_at || deposit.created_at
            )
        ]);
    });

    withdrawals.forEach(withdrawal => {
        rows.push([
            "WDR-" + String(withdrawal.id).slice(0, 8),

            getAdminMemberName(
                withdrawal.user_id,
                adminProfilesCache
            ),

            "Withdrawal",

            getAdminNumber(withdrawal.amount).toFixed(2),

            getAdminPaymentMethodLabel(
                withdrawal.withdrawal_method
            ),

            withdrawal.status,

            formatAdminDateTime(
                withdrawal.completed_at ||
                withdrawal.created_at
            )
        ]);
    });

    const escapeCSV = value => {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection.
        if (/^[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    };

    const csv = rows
        .map(row => row.map(escapeCSV).join(","))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    const range = getNexusReportDateRange();

    link.download =
        "Nexus_Wealth_Report_" +
        (range.from || "Beginning") +
        "_to_" +
        (range.to || "Today") +
        ".csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


/* ---------------------------------------------------------
   7. CONNECT THE EXPORT BUTTON
--------------------------------------------------------- */

const exportAdminReportButton =
    document.getElementById("exportAdminReport");

if (exportAdminReportButton) {
    // Prevent duplicate click handlers.
    exportAdminReportButton.onclick =
        exportNexusAdminReport;
}


/* ---------------------------------------------------------
   8. REFRESH REPORTS WHEN THE DATE FILTER IS APPLIED
      OR RESET
--------------------------------------------------------- */

const applyReportDateFilterButton =
    document.getElementById("applyAdminDateFilter");

const resetReportDateFilterButton =
    document.getElementById("resetAdminDateFilter");

if (
    applyReportDateFilterButton &&
    !applyReportDateFilterButton.dataset.reportRefreshBound
) {
    applyReportDateFilterButton.dataset.reportRefreshBound = "true";

    applyReportDateFilterButton.addEventListener("click", () => {
        // Allow the existing date-filter handler to update
        // adminDateFilterState before rendering.
        setTimeout(() => {
            renderNexusAdminReports();
        }, 0);
    });
}

if (
    resetReportDateFilterButton &&
    !resetReportDateFilterButton.dataset.reportRefreshBound
) {
    resetReportDateFilterButton.dataset.reportRefreshBound = "true";

    resetReportDateFilterButton.addEventListener("click", () => {
        setTimeout(() => {
            renderNexusAdminReports();
        }, 0);
    });
}


/* =========================================================
   NEXUS WEALTH PARTNERS
   42. PLATFORM SETTINGS
========================================================= */

const NEXUS_SETTINGS_DEFAULTS = {
    platform_name: "NEXUS WEALTH PARTNERS",
    support_email: "",
    support_phone: ""
};

let nexusSettingsLoaded = false;


/* =========================================================
   42.1 SETTINGS MESSAGE
========================================================= */

function showNexusSettingsMessage(message, type = "info") {

    const element = document.getElementById(
        "adminSettingsMessage"
    );

    if (!element) return;

    element.textContent = message;

    element.dataset.type = type;
}


/* =========================================================
   42.2 LOAD SETTINGS
========================================================= */

async function loadNexusPlatformSettings() {

    const form = document.getElementById(
        "nexusGeneralSettingsForm"
    );

    if (!form) return;

    showNexusSettingsMessage(
        "Loading platform settings..."
    );

    try {

        const { data, error } =
            await nexusAdminSupabase
                .from("nexus_platform_settings")
                .select("setting_key, setting_value");

        if (error) throw error;

        const settings = {
            ...NEXUS_SETTINGS_DEFAULTS
        };

        (data || []).forEach(row => {

            if (
                Object.prototype.hasOwnProperty.call(
                    settings,
                    row.setting_key
                )
            ) {

                settings[row.setting_key] =
                    row.setting_value;
            }
        });

        document.getElementById(
            "nexusPlatformName"
        ).value = settings.platform_name || "";

        document.getElementById(
            "nexusSupportEmail"
        ).value = settings.support_email || "";

        document.getElementById(
            "nexusSupportPhone"
        ).value = settings.support_phone || "";

        nexusSettingsLoaded = true;

        showNexusSettingsMessage(
            "Platform settings loaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Nexus settings loading error:",
            error
        );

        showNexusSettingsMessage(
            "Could not load platform settings: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   42.3 SAVE ONE SETTING
========================================================= */

async function saveNexusPlatformSetting(
    settingKey,
    settingValue,
    description
) {

    const { data: authData, error: authError } =
        await nexusAdminSupabase.auth.getUser();

    if (authError) throw authError;

    const user = authData?.user;

    if (!user) {
        throw new Error(
            "Administrator session has expired. Please log in again."
        );
    }

    const { data: isAdmin, error: adminError } =
        await nexusAdminSupabase.rpc(
            "is_nexus_admin"
        );

    if (adminError) throw adminError;

    if (isAdmin !== true) {
        throw new Error(
            "Administrator permission could not be verified."
        );
    }

    const { error } = await nexusAdminSupabase
        .from("nexus_platform_settings")
        .upsert(
            {
                setting_key: settingKey,
                setting_value: settingValue,
                description: description,
                updated_by: user.id,
                updated_at: new Date().toISOString()
            },
            {
                onConflict: "setting_key"
            }
        );

    if (error) throw error;
}


/* =========================================================
   42.4 SAVE GENERAL SETTINGS
========================================================= */

async function saveNexusGeneralSettings(event) {

    event.preventDefault();

    const button = document.getElementById(
        "saveNexusGeneralSettings"
    );

    const platformName = document.getElementById(
        "nexusPlatformName"
    ).value.trim();

    const supportEmail = document.getElementById(
        "nexusSupportEmail"
    ).value.trim();

    const supportPhone = document.getElementById(
        "nexusSupportPhone"
    ).value.trim();

    if (!platformName) {

        showNexusSettingsMessage(
            "Platform name is required.",
            "error"
        );

        return;
    }

    if (
        supportEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)
    ) {

        showNexusSettingsMessage(
            "Enter a valid support email address.",
            "error"
        );

        return;
    }

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Saving...";

    showNexusSettingsMessage(
        "Saving platform settings..."
    );

    try {

        await saveNexusPlatformSetting(
            "platform_name",
            platformName,
            "Official platform name"
        );

        await saveNexusPlatformSetting(
            "support_email",
            supportEmail,
            "Platform customer support email"
        );

        await saveNexusPlatformSetting(
            "support_phone",
            supportPhone,
            "Platform customer support phone number"
        );

        showNexusSettingsMessage(
            "General platform settings saved successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Saving Nexus settings failed:",
            error
        );

        showNexusSettingsMessage(
            "Settings could not be saved: " +
            error.message,
            "error"
        );

    } finally {

        button.disabled = false;
        button.textContent = originalText;
    }
}


/* =========================================================
   42.5 INITIALIZE SETTINGS
========================================================= */

function initializeNexusPlatformSettings() {

    const form = document.getElementById(
        "nexusGeneralSettingsForm"
    );

    if (!form) return;

    if (form.dataset.initialized === "true") {
        return;
    }

    form.dataset.initialized = "true";

    form.addEventListener(
        "submit",
        saveNexusGeneralSettings
    );
}

initializeNexusPlatformSettings();


/* =========================================================
   40. START ADMIN DASHBOARD
========================================================= */

checkAdminSession();

console.log(
    "Nexus Wealth Partners Admin Dashboard initialized."
);


/* =========================================
   NEXUS WEALTH PARTNERS
   COMPLETE ADMINISTRATOR DASHBOARD
   CORRECTED COMPLETE VERSION
========================================= */


/* =========================================
   1. SUPABASE CONNECTION
========================================= */

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


/* =========================================
   2. ADMINISTRATOR SETTINGS
========================================= */

const AUTHORIZED_ADMIN_EMAIL =
    "bobeng2545@gmail.com";


/* =========================================
   3. ELEMENT REFERENCES
========================================= */

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


/* =========================================
   4. DASHBOARD PAGE TITLES
========================================= */

const adminPageTitles = {
    overview: "Dashboard Overview",
    members: "Members Management",
    tellers: "Tellers Management",
    withdrawals: "Withdrawal Requests",
    deposits: "Deposits Management",
    transactions: "Transactions",
    trash: "Transaction Trash",
    savings: "Savings Management"
};


/* =========================================
   5. GENERAL HELPER FUNCTIONS
========================================= */


/* FORMAT GHANA CURRENCY */

function formatNexusAdminMoney(amount) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}


/* CREATE SAFE TABLE CELL */

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


/* DISPLAY TABLE MESSAGE */

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


/* FORMAT DATE */

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


/* FORMAT DATE AND TIME */

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


/* GET MEMBER NAME */

function getAdminMemberName(userId, profiles = []) {
    const profile = profiles.find(
        item => item.id === userId
    );

    return profile?.full_name ||
        profile?.member_id ||
        userId ||
        "Unknown Member";
}


/* SAFE NUMBER */

function getAdminNumber(value) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


/* NORMALIZE STATUS */

function normalizeAdminStatus(status) {
    return String(status || "unknown")
        .trim()
        .toLowerCase();
}


/* PAYMENT METHOD LABELS */

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


/* CREATE STATUS CELL */

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


/* =========================================
   6. DASHBOARD CACHES
========================================= */

let adminProfilesCache = [];
let adminWalletsCache = [];
let adminDepositsCache = [];
let adminWithdrawalsCache = [];
let adminTellersCache = [];

let adminDepositsAvailable = true;
let currentAdminUserId = null;

let adminDashboardLoading = false;


/* =========================================
   7. WALLET BALANCE DISPLAY
========================================= */

/*
   DISPLAY THE ACTUAL BALANCE RETURNED
   BY THE DATABASE.

   Do not deduct withdrawals again here.
*/

function getMemberDisplayBalance(wallet) {
    return getAdminNumber(wallet?.balance);
}


/* =========================================
   8. SHOW ADMIN LOGIN
========================================= */

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


/* =========================================
   9. ADMIN PAGE NAVIGATION
========================================= */

function showAdminPage(pageName) {
    const selectedPage =
        document.getElementById("page-" + pageName);

    if (!selectedPage) {
        console.error(
            "Admin page not found:",
            pageName
        );
        return;
    }

    document.querySelectorAll(".admin-page")
        .forEach(page => {
            page.classList.remove("active");
        });

    document.querySelectorAll(".admin-nav-link")
        .forEach(link => {
            link.classList.remove("active");
        });

    selectedPage.classList.add("active");

    const activeLink = document.querySelector(
        '.admin-nav-link[data-page="' + pageName + '"]'
    );

    if (activeLink) {
        activeLink.classList.add("active");
    }

    if (adminPageTitle) {
        adminPageTitle.textContent =
            adminPageTitles[pageName] ||
            "Admin Dashboard";
    }

    if (adminSidebar) {
        adminSidebar.classList.remove("open");
    }

    if (pageName === "trash") {
       loadAdminTrash();
    }
   
   if (pageName === "tellers") {
      loadAdminTellers();
   }
}


/* NAVIGATION EVENTS */

document.querySelectorAll("[data-page]")
    .forEach(button => {
        button.addEventListener("click", function() {
            showAdminPage(this.dataset.page);
        });
    });


/* =========================================
   10. MOBILE SIDEBAR
========================================= */

if (sidebarToggle && adminSidebar) {
    sidebarToggle.addEventListener("click", function() {
        adminSidebar.classList.toggle("open");
    });
}


/* =========================================
   11. DASHBOARD DATE
========================================= */

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


/* =========================================
   12. GLOBAL FINANCIAL DATE FILTER
   TIME ZONE: AFRICA/ACCRA
========================================= */

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


/* GET DATE KEY IN GHANA TIME */

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


/* GET TODAY */

function getAdminGhanaToday() {
    return getAdminGhanaDateKey(new Date());
}


/* SHIFT DATE KEY */

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


/* FORMAT DATE KEY */

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


/* GET EFFECTIVE FINANCIAL DATE */

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


/* CHECK DATE RANGE */

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


/* FILTER DEPOSITS */

function getAdminFilteredDeposits() {
    return adminDepositsCache.filter(deposit =>
        isAdminRecordWithinDateRange(
            deposit,
            "deposit"
        )
    );
}


/* FILTER WITHDRAWALS */

function getAdminFilteredWithdrawals() {
    return adminWithdrawalsCache.filter(withdrawal =>
        isAdminRecordWithinDateRange(
            withdrawal,
            "withdrawal"
        )
    );
}


/* SET QUICK DATE RANGE */

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
}


/* APPLY CUSTOM DATE RANGE */

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


/* UPDATE FILTER SUMMARY */

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


/* RENDER FILTERED FINANCIAL DATA */

function renderAdminDateFilteredDashboard() {
    const deposits =
        getAdminFilteredDeposits();

    const withdrawals =
        getAdminFilteredWithdrawals();

    const profiles =
        adminProfilesCache;

    updateAdminDateFilterSummary();

    /* SUCCESSFUL DEPOSITS */

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

    /* COMPLETED WITHDRAWALS */

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

    /* WITHDRAWAL COUNTS */

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

    /* WITHDRAWALS */

    displayAdminWithdrawals(
        withdrawals,
        profiles
    );

    /* SAVINGS */

    displayAdminSavings(
        adminWalletsCache,
        profiles,
        deposits,
        withdrawals,
        adminDepositsAvailable
    );

    /* DEPOSITS */

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

    /* ALL TRANSACTIONS */

    displayAdminTransactions(
        deposits,
        withdrawals,
        profiles
    );

    /* REFRESH OPEN MEMBER PROFILE */

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


/* DATE RANGE SELECTOR */

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


/* APPLY FILTER BUTTON */

if (applyAdminDateFilterButton) {
    applyAdminDateFilterButton.addEventListener(
        "click",
        applyAdminCustomDateRange
    );
}


/* RESET FILTER BUTTON */

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


/* INITIAL DATE FILTER */

setAdminQuickDateRange("this_month");


/* =========================================
   13. MEMBER SEARCH AND DIRECTORY
========================================= */

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


/* MEMBER SEARCH EVENTS */

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


/* =========================================
   14. MEMBER TOTALS
========================================= */

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


/* =========================================
   15. MEMBER PROFILE MODAL
========================================= */

const memberProfileModal =
    document.getElementById("memberProfileModal");

const suspendMemberButton =
    document.getElementById("suspendMemberButton");

const activateMemberButton =
    document.getElementById("activateMemberButton");


/* UPDATE MEMBER ACTION BUTTONS */

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


/* OPEN MEMBER PROFILE */

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


/* =========================================
   16. MEMBER TRANSACTION HISTORY
========================================= */

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


/* =========================================
   17. UPDATE MEMBER ACCOUNT STATUS
========================================= */

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


/* =========================================
   18. CLOSE MEMBER PROFILE MODAL
========================================= */

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



/* =========================================
   19. DISPLAY WITHDRAWAL REQUESTS
   SHOW RECIPIENT NAME AND ACCOUNT NUMBER
========================================= */

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

        /* REQUEST ID */

        row.appendChild(
            createAdminTableCell(requestId)
        );

        /* MEMBER NAME */

        row.appendChild(
            createAdminTableCell(memberName)
        );

        /* WITHDRAWAL AMOUNT */

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(request.amount)
            )
        );

        /* PAYMENT METHOD */

        row.appendChild(
            createAdminTableCell(
                getAdminPaymentMethodLabel(
                    request.withdrawal_method
                )
            )
        );

        /* =====================================
           RECIPIENT NAME AND ACCOUNT NUMBER
        ===================================== */

        const paymentDetailsCell =
            document.createElement("td");

        const paymentDetails =
            String(request.payment_details || "").trim();

        const accountNameMatch =
            paymentDetails.match(
                /Account Name:\s*(.*?)\s*\|\s*Account Number:/i
            );

        const accountNumberMatch =
            paymentDetails.match(
                /Account Number:\s*(.*)$/i
            );

        const accountName =
            accountNameMatch
                ? accountNameMatch[1].trim()
                : "";

        const accountNumber =
            accountNumberMatch
                ? accountNumberMatch[1].trim()
                : paymentDetails;

        const accountNameLine =
            document.createElement("div");

        accountNameLine.textContent =
            "Account Name: " +
            (accountName || "—");

        const accountNumberLine =
            document.createElement("div");

        accountNumberLine.textContent =
            "Account Number: " +
            (accountNumber || "—");

        paymentDetailsCell.appendChild(
            accountNameLine
        );

        paymentDetailsCell.appendChild(
            accountNumberLine
        );

        paymentDetailsCell.className =
            "withdrawal-payment-details";

        row.appendChild(paymentDetailsCell);

        /* WITHDRAWAL STATUS */

        row.appendChild(
            createAdminStatusCell(request.status)
        );

        /* =====================================
           ADMIN WITHDRAWAL ACTIONS
        ===================================== */

        const actionCell =
            document.createElement("td");

        const status =
            normalizeAdminStatus(request.status);

        if (
            status === "pending" ||
            status === "processing"
        ) {

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
                        "processing"
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
                    "rejected"
                );
            });

            actionCell.appendChild(rejectButton);

        } else {
            actionCell.textContent = "No action";
        }

        row.appendChild(actionCell);

        /* DATE AND TIME */

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

        /* MAIN WITHDRAWAL TABLE */

        if (table) {
            table.appendChild(row);
        }

        /* =====================================
           RECENT WITHDRAWALS TABLE
        ===================================== */

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

    console.log(
        "Admin withdrawal requests displayed:",
        sortedWithdrawals.length
    );
}



/* =========================================
   20. DISPLAY SAVINGS DATA
========================================= */

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

        /* CURRENT WALLET BALANCE */

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    getMemberDisplayBalance(wallet)
                )
            )
        );

        /* FILTERED SUCCESSFUL DEPOSITS */

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

        /* FILTERED COMPLETED WITHDRAWALS */

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


/* =========================================
   21. SECURE ADMIN DEPOSIT VERIFICATION
========================================= */

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
                // Use the original error message.
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


/* =========================================
   22. DISPLAY DEPOSIT RECORDS
========================================= */

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


/* =========================================
   23. UPDATE DEPOSIT STATISTICS
========================================= */

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


/* =========================================
   24. REVERSE FINANCIAL TRANSACTION
========================================= */

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
              "The database reversal function will process the financial adjustment.\n\n" +
              "Continue only if you have verified the transaction."
            : "You are about to CANCEL this pending withdrawal.\n\n" +
              "Amount: " + amountText + "\n\n" +
              "The database reversal function will process the cancellation.\n\n" +
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


/* =========================================
   25. DISPLAY ALL FINANCIAL TRANSACTIONS
========================================= */

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

    /* CREATE TABLE HEADINGS */

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

    /* COMBINE TRANSACTIONS */

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

    /* NEWEST FIRST */

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


/* =========================================
   26. ADMINISTRATOR LOGIN
========================================= */

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


/* =========================================
   27. SHOW ADMIN DASHBOARD
========================================= */

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


/* =========================================
   28. CHECK EXISTING LOGIN SESSION
========================================= */

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


/* =========================================
   29. ADMIN SIGN OUT
========================================= */

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


/* AUTHENTICATION STATE */

nexusAdminSupabase.auth.onAuthStateChange(
    (event) => {
        if (event === "SIGNED_OUT") {
            showAdminLogin();
        }
    }
);


/* =========================================
   30. ADMIN WITHDRAWAL REVIEW
========================================= */

async function reviewNexusWithdrawal(
    requestId,
    action
) {
    if (
        !["processing", "rejected"].includes(action)
    ) {
        alert("Invalid withdrawal action.");
        return;
    }

    const confirmationMessage =
        action === "rejected"
            ? "Are you sure you want to reject this withdrawal? The database function will handle the required wallet adjustment."
            : "Are you sure you want to move this withdrawal to processing?";

    if (!window.confirm(confirmationMessage)) {
        return;
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
    }
}


/* =========================================
   31. LOAD ALL DASHBOARD RECORDS
========================================= */

async function loadAdminDashboardData() {
    if (adminDashboardLoading) {
        console.log(
            "Dashboard data loading is already in progress."
        );
        return;
    }

    adminDashboardLoading = true;

    if (refreshDepositsButton) {
        refreshDepositsButton.disabled = true;
        refreshDepositsButton.textContent = "Refreshing...";
    }

    try {
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

        /* CHECK REQUIRED TABLES */

        if (profilesResult.error) {
            throw profilesResult.error;
        }

        if (walletsResult.error) {
            throw walletsResult.error;
        }

        if (withdrawalsResult.error) {
            throw withdrawalsResult.error;
        }

        /* EXTRACT DATA */

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

        /* UPDATE CACHES */

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

        /* TOTAL MEMBERS - LIFETIME COUNT */

        const totalMembersElement =
            document.getElementById("totalMembers");

        if (totalMembersElement) {
            totalMembersElement.textContent =
                profiles.length.toLocaleString("en-GH");
        }

        /* CURRENT TOTAL WALLET BALANCES */

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

        /* MEMBER DIRECTORY */

        displayAdminMembers(profiles);

        /*
           APPLY THE SELECTED DATE FILTER
           TO ALL FINANCIAL RECORDS AND TOTALS.
        */

        renderAdminDateFilteredDashboard();

        /* LOAD TRASH */

        await loadAdminTrash();

        /* DASHBOARD SUMMARY */

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

    } catch (error) {
        console.error(
            "Dashboard data loading error:",
            error
        );

        throw error;

    } finally {
        adminDashboardLoading = false;

        if (refreshDepositsButton) {
            refreshDepositsButton.disabled = false;
            refreshDepositsButton.textContent =
                "↻ Refresh Deposits";
        }
    }
}


/* =========================================
   32. DEPOSIT TRANSACTION TRASH
========================================= */

const refreshTrashButton =
    document.getElementById("refreshTrashButton");

const trashTransactionsTable =
    document.getElementById("trashTransactionsTable");

const trashCountBadge =
    document.getElementById("trashCountBadge");


/* MOVE DEPOSIT TO TRASH */

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


/* LOAD TRASH RECORDS */

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

        const trashRecords = data || [];

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


/* RESTORE DEPOSIT FROM TRASH */

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


/* REFRESH TRASH BUTTON */

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


/* =========================================
   33. REFRESH DASHBOARD BUTTON
========================================= */

if (refreshDepositsButton) {
    refreshDepositsButton.addEventListener(
        "click",
        async function() {
            refreshDepositsButton.disabled = true;

            const originalText =
                refreshDepositsButton.textContent;

            refreshDepositsButton.textContent =
                "Refreshing...";

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

            } finally {
                refreshDepositsButton.disabled = false;
                refreshDepositsButton.textContent =
                    originalText;
            }
        }
    );
}



/* =========================================
   35. NEXUS TELLER MANAGEMENT SYSTEM
========================================= */

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


/* =========================================
   TELLER STATISTICS
========================================= */

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
        total.textContent = tellers.length.toLocaleString("en-GH");
    }

    if (active) {
        active.textContent = activeCount.toLocaleString("en-GH");
    }

    if (suspended) {
        suspended.textContent = suspendedCount.toLocaleString("en-GH");
    }

    if (inactive) {
        inactive.textContent = inactiveCount.toLocaleString("en-GH");
    }

    if (badge) {
        badge.textContent = tellers.length;
        badge.hidden = tellers.length === 0;
    }
}


/* =========================================
   DISPLAY TELLER DIRECTORY
========================================= */

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

        /* TELLER ACTIONS */

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


/* =========================================
   LOAD TELLER ACCOUNTS
========================================= */

let adminTellersLoading = false;

async function loadAdminTellers() {

    if (!tellersTable || adminTellersLoading) {
        return;
    }

    adminTellersLoading = true;

    showAdminTableMessage(
        "tellersTable",
        7,
        "Loading teller accounts..."
    );

    try {

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

    } catch (error) {

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

        adminTellersLoading = false;

    }
}


/* =========================================
   CREATE NEW TELLER ACCOUNT
========================================= */

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
                        // Keep the original error.
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


/* =========================================
   UPDATE TELLER ACCOUNT STATUS
========================================= */

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
        teller.full_name +
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


/* =========================================
   TELLER SEARCH
========================================= */

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


/* =========================================
   REFRESH TELLER DIRECTORY
========================================= */

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

            } finally {

                refreshTellersButton.disabled = false;
                refreshTellersButton.textContent =
                    originalText;
            }
        }
    );
}


/* =========================================
   36. START ADMIN DASHBOARD
========================================= */

checkAdminSession();

console.log(
    "Nexus Wealth Partners Admin Dashboard initialized."
);



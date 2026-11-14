
/* =========================================================
   NEXUS WEALTH PARTNERS
   COMPLETE ADMINISTRATOR DASHBOARD
   Corrected Supabase-connected implementation
========================================================= */


/* =========================================================
   1. SUPABASE CONNECTION
========================================================= */

if (!window.supabase) {
    throw new Error("Supabase library is not loaded.");
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
   2. APPLICATION STATE
========================================================= */

const nexusAdminState = {
    user: null,
    currentPage: "overview",

    dateRange: "this_month",
    dateFrom: null,
    dateTo: null,

    profiles: [],
    wallets: [],
    deposits: [],
    withdrawals: [],
    tellers: [],
    trash: [],
    activityLogs: [],

    selectedMember: null,
    loading: false
};


/* =========================================================
   3. PAGE TITLES
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
    notifications: "Administrator Notifications",
    settings: "Administrator Settings"
};


/* =========================================================
   4. ELEMENT HELPERS
========================================================= */

function adminElement(id) {
    return document.getElementById(id);
}

function adminElements(selector) {
    return document.querySelectorAll(selector);
}

function adminText(id, value) {
    const element = adminElement(id);

    if (!element) return;

    element.textContent =
        value === null || value === undefined
            ? "—"
            : String(value);
}

function adminShow(element, visible = true) {
    if (!element) return;

    element.hidden = !visible;
}

function adminSetMessage(id, message, type = "info") {
    const element = adminElement(id);

    if (!element) return;

    element.textContent = message;
    element.dataset.type = type;

    element.classList.remove(
        "success",
        "error",
        "info",
        "warning"
    );

    element.classList.add(type);
}

function adminEscape(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );
}


/* =========================================================
   5. GENERAL HELPERS
========================================================= */

function formatNexusAdminMoney(amount) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function formatAdminDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-GH", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function formatAdminDateOnly(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-GH", {
        dateStyle: "medium"
    });
}

function adminStatusLabel(status) {
    return String(status || "unknown")
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function adminStatusBadge(status) {
    const normalized = String(status || "").toLowerCase();

    let className = "status-pending";

    if (
        [
            "successful",
            "completed",
            "active",
            "approved",
            "delivered"
        ].includes(normalized)
    ) {
        className = "status-success";
    } else if (
        [
            "failed",
            "rejected",
            "cancelled",
            "suspended",
            "inactive"
        ].includes(normalized)
    ) {
        className = "status-danger";
    } else if (
        [
            "processing",
            "pending",
            "preparing"
        ].includes(normalized)
    ) {
        className = "status-pending";
    } else if (normalized === "reversed") {
        className = "status-warning";
    }

    return `<span class="status-badge ${className}">
        ${adminEscape(adminStatusLabel(status))}
    </span>`;
}

function adminCreateCell(value) {
    const cell = document.createElement("td");

    cell.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "—"
            : String(value);

    return cell;
}

function adminCreateActionButton(
    label,
    action,
    id,
    className = ""
) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = id;
    button.className = className;

    return button;
}

function adminSetTableMessage(
    tableId,
    columnCount,
    message
) {
    const tbody = adminGetTableBody(tableId);

    if (!tbody) return;

    tbody.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columnCount;
    cell.className = "empty-table";
    cell.textContent = message;

    row.appendChild(cell);
    tbody.appendChild(row);
}

function adminGetTableBody(tableId) {
    const element = adminElement(tableId);

    if (!element) return null;

    return element.querySelector("tbody") || element;
}

function adminRenderRows(
    tableId,
    columnCount,
    rows,
    renderer
) {
    const tbody = adminGetTableBody(tableId);

    if (!tbody) return;

    tbody.replaceChildren();

    if (!rows || rows.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = columnCount;
        cell.className = "empty-table";
        cell.textContent = "No records found.";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
    }

    rows.forEach(record => {
        const row = document.createElement("tr");

        renderer(row, record);

        tbody.appendChild(row);
    });
}

function adminSum(records, field) {
    return records.reduce(
        (total, record) =>
            total + (Number(record[field]) || 0),
        0
    );
}

function adminFilterByDate(
    records,
    field = "created_at"
) {
    return records.filter(record => {
        const value = record[field];

        if (!value) return false;

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return false;
        }

        if (nexusAdminState.dateFrom) {
            const from = new Date(
                `${nexusAdminState.dateFrom}T00:00:00`
            );

            if (date < from) return false;
        }

        if (nexusAdminState.dateTo) {
            const to = new Date(
                `${nexusAdminState.dateTo}T23:59:59.999`
            );

            if (date > to) return false;
        }

        return true;
    });
}

function adminGetWallet(userId) {
    return nexusAdminState.wallets.find(
        wallet => wallet.user_id === userId
    );
}

function adminGetProfile(userId) {
    return nexusAdminState.profiles.find(
        profile => profile.id === userId
    );
}

function adminErrorMessage(error) {
    console.error("Nexus administrator error:", error);

    return error?.message ||
        "An unexpected error occurred.";
}

function adminConfirm(message) {
    return window.confirm(message);
}

function adminShortId(value) {
    if (!value) return "—";

    return String(value).length > 12
        ? `${String(value).slice(0, 8)}...`
        : String(value);
}


/* =========================================================
   6. AUTHENTICATION
========================================================= */

async function adminLogin(event) {
    event.preventDefault();

    const email =
        adminElement("adminEmail")?.value.trim();

    const password =
        adminElement("adminPassword")?.value;

    const button =
        adminElement("adminLoginButton");

    if (!email || !password) {
        adminSetMessage(
            "adminLoginMessage",
            "Enter your email address and password.",
            "error"
        );

        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Signing in...";
    }

    adminSetMessage(
        "adminLoginMessage",
        "Verifying administrator account...",
        "info"
    );

    try {
        const { data, error } =
            await nexusAdminSupabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        if (!data.user) {
            throw new Error(
                "Login could not be completed."
            );
        }

        const {
            data: isAdmin,
            error: adminError
        } = await nexusAdminSupabase.rpc(
            "is_nexus_admin"
        );

        if (adminError) {
            await nexusAdminSupabase.auth.signOut();

            throw new Error(
                "Administrator permission could not be verified."
            );
        }

        if (isAdmin !== true) {
            await nexusAdminSupabase.auth.signOut();

            throw new Error(
                "This account is not authorized to access the administrator dashboard."
            );
        }

        nexusAdminState.user = data.user;

        await adminShowDashboard();

    } catch (error) {
        adminSetMessage(
            "adminLoginMessage",
            adminErrorMessage(error),
            "error"
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Sign In to Dashboard";
        }
    }
}

async function adminVerifySession() {
    try {
        const {
            data: { session },
            error
        } = await nexusAdminSupabase.auth.getSession();

        if (error) throw error;

        if (!session?.user) {
            adminShowLogin();
            return;
        }

        const {
            data: isAdmin,
            error: adminError
        } = await nexusAdminSupabase.rpc(
            "is_nexus_admin"
        );

        if (adminError || isAdmin !== true) {
            await nexusAdminSupabase.auth.signOut();

            adminShowLogin();

            adminSetMessage(
                "adminLoginMessage",
                "Your account does not have administrator access.",
                "error"
            );

            return;
        }

        nexusAdminState.user = session.user;

        await adminShowDashboard();

    } catch (error) {
        console.error(
            "Session verification error:",
            error
        );

        adminShowLogin();
    }
}

function adminShowLogin() {
    adminShow(
        adminElement("adminLoginScreen"),
        true
    );

    adminShow(
        adminElement("adminDashboard"),
        false
    );
}

async function adminShowDashboard() {
    adminShow(
        adminElement("adminLoginScreen"),
        false
    );

    adminShow(
        adminElement("adminDashboard"),
        true
    );

    adminText(
        "adminProfileEmail",
        nexusAdminState.user?.email || "Administrator"
    );

    adminText(
        "dashboardDate",
        new Date().toLocaleDateString("en-GH", {
            dateStyle: "full"
        })
    );

    // Apply the default date range selected in HTML.
    adminSetDateRange("this_month", false);

    await adminLoadCoreData();

    adminNavigate("overview");
}

async function adminLogout() {
    if (!adminConfirm(
        "Are you sure you want to log out?"
    )) {
        return;
    }

    const { error } =
        await nexusAdminSupabase.auth.signOut();

    if (error) {
        alert(adminErrorMessage(error));
        return;
    }

    nexusAdminState.user = null;

    adminShowLogin();
}


/* =========================================================
   7. LOAD MAIN DATABASE RECORDS
========================================================= */

async function adminLoadCoreData() {
    if (nexusAdminState.loading) return;

    nexusAdminState.loading = true;

    try {
        const results = await Promise.all([
            nexusAdminSupabase
                .from("profiles")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(2000),

            nexusAdminSupabase
                .from("wallets")
                .select("*")
                .limit(2000),

            nexusAdminSupabase
                .from("deposit_transactions")
                .select("*")
                .is("deleted_at", null)
                .order("created_at", {
                    ascending: false
                })
                .limit(3000),

            nexusAdminSupabase
                .from("withdrawal_requests")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(3000),

            nexusAdminSupabase
                .from("nexus_tellers")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(1000),

            nexusAdminSupabase
                .from("nexus_activity_logs")
                .select("*")
                .order("created_at", {
                    ascending: false
                })
                .limit(200)
        ]);

        const names = [
            "profiles",
            "wallets",
            "deposits",
            "withdrawals",
            "tellers",
            "activity logs"
        ];

        results.forEach((result, index) => {
            if (result.error) {
                console.error(
                    `Could not load ${names[index]}:`,
                    result.error
                );
            }
        });

        nexusAdminState.profiles =
            results[0].data || [];

        nexusAdminState.wallets =
            results[1].data || [];

        nexusAdminState.deposits =
            results[2].data || [];

        nexusAdminState.withdrawals =
            results[3].data || [];

        nexusAdminState.tellers =
            results[4].data || [];

        nexusAdminState.activityLogs =
            results[5].data || [];

        adminRenderOverview();
        adminRenderMembers();
        adminRenderTellers();
        adminRenderWithdrawals();
        adminRenderDeposits();
        adminRenderTransactions();
        adminRenderSavings();

        adminUpdateDateSummary();

    } catch (error) {
        console.error(
            "Could not load administrator dashboard:",
            error
        );

        alert(adminErrorMessage(error));

    } finally {
        nexusAdminState.loading = false;
    }
}


/* =========================================================
   8. DASHBOARD NAVIGATION
========================================================= */

function adminNavigate(page) {
    if (!adminPageTitles[page]) {
        console.error(
            "Unknown dashboard page:",
            page
        );

        return;
    }

    nexusAdminState.currentPage = page;

    // Update sidebar buttons.
    document.querySelectorAll(
        ".admin-nav-link[data-page]"
    ).forEach(button => {
        const active =
            button.dataset.page === page;

        button.classList.toggle(
            "active",
            active
        );

        if (active) {
            button.setAttribute(
                "aria-current",
                "page"
            );
        } else {
            button.removeAttribute("aria-current");
        }
    });

    // Display the selected page.
    document.querySelectorAll(
        "main.admin-main > section.admin-page"
    ).forEach(section => {
        const active =
            section.id === `page-${page}`;

        section.hidden = !active;

        section.classList.toggle(
            "active",
            active
        );

        section.style.display =
            active ? "block" : "none";
    });

    // Update heading.
    adminText(
        "adminPageTitle",
        adminPageTitles[page]
    );

    // Load page-specific records.
    if (page === "trash") {
        adminLoadTrash();
    }

    if (page === "profit-interest") {
        adminLoadProfitInterest();
    }

    if (page === "reports") {
        adminRenderReports();
    }

    if (page === "notifications") {
        adminLoadNotifications();
    }

    if (page === "settings") {
        adminRenderSettings();
    }

    if (page === "tellers") {
        adminRenderTellers();
    }

    // Close mobile sidebar after navigation.
    const sidebar =
        adminElement("adminSidebar");

    if (
        sidebar &&
        window.innerWidth <= 900
    ) {
        sidebar.classList.remove("open");

        adminElement("sidebarToggle")
            ?.setAttribute(
                "aria-expanded",
                "false"
            );
    }
}


/* =========================================================
   9. SIDEBAR
========================================================= */

function adminToggleSidebar() {
    const sidebar =
        adminElement("adminSidebar");

    const toggle =
        adminElement("sidebarToggle");

    if (!sidebar) return;

    sidebar.classList.toggle("open");

    if (toggle) {
        toggle.setAttribute(
            "aria-expanded",
            sidebar.classList.contains("open")
                ? "true"
                : "false"
        );
    }
}


/* =========================================================
   10. DATE FILTER
========================================================= */

function adminLocalDateString(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function adminSetDateRange(
    range,
    render = true
) {
    const now = new Date();

    let from = null;
    let to = null;

    const startOfDay = date => {
        const copy = new Date(date);

        copy.setHours(0, 0, 0, 0);

        return copy;
    };

    const endOfDay = date => {
        const copy = new Date(date);

        copy.setHours(23, 59, 59, 999);

        return copy;
    };

    if (range === "today") {
        from = startOfDay(now);
        to = endOfDay(now);
    }

    if (range === "yesterday") {
        const yesterday = new Date(now);

        yesterday.setDate(
            yesterday.getDate() - 1
        );

        from = startOfDay(yesterday);
        to = endOfDay(yesterday);
    }

    if (range === "this_week") {
        const start = startOfDay(now);

        const day = start.getDay();

        start.setDate(
            start.getDate() -
            (day === 0 ? 6 : day - 1)
        );

        from = start;
        to = endOfDay(now);
    }

    if (range === "this_month") {
        from = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        to = endOfDay(now);
    }

    if (range === "this_year") {
        from = new Date(
            now.getFullYear(),
            0,
            1
        );

        to = endOfDay(now);
    }

    if (
        range === "all_time" ||
        range === "all"
    ) {
        range = "all_time";

        from = null;
        to = null;
    }

    nexusAdminState.dateRange = range;

    nexusAdminState.dateFrom =
        from ? adminLocalDateString(from) : null;

    nexusAdminState.dateTo =
        to ? adminLocalDateString(to) : null;

    const rangeSelect =
        adminElement("adminDateRange");

    if (rangeSelect) {
        rangeSelect.value = range;
    }

    adminShow(
        adminElement("adminDateFrom"),
        range === "custom"
    );

    adminShow(
        adminElement("adminDateTo"),
        range === "custom"
    );

    if (range !== "custom") {
        adminElement("adminDateFrom").value =
            nexusAdminState.dateFrom || "";

        adminElement("adminDateTo").value =
            nexusAdminState.dateTo || "";
    }

    if (render) {
        adminRenderAllFilteredSections();

        adminSetMessage(
            "adminDateFilterMessage",
            "Date filter applied.",
            "success"
        );
    }

    adminUpdateDateSummary();
}

function adminApplyDateFilter() {
    const range =
        adminElement("adminDateRange")?.value;

    const fromInput =
        adminElement("adminDateFrom")?.value;

    const toInput =
        adminElement("adminDateTo")?.value;

    if (!range) return;

    if (range === "custom") {
        if (
            fromInput &&
            toInput &&
            fromInput > toInput
        ) {
            adminSetMessage(
                "adminDateFilterMessage",
                "The start date cannot be after the end date.",
                "error"
            );

            return;
        }

        nexusAdminState.dateRange = "custom";
        nexusAdminState.dateFrom = fromInput || null;
        nexusAdminState.dateTo = toInput || null;

        adminRenderAllFilteredSections();

        adminSetMessage(
            "adminDateFilterMessage",
            "Custom date filter applied.",
            "success"
        );

        adminUpdateDateSummary();

        return;
    }

    adminSetDateRange(range);
}

function adminResetDateFilter() {
    adminSetDateRange("all_time");

    adminSetMessage(
        "adminDateFilterMessage",
        "Showing all available dates.",
        "success"
    );
}

function adminUpdateDateSummary() {
    let summary = "All Time";

    if (nexusAdminState.dateRange === "custom") {
        summary =
            `${nexusAdminState.dateFrom || "Start"} to ` +
            `${nexusAdminState.dateTo || "Today"}`;
    } else if (
        nexusAdminState.dateRange !== "all_time"
    ) {
        const labels = {
            today: "Today",
            yesterday: "Yesterday",
            this_week: "This Week",
            this_month: "This Month",
            this_year: "This Year"
        };

        summary =
            labels[nexusAdminState.dateRange] ||
            "All Time";
    }

    adminText(
        "adminDateFilterSummary",
        summary
    );
}

function adminRenderAllFilteredSections() {
    adminRenderOverview();
    adminRenderMembers();
    adminRenderWithdrawals();
    adminRenderDeposits();
    adminRenderTransactions();
    adminRenderSavings();

    if (
        nexusAdminState.currentPage === "reports"
    ) {
        adminRenderReports();
    }
}


/* =========================================================
   11. OVERVIEW
========================================================= */

function adminRenderOverview() {
    const profiles =
        adminFilterByDate(
            nexusAdminState.profiles
        );

    const deposits =
        adminFilterByDate(
            nexusAdminState.deposits
        );

    const withdrawals =
        adminFilterByDate(
            nexusAdminState.withdrawals
        );

    const pending = withdrawals.filter(
        item => item.status === "pending"
    );

    const processing = withdrawals.filter(
        item => item.status === "processing"
    );

    const completed = withdrawals.filter(
        item => item.status === "completed"
    );

    adminText(
        "totalMembers",
        profiles.length
    );

    adminText(
        "totalWalletBalances",
        formatNexusAdminMoney(
            adminSum(
                nexusAdminState.wallets,
                "balance"
            )
        )
    );

    adminText(
        "totalDeposits",
        formatNexusAdminMoney(
            adminSum(
                deposits.filter(
                    item => item.status === "successful"
                ),
                "amount"
            )
        )
    );

    adminText(
        "totalWithdrawals",
        formatNexusAdminMoney(
            adminSum(
                withdrawals.filter(
                    item => item.status === "completed"
                ),
                "amount"
            )
        )
    );

    adminText(
        "overviewPendingWithdrawals",
        pending.length
    );

    adminText(
        "overviewProcessingWithdrawals",
        processing.length
    );

    adminText(
        "overviewCompletedWithdrawals",
        completed.length
    );

    // Sidebar withdrawal badge.
    const withdrawalBadge =
        adminElement("pendingWithdrawalBadge");

    if (withdrawalBadge) {
        withdrawalBadge.textContent =
            pending.length;

        withdrawalBadge.hidden =
            pending.length === 0;
    }

    // Recent withdrawals.
    const recent = withdrawals.slice(0, 8);

    adminRenderRows(
        "recentWithdrawalsTable",
        5,
        recent,
        (row, item) => {
            const profile =
                adminGetProfile(item.user_id);

            row.append(
                adminCreateCell(
                    adminShortId(item.id)
                ),
                adminCreateCell(
                    profile?.full_name || item.user_id
                ),
                adminCreateCell(
                    formatNexusAdminMoney(item.amount)
                ),
                adminCreateCell(item.withdrawal_method),
                adminCreateCell(
                    adminStatusLabel(item.status)
                )
            );
        }
    );
}


/* =========================================================
   12. MEMBERS MANAGEMENT
========================================================= */

function adminRenderMembers() {
    const search =
        adminElement("memberSearchInput")
            ?.value.trim().toLowerCase() || "";

    let members =
        adminFilterByDate(
            nexusAdminState.profiles
        );

    if (search) {
        members = members.filter(member => {
            return [
                member.full_name,
                member.email,
                member.phone,
                member.member_id
            ].some(value =>
                String(value || "")
                    .toLowerCase()
                    .includes(search)
            );
        });
    }

    adminText(
        "memberManagementTotal",
        nexusAdminState.profiles.length
    );

    adminText(
        "memberManagementWallets",
        formatNexusAdminMoney(
            adminSum(
                nexusAdminState.wallets,
                "balance"
            )
        )
    );

    adminText(
        "memberSearchResults",
        `${members.length} members found`
    );

    adminRenderRows(
        "membersTable",
        7,
        members,
        (row, member) => {
            row.append(
                adminCreateCell(member.member_id),
                adminCreateCell(member.full_name),
                adminCreateCell(member.email),
                adminCreateCell(member.phone),
                adminCreateCell(
                    formatAdminDateOnly(member.created_at)
                ),
                adminCreateCell(
                    adminStatusLabel(member.status)
                )
            );

            const actions =
                document.createElement("td");

            actions.appendChild(
                adminCreateActionButton(
                    "View",
                    "view-member",
                    member.id
                )
            );

            row.appendChild(actions);
        }
    );
}

function adminOpenMemberProfile(userId) {
    const member =
        adminGetProfile(userId);

    if (!member) {
        alert(
            "Member record could not be found."
        );

        return;
    }

    nexusAdminState.selectedMember = member;

    const wallet =
        adminGetWallet(userId);

    adminText(
        "memberProfileTitle",
        member.full_name
    );

    adminText(
        "profileMemberId",
        member.member_id
    );

    adminText(
        "profileMemberName",
        member.full_name
    );

    adminText(
        "profileMemberEmail",
        member.email
    );

    adminText(
        "profileMemberPhone",
        member.phone
    );

    adminText(
        "profileMemberJoined",
        formatAdminDate(member.created_at)
    );

    adminText(
        "profileMemberStatus",
        adminStatusLabel(member.status)
    );

    adminText(
        "profileWalletBalance",
        formatNexusAdminMoney(wallet?.balance)
    );

    adminText(
        "profileWalletDeposits",
        formatNexusAdminMoney(wallet?.total_deposits)
    );

    adminText(
        "profileWalletWithdrawals",
        formatNexusAdminMoney(wallet?.total_withdrawals)
    );

    const deposits =
        nexusAdminState.deposits
            .filter(item => item.user_id === userId);

    const withdrawals =
        nexusAdminState.withdrawals
            .filter(item => item.user_id === userId);

    const transactions = [
        ...deposits.map(item => ({
            reference: item.reference,
            type: "Deposit",
            amount: item.amount,
            status: item.status,
            created_at: item.created_at
        })),

        ...withdrawals.map(item => ({
            reference: item.id,
            type: "Withdrawal",
            amount: item.amount,
            status: item.status,
            created_at: item.created_at
        }))
    ].sort(
        (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
    );

    adminRenderRows(
        "memberProfileTransactions",
        5,
        transactions,
        (row, item) => {
            row.append(
                adminCreateCell(
                    adminShortId(item.reference)
                ),
                adminCreateCell(item.type),
                adminCreateCell(
                    formatNexusAdminMoney(item.amount)
                ),
                adminCreateCell(
                    adminStatusLabel(item.status)
                ),
                adminCreateCell(
                    formatAdminDate(item.created_at)
                )
            );
        }
    );

    const modal =
        adminElement("memberProfileModal");

    if (modal) {
        modal.hidden = false;
        modal.classList.add("active");
    }

    adminShow(
        adminElement("suspendMemberButton"),
        member.status !== "Suspended"
    );

    adminShow(
        adminElement("activateMemberButton"),
        member.status !== "Active"
    );
}

function adminCloseMemberProfile() {
    const modal =
        adminElement("memberProfileModal");

    if (modal) {
        modal.hidden = true;
        modal.classList.remove("active");
    }

    nexusAdminState.selectedMember = null;
}

async function adminUpdateMemberStatus(newStatus) {
    const member =
        nexusAdminState.selectedMember;

    if (!member) return;

    const action =
        newStatus === "Suspended"
            ? "suspend"
            : "activate";

    if (!adminConfirm(
        `Are you sure you want to ${action} ${member.full_name}?`
    )) {
        return;
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_update_member_status",
                {
                    p_user_id: member.id,
                    p_new_status: newStatus
                }
            );

        if (error) throw error;

        if (data?.success === false) {
            throw new Error(data.message);
        }

        alert(
            data?.message ||
            `Member ${action}d successfully.`
        );

        await adminLoadCoreData();

        adminCloseMemberProfile();

    } catch (error) {
        alert(adminErrorMessage(error));
    }
}


/* =========================================================
   13. TELLER MANAGEMENT
========================================================= */

function adminRenderTellers() {
    const search =
        adminElement("tellerSearchInput")
            ?.value.trim().toLowerCase() || "";

    let tellers = [
        ...nexusAdminState.tellers
    ];

    if (search) {
        tellers = tellers.filter(teller =>
            [
                teller.full_name,
                teller.email,
                teller.phone,
                teller.teller_code
            ].some(value =>
                String(value || "")
                    .toLowerCase()
                    .includes(search)
            )
        );
    }

    const all =
        nexusAdminState.tellers;

    const activeCount = all.filter(
        item =>
            String(item.status).toLowerCase() === "active"
    ).length;

    const suspendedCount = all.filter(
        item =>
            String(item.status).toLowerCase() === "suspended"
    ).length;

    const inactiveCount = all.filter(
        item =>
            String(item.status).toLowerCase() === "inactive"
    ).length;

    adminText("tellerTotalCount", all.length);
    adminText("activeTellerCount", activeCount);
    adminText("suspendedTellerCount", suspendedCount);
    adminText("inactiveTellerCount", inactiveCount);

    const tellerBadge =
        adminElement("tellerCountBadge");

    if (tellerBadge) {
        tellerBadge.textContent = all.length;
        tellerBadge.hidden = all.length === 0;
    }

    adminText(
        "tellerSearchResults",
        `${tellers.length} tellers found`
    );

    adminRenderRows(
        "tellersTable",
        7,
        tellers,
        (row, teller) => {
            row.append(
                adminCreateCell(teller.teller_code),
                adminCreateCell(teller.full_name),
                adminCreateCell(teller.email),
                adminCreateCell(teller.phone),
                adminCreateCell(
                    formatAdminDate(teller.created_at)
                ),
                adminCreateCell(
                    adminStatusLabel(teller.status)
                )
            );

            const actions =
                document.createElement("td");

            if (
                String(teller.status).toLowerCase() === "active"
            ) {
                actions.appendChild(
                    adminCreateActionButton(
                        "Suspend",
                        "suspend-teller",
                        teller.user_id
                    )
                );
            } else {
                actions.appendChild(
                    adminCreateActionButton(
                        "Activate",
                        "activate-teller",
                        teller.user_id
                    )
                );
            }

            row.appendChild(actions);
        }
    );
}

async function adminCreateTeller(event) {
    event.preventDefault();

    const fullName =
        adminElement("tellerFullName")?.value.trim();

    const email =
        adminElement("tellerEmail")?.value.trim();

    const phone =
        adminElement("tellerPhone")?.value.trim();

    const button =
        adminElement("createTellerButton");

    if (!fullName || !email || !phone) {
        adminSetMessage(
            "createTellerMessage",
            "Complete all teller information.",
            "error"
        );

        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Creating teller...";
    }

    adminSetMessage(
        "createTellerMessage",
        "Creating teller account and sending invitation...",
        "info"
    );

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

        if (error) throw error;

        if (!data?.success) {
            throw new Error(
                data?.message ||
                "Teller account could not be created."
            );
        }

        adminSetMessage(
            "createTellerMessage",
            `${data.message} Teller code: ${data.teller?.teller_code || "See teller record"}`,
            "success"
        );

        adminElement("createTellerForm")?.reset();

        await adminLoadCoreData();

    } catch (error) {
        adminSetMessage(
            "createTellerMessage",
            adminErrorMessage(error),
            "error"
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "+ Create Teller Account";
        }
    }
}

async function adminUpdateTellerStatus(
    userId,
    status
) {
    const teller =
        nexusAdminState.tellers.find(
            item => item.user_id === userId
        );

    if (!teller) return;

    if (!adminConfirm(
        `Change ${teller.full_name}'s status to ${status}?`
    )) {
        return;
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_update_nexus_teller_status",
                {
                    p_user_id: userId,
                    p_new_status: status
                }
            );

        if (error) throw error;

        if (data?.success === false) {
            throw new Error(data.message);
        }

        alert(
            data?.message ||
            "Teller status updated successfully."
        );

        await adminLoadCoreData();

    } catch (error) {
        alert(adminErrorMessage(error));
    }
}


/* =========================================================
   14. WITHDRAWAL MANAGEMENT
========================================================= */

function adminRenderWithdrawals() {
    const withdrawals =
        adminFilterByDate(
            nexusAdminState.withdrawals
        );

    adminRenderRows(
        "withdrawalsTable",
        8,
        withdrawals,
        (row, item) => {
            const profile =
                adminGetProfile(item.user_id);

            row.append(
                adminCreateCell(
                    adminShortId(item.id)
                ),
                adminCreateCell(
                    profile?.full_name || item.user_id
                ),
                adminCreateCell(
                    formatNexusAdminMoney(item.amount)
                ),
                adminCreateCell(item.withdrawal_method),
                adminCreateCell(item.payment_details),
                adminCreateCell(
                    adminStatusLabel(item.status)
                )
            );

            const actions =
                document.createElement("td");

            if (
                item.status === "pending" ||
                item.status === "processing"
            ) {
                if (item.status === "pending") {
                    actions.appendChild(
                        adminCreateActionButton(
                            "Process",
                            "process-withdrawal",
                            item.id
                        )
                    );
                }

                actions.appendChild(
                    adminCreateActionButton(
                        "Reject",
                        "reject-withdrawal",
                        item.id
                    )
                );
            } else {
                actions.textContent = "—";
            }

            row.appendChild(actions);

            row.appendChild(
                adminCreateCell(
                    formatAdminDate(item.created_at)
                )
            );
        }
    );
}

async function adminReviewWithdrawal(
    requestId,
    action
) {
    const request =
        nexusAdminState.withdrawals.find(
            item => item.id === requestId
        );

    if (!request) return;

    const label =
        action === "processing"
            ? "move this withdrawal to processing"
            : "reject this withdrawal";

    if (!adminConfirm(
        `Are you sure you want to ${label}?`
    )) {
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

        if (data?.success === false) {
            throw new Error(data.message);
        }

        alert(
            data?.message ||
            "Withdrawal request updated successfully."
        );

        await adminLoadCoreData();

    } catch (error) {
        alert(adminErrorMessage(error));
    }
}


/* =========================================================
   15. DEPOSIT MANAGEMENT
========================================================= */

function adminRenderDeposits() {
    const deposits =
        adminFilterByDate(
            nexusAdminState.deposits
        );

    const pending = deposits.filter(
        item => item.status === "pending"
    );

    const successful = deposits.filter(
        item => item.status === "successful"
    );

    const failed = deposits.filter(
        item => [
            "failed",
            "cancelled",
            "rejected"
        ].includes(
            String(item.status).toLowerCase()
        )
    );

    adminText(
        "adminPendingDeposits",
        pending.length
    );

    adminText(
        "adminSuccessfulDeposits",
        successful.length
    );

    adminText(
        "adminFailedDeposits",
        failed.length
    );

    adminText(
        "adminDepositTotal",
        formatNexusAdminMoney(
            adminSum(successful, "amount")
        )
    );

    const depositBadge =
        adminElement("pendingDepositBadge");

    if (depositBadge) {
        depositBadge.textContent = pending.length;
        depositBadge.hidden = pending.length === 0;
    }

    adminRenderRows(
        "depositsTable",
        8,
        deposits,
        (row, item) => {
            const profile =
                adminGetProfile(item.user_id);

            row.append(
                adminCreateCell(item.reference),
                adminCreateCell(
                    profile?.full_name || item.user_id
                ),
                adminCreateCell(
                    formatNexusAdminMoney(item.amount)
                ),
                adminCreateCell(item.payment_method),
                adminCreateCell(item.payment_phone),
                adminCreateCell(
                    adminStatusLabel(item.status)
                ),
                adminCreateCell(
                    formatAdminDate(item.created_at)
                )
            );

            const actions =
                document.createElement("td");

            if (item.status === "successful") {
                actions.appendChild(
                    adminCreateActionButton(
                        "Reverse",
                        "reverse-deposit",
                        item.id
                    )
                );
            } else {
                actions.appendChild(
                    adminCreateActionButton(
                        "Move to Trash",
                        "trash-deposit",
                        item.id
                    )
                );
            }

            row.appendChild(actions);
        }
    );
}

async function adminTrashDeposit(depositId) {
    const deposit =
        nexusAdminState.deposits.find(
            item => item.id === depositId
        );

    if (!deposit) return;

    if (!adminConfirm(
        "Move this deposit record to the transaction trash?"
    )) {
        return;
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

        if (data?.success === false) {
            throw new Error(data.message);
        }

        alert(
            data?.message ||
            "Deposit moved to trash."
        );

        await adminLoadCoreData();

    } catch (error) {
        alert(adminErrorMessage(error));
    }
}

async function adminReverseTransaction(
    type,
    transactionId
) {
    const reason = window.prompt(
        "Enter the reason for reversing this transaction. At least 5 characters are required:"
    );

    if (reason === null) return;

    if (reason.trim().length < 5) {
        alert(
            "The reversal reason must contain at least 5 characters."
        );

        return;
    }

    if (!adminConfirm(
        "This will reverse the transaction and affect the member's wallet where applicable. Continue?"
    )) {
        return;
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_reverse_nexus_transaction",
                {
                    p_transaction_type: type,
                    p_transaction_id: transactionId,
                    p_reason: reason.trim()
                }
            );

        if (error) throw error;

        if (data?.success === false) {
            throw new Error(data.message);
        }

        alert(
            data?.message ||
            "Transaction reversal completed."
        );

        await adminLoadCoreData();

    } catch (error) {
        alert(adminErrorMessage(error));
    }
}


/* =========================================================
   16. TRANSACTION HISTORY
========================================================= */

function adminRenderTransactions() {
    const deposits =
        adminFilterByDate(
            nexusAdminState.deposits
        ).map(item => ({
            ...item,
            transaction_id: item.reference || item.id,
            transaction_type: "Deposit",
            transaction_date: item.created_at
        }));

    const withdrawals =
        adminFilterByDate(
            nexusAdminState.withdrawals
        ).map(item => ({
            ...item,
            transaction_id: item.id,
            transaction_type: "Withdrawal",
            transaction_date: item.created_at
        }));

    const transactions = [
        ...deposits,
        ...withdrawals
    ].sort(
        (a, b) =>
            new Date(b.transaction_date) -
            new Date(a.transaction_date)
    );

    adminRenderRows(
        "transactionsTable",
        6,
        transactions,
        (row, item) => {
            const profile =
                adminGetProfile(item.user_id);

            row.append(
                adminCreateCell(
                    adminShortId(item.transaction_id)
                ),
                adminCreateCell(
                    profile?.full_name || item.user_id
                ),
                adminCreateCell(
                    item.transaction_type
                ),
                adminCreateCell(
                    formatNexusAdminMoney(item.amount)
                ),
                adminCreateCell(
                    formatAdminDate(item.transaction_date)
                ),
                adminCreateCell(
                    adminStatusLabel(item.status)
                )
            );
        }
    );
}


/* =========================================================
   17. TRANSACTION TRASH
========================================================= */

async function adminLoadTrash() {
    adminSetTableMessage(
        "trashTransactionsTable",
        7,
        "Loading trashed deposits..."
    );

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_list_deposit_trash"
            );

        if (error) throw error;

        nexusAdminState.trash = data || [];

        adminRenderTrash();

    } catch (error) {
        console.error(
            "Trash loading error:",
            error
        );

        adminSetTableMessage(
            "trashTransactionsTable",
            7,
            `Could not load trash: ${error.message}`
        );
    }
}

function adminRenderTrash() {
    const trash = nexusAdminState.trash;

    const trashBadge =
        adminElement("trashCountBadge");

    if (trashBadge) {
        trashBadge.textContent = trash.length;
        trashBadge.hidden = trash.length === 0;
    }

    adminRenderRows(
        "trashTransactionsTable",
        7,
        trash,
        (row, item) => {
            const profile =
                adminGetProfile(item.user_id);

            row.append(
                adminCreateCell(item.reference),
                adminCreateCell(
                    profile?.full_name || item.user_id
                ),
                adminCreateCell(
                    formatNexusAdminMoney(item.amount)
                ),
                adminCreateCell(item.payment_method),
                adminCreateCell(
                    adminStatusLabel(item.status)
                ),
                adminCreateCell(
                    formatAdminDate(item.deleted_at)
                )
            );

            const actions =
                document.createElement("td");

            actions.appendChild(
                adminCreateActionButton(
                    "Restore",
                    "restore-deposit",
                    item.id
                )
            );

            const eligibleForPermanentDeletion = [
                "failed",
                "cancelled",
                "rejected"
            ].includes(
                String(item.status).toLowerCase()
            );

            if (eligibleForPermanentDeletion) {
                actions.appendChild(
                    adminCreateActionButton(
                        "Permanently Delete",
                        "delete-deposit",
                        item.id
                    )
                );
            }

            row.appendChild(actions);
        }
    );
}

async function adminRestoreDeposit(depositId) {
    if (!adminConfirm(
        "Restore this deposit record?"
    )) {
        return;
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

        if (data?.success === false) {
            throw new Error(data.message);
        }

        alert(
            data?.message ||
            "Deposit restored successfully."
        );

        await adminLoadTrash();
        await adminLoadCoreData();

    } catch (error) {
        alert(adminErrorMessage(error));
    }
}

async function adminPermanentlyDeleteDeposit(
    depositId
) {
    if (!adminConfirm(
        "Permanently delete this trashed deposit? This action cannot be undone."
    )) {
        return;
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_permanently_delete_deposit",
                {
                    p_deposit_id: depositId
                }
            );

        if (error) throw error;

        if (data?.success === false) {
            throw new Error(data.message);
        }

        alert(
            data?.message ||
            "Deposit permanently deleted."
        );

        await adminLoadTrash();

    } catch (error) {
        alert(adminErrorMessage(error));
    }
}


/* =========================================================
   18. SAVINGS MANAGEMENT
========================================================= */

function adminRenderSavings() {
    const wallets = [
        ...nexusAdminState.wallets
    ];

    adminRenderRows(
        "savingsTable",
        5,
        wallets,
        (row, wallet) => {
            const profile =
                adminGetProfile(wallet.user_id);

            row.append(
                adminCreateCell(
                    profile?.member_id || wallet.user_id
                ),
                adminCreateCell(
                    profile?.full_name || wallet.user_id
                ),
                adminCreateCell(
                    formatNexusAdminMoney(wallet.balance)
                ),
                adminCreateCell(
                    formatNexusAdminMoney(wallet.total_deposits)
                ),
                adminCreateCell(
                    formatNexusAdminMoney(wallet.total_withdrawals)
                )
            );
        }
    );
}


/* =========================================================
   19. PROFIT AND INTEREST
========================================================= */

function adminLoadProfitInterest() {
    adminText(
        "adminTotalProfit",
        "Not configured"
    );

    adminText(
        "adminTotalInterest",
        "Not configured"
    );

    adminSetTableMessage(
        "profitInterestTable",
        6,
        "Profit and interest accounting records are not configured. No profit or interest figures will be estimated from member deposits or wallet balances."
    );
}


/* =========================================================
   20. REPORTS
========================================================= */

function adminRenderReports() {
    const deposits =
        adminFilterByDate(
            nexusAdminState.deposits
        );

    const withdrawals =
        adminFilterByDate(
            nexusAdminState.withdrawals
        );

    const members =
        adminFilterByDate(
            nexusAdminState.profiles
        );

    const successfulDeposits =
        deposits.filter(
            item => item.status === "successful"
        );

    const completedWithdrawals =
        withdrawals.filter(
            item => item.status === "completed"
        );

    adminText(
        "reportDepositTotal",
        formatNexusAdminMoney(
            adminSum(
                successfulDeposits,
                "amount"
            )
        )
    );

    adminText(
        "reportWithdrawalTotal",
        formatNexusAdminMoney(
            adminSum(
                completedWithdrawals,
                "amount"
            )
        )
    );

    adminText(
        "reportNewMembers",
        members.length
    );

    adminText(
        "reportTransactionCount",
        deposits.length + withdrawals.length
    );

    adminSetMessage(
        "adminReportMessage",
        "Report figures are based on the selected date range and currently loaded records.",
        "info"
    );

    const exportButton =
        adminElement("exportAdminReport");

    if (exportButton) {
        exportButton.disabled = false;
    }
}

function adminExportReport() {
    const deposits =
        adminFilterByDate(
            nexusAdminState.deposits
        );

    const withdrawals =
        adminFilterByDate(
            nexusAdminState.withdrawals
        );

    const rows = [
        [
            "Transaction Type",
            "Member",
            "User ID",
            "Amount (GHS)",
            "Method",
            "Reference / Details",
            "Status",
            "Date"
        ]
    ];

    deposits.forEach(item => {
        const profile =
            adminGetProfile(item.user_id);

        rows.push([
            "Deposit",
            profile?.full_name || "",
            item.user_id,
            item.amount,
            item.payment_method,
            item.reference,
            item.status,
            item.created_at
        ]);
    });

    withdrawals.forEach(item => {
        const profile =
            adminGetProfile(item.user_id);

        rows.push([
            "Withdrawal",
            profile?.full_name || "",
            item.user_id,
            item.amount,
            item.withdrawal_method,
            item.payment_details,
            item.status,
            item.created_at
        ]);
    });

    const csv = rows.map(row =>
        row.map(value => {
            const text = String(value ?? "")
                .replace(/"/g, '""');

            return `"${text}"`;
        }).join(",")
    ).join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `nexus-admin-report-${adminLocalDateString(new Date())}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    adminSetMessage(
        "adminReportMessage",
        "Your CSV report has been exported.",
        "success"
    );
}


/* =========================================================
   21. ADMINISTRATOR NOTIFICATIONS
========================================================= */

async function adminLoadNotifications() {
    const list =
        adminElement("adminNotificationsList");

    if (list) {
        list.textContent =
            "Loading notifications...";
    }

    try {
        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_list_nexus_notifications"
            );

        if (error) throw error;

        adminRenderNotifications(data || []);

    } catch (error) {
        console.error(
            "Administrator notification error:",
            error
        );

        if (list) {
            list.textContent =
                "Administrator notifications could not be loaded. Confirm that the admin_list_nexus_notifications() SQL function has been created and deployed.";
        }
    }
}

function adminRenderNotifications(notifications) {
    const list =
        adminElement("adminNotificationsList");

    if (!list) return;

    list.replaceChildren();

    if (!notifications.length) {
        list.textContent =
            "No notifications found.";

        return;
    }

    notifications.forEach(notification => {
        const item =
            document.createElement("div");

        item.className =
            "admin-notification-item";

        const title =
            document.createElement("h4");

        title.textContent =
            notification.title || "Notification";

        const message =
            document.createElement("p");

        message.textContent =
            notification.message || "";

        const details =
            document.createElement("small");

        details.textContent =
            `${notification.type || "General"} · ` +
            `${notification.is_read ? "Read" : "Unread"} · ` +
            `${formatAdminDate(notification.created_at)}`;

        item.append(
            title,
            message,
            details
        );

        list.appendChild(item);
    });
}


/* =========================================================
   22. SETTINGS
========================================================= */

function adminRenderSettings() {
    adminSetMessage(
        "adminSettingsMessage",
        "Your administrator account is authenticated. No editable platform settings table or settings-management function has been confirmed yet. Platform financial settings have therefore not been changed.",
        "info"
    );
}


/* =========================================================
   23. REFRESH FUNCTIONS
========================================================= */

async function adminRefreshDashboard(button) {
    if (!button) {
        await adminLoadCoreData();
        return;
    }

    const originalText =
        button.textContent;

    button.disabled = true;
    button.textContent = "Refreshing...";

    try {
        await adminLoadCoreData();

        if (
            nexusAdminState.currentPage === "trash"
        ) {
            await adminLoadTrash();
        }

        if (
            nexusAdminState.currentPage === "notifications"
        ) {
            await adminLoadNotifications();
        }

    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}


/* =========================================================
   24. EVENT DELEGATION
========================================================= */

function adminHandleActionClick(event) {
    const button =
        event.target.closest("[data-action]");

    if (!button) return;

    const action =
        button.dataset.action;

    const id =
        button.dataset.id;

    if (!id) return;

    if (action === "view-member") {
        adminOpenMemberProfile(id);
    }

    if (action === "suspend-teller") {
        adminUpdateTellerStatus(
            id,
            "suspended"
        );
    }

    if (action === "activate-teller") {
        adminUpdateTellerStatus(
            id,
            "active"
        );
    }

    if (action === "process-withdrawal") {
        adminReviewWithdrawal(
            id,
            "processing"
        );
    }

    if (action === "reject-withdrawal") {
        adminReviewWithdrawal(
            id,
            "rejected"
        );
    }

    if (action === "trash-deposit") {
        adminTrashDeposit(id);
    }

    if (action === "reverse-deposit") {
        adminReverseTransaction(
            "deposit",
            id
        );
    }

    if (action === "restore-deposit") {
        adminRestoreDeposit(id);
    }

    if (action === "delete-deposit") {
        adminPermanentlyDeleteDeposit(id);
    }
}


/* =========================================================
   25. EVENT LISTENERS
========================================================= */

function adminInitializeEvents() {

    // Login.
    adminElement("adminLoginForm")
        ?.addEventListener(
            "submit",
            adminLogin
        );

    // Logout.
    adminElement("adminLogoutButton")
        ?.addEventListener(
            "click",
            adminLogout
        );

    // Sidebar.
    adminElement("sidebarToggle")
        ?.addEventListener(
            "click",
            adminToggleSidebar
        );

    // Sidebar and in-page navigation.
    adminElements("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            adminNavigate(button.dataset.page);
        });
    });

    // Date filter.
    adminElement("applyAdminDateFilter")
        ?.addEventListener(
            "click",
            adminApplyDateFilter
        );

    adminElement("resetAdminDateFilter")
        ?.addEventListener(
            "click",
            adminResetDateFilter
        );

    adminElement("adminDateRange")
        ?.addEventListener("change", event => {
            const range = event.target.value;

            adminShow(
                adminElement("adminDateFrom"),
                range === "custom"
            );

            adminShow(
                adminElement("adminDateTo"),
                range === "custom"
            );

            if (range !== "custom") {
                adminSetDateRange(range);
            }
        });

    // Member search.
    adminElement("memberSearchInput")
        ?.addEventListener(
            "input",
            adminRenderMembers
        );

    adminElement("clearMemberSearch")
        ?.addEventListener("click", () => {
            const search =
                adminElement("memberSearchInput");

            if (search) {
                search.value = "";
            }

            adminRenderMembers();
        });

    // Member profile modal.
    adminElement("closeMemberProfile")
        ?.addEventListener(
            "click",
            adminCloseMemberProfile
        );

    adminElement("closeMemberProfileFooter")
        ?.addEventListener(
            "click",
            adminCloseMemberProfile
        );

    adminElement("suspendMemberButton")
        ?.addEventListener("click", () => {
            adminUpdateMemberStatus("Suspended");
        });

    adminElement("activateMemberButton")
        ?.addEventListener("click", () => {
            adminUpdateMemberStatus("Active");
        });

    // Teller creation and search.
    adminElement("createTellerForm")
        ?.addEventListener(
            "submit",
            adminCreateTeller
        );

    adminElement("tellerSearchInput")
        ?.addEventListener(
            "input",
            adminRenderTellers
        );

    adminElement("refreshTellersButton")
        ?.addEventListener("click", event => {
            adminRefreshDashboard(
                event.currentTarget
            );
        });

    // Refresh deposits.
    adminElement("refreshDepositsButton")
        ?.addEventListener("click", event => {
            adminRefreshDashboard(
                event.currentTarget
            );
        });

    // Refresh trash.
    adminElement("refreshTrashButton")
        ?.addEventListener("click", async event => {
            const button =
                event.currentTarget;

            const originalText =
                button.textContent;

            button.disabled = true;
            button.textContent = "Refreshing...";

            try {
                await adminLoadTrash();

            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });

    // Refresh notifications.
    adminElement("refreshAdminNotifications")
        ?.addEventListener("click", async event => {
            const button =
                event.currentTarget;

            const originalText =
                button.textContent;

            button.disabled = true;
            button.textContent = "Refreshing...";

            try {
                await adminLoadNotifications();

            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });

    // Export report.
    adminElement("exportAdminReport")
        ?.addEventListener(
            "click",
            adminExportReport
        );

    // Table action buttons.
    document.addEventListener(
        "click",
        adminHandleActionClick
    );

    // Escape closes member profile.
    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                adminCloseMemberProfile();
            }
        }
    );
}


/* =========================================================
   26. AUTHENTICATION STATE CHANGES
========================================================= */

nexusAdminSupabase.auth.onAuthStateChange(
    (event, session) => {
        if (
            event === "SIGNED_OUT" ||
            !session
        ) {
            nexusAdminState.user = null;

            adminShowLogin();
        }
    }
);


/* =========================================================
   27. START APPLICATION
========================================================= */

async function adminStart() {
    adminInitializeEvents();

    await adminVerifySession();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        adminStart
    );
} else {
    adminStart();
}

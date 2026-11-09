
/* =========================================
   NEXUS WEALTH PARTNERS
   ADMINISTRATOR DASHBOARD
========================================= */


/* =========================================
   1. SUPABASE CONNECTION
========================================= */

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


/* =========================================
   4. DASHBOARD PAGE TITLES
========================================= */

const adminPageTitles = {
    overview: "Dashboard Overview",
    members: "Members Management",
    withdrawals: "Withdrawal Requests",
    transactions: "Transactions",
    savings: "Savings Management"
};


/* =========================================
   5. SHOW ADMIN LOGIN
========================================= */

function showAdminLogin() {

    adminLoginScreen.hidden = false;

    adminDashboard.hidden = true;

    if (adminLoginForm) {
        adminLoginForm.reset();
    }

    if (adminLoginMessage) {
        adminLoginMessage.textContent = "";
    }

}


/* =========================================
   6. SHOW ADMIN DASHBOARD
========================================= */


async function showAdminDashboard(email) {

    console.log("Verifying Nexus administrator...");

    // Keep dashboard hidden until authorization succeeds.
    adminLoginScreen.hidden = false;
    adminDashboard.hidden = true;

    const { data, error } = await nexusAdminSupabase.rpc(
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

    // Authorization successful.
    adminLoginScreen.hidden = true;
    adminDashboard.hidden = false;

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
            "Administrator verified, but dashboard records could not be loaded: " +
            error.message
        );

    }

}



/* =========================================
   7. ADMIN PAGE NAVIGATION
========================================= */

function showAdminPage(pageName) {

    const selectedPage =
        document.getElementById("page-" + pageName);

    if (!selectedPage) {
        console.error("Admin page not found:", pageName);
        return;
    }

    document.querySelectorAll(".admin-page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".admin-nav-link").forEach(link => {
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
            adminPageTitles[pageName] || "Admin Dashboard";
    }

    if (adminSidebar) {
        adminSidebar.classList.remove("open");
    }

}


/* =========================================
   8. NAVIGATION CLICK EVENTS
========================================= */

document.querySelectorAll("[data-page]").forEach(button => {

    button.addEventListener("click", function() {

        const pageName = this.dataset.page;

        showAdminPage(pageName);

    });

});


/* =========================================
   9. MOBILE SIDEBAR
========================================= */

if (sidebarToggle && adminSidebar) {

    sidebarToggle.addEventListener("click", function() {

        adminSidebar.classList.toggle("open");

    });

}


/* =========================================
   10. DASHBOARD DATE
========================================= */

function updateAdminDate() {

    const dateElement =
        document.getElementById("dashboardDate");

    if (!dateElement) return;

    dateElement.textContent =
        new Intl.DateTimeFormat("en-GH", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());

}

updateAdminDate();


/* =========================================
   11. ADMINISTRATOR LOGIN
========================================= */

if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document
            .getElementById("adminEmail")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("adminPassword")
            .value;

        if (email !== AUTHORIZED_ADMIN_EMAIL) {

            adminLoginMessage.textContent =
                "This email is not authorized for administrator access.";

            return;

        }

        adminLoginButton.disabled = true;

        adminLoginButton.textContent = "Signing In...";

        adminLoginMessage.textContent = "";

        try {

            const { data, error } =
                await nexusAdminSupabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            if (!data.user) {
                throw new Error("Unable to verify your account.");
            }

            const authenticatedEmail =
                (data.user.email || "").trim().toLowerCase();

            if (authenticatedEmail !== AUTHORIZED_ADMIN_EMAIL) {

                await nexusAdminSupabase.auth.signOut();

                throw new Error(
                    "This account is not authorized to access the admin dashboard."
                );

            }

            await showAdminDashboard(authenticatedEmail);

            console.log(
                "Administrator authenticated successfully."
            );

        } catch (error) {

            console.error("Administrator login error:", error);

            adminLoginMessage.textContent =
                error.message ||
                "Login failed. Please check your details and try again.";

        } finally {

            adminLoginButton.disabled = false;

            adminLoginButton.textContent =
                "Sign In to Dashboard";

        }

    });

}


/* =========================================
   12. CHECK EXISTING LOGIN SESSION
========================================= */

async function checkAdminSession() {

    try {

        const { data, error } =
            await nexusAdminSupabase.auth.getSession();

        if (error) {
            throw error;
        }

        const user = data.session?.user;

        if (!user) {

            showAdminLogin();

            return;

        }

        const email =
            (user.email || "").trim().toLowerCase();

        if (email !== AUTHORIZED_ADMIN_EMAIL) {

            await nexusAdminSupabase.auth.signOut();

            showAdminLogin();

            return;

        }

        await showAdminDashboard(email);

    } catch (error) {

        console.error("Admin session error:", error);

        showAdminLogin();

    }

}


/* =========================================
   13. ADMIN SIGN OUT
========================================= */

if (adminLogoutButton) {

    adminLogoutButton.addEventListener("click", async function() {

        const confirmed = window.confirm(
            "Are you sure you want to sign out?"
        );

        if (!confirmed) return;

        adminLogoutButton.disabled = true;

        try {

            const { error } =
                await nexusAdminSupabase.auth.signOut();

            if (error) {
                throw error;
            }

            showAdminLogin();

        } catch (error) {

            console.error("Admin logout error:", error);

            alert(
                "Unable to sign out. Please try again."
            );

        } finally {

            adminLogoutButton.disabled = false;

        }

    });

}


/* =========================================
   14. AUTHENTICATION STATE
========================================= */

nexusAdminSupabase.auth.onAuthStateChange(
    (event, session) => {

        if (event === "SIGNED_OUT") {

            showAdminLogin();

        }

    }
);



/* =========================================
   16. LIVE DASHBOARD DATA
========================================= */

function formatNexusAdminMoney(amount) {

    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2
    }).format(Number(amount) || 0);

}


function createAdminTableCell(value) {

    const cell = document.createElement("td");

    cell.textContent =
        value === null || value === undefined || value === ""
            ? "—"
            : String(value);

    return cell;

}


function showAdminTableMessage(tableId, columnCount, message) {

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

    return new Intl.DateTimeFormat("en-GH", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(new Date(value));

}


function getAdminMemberName(userId, profiles) {

    const profile = profiles.find(
        item => item.id === userId
    );

    return profile?.full_name || profile?.member_id || userId;

}


/* =========================================
   17. LOAD MEMBERS
========================================= */

function displayAdminMembers(profiles) {

    const table = document.getElementById("membersTable");

    if (!table) return;

    if (!profiles.length) {

        showAdminTableMessage(
            "membersTable",
            5,
            "No registered members found."
        );

        return;

    }

    table.replaceChildren();

    profiles.forEach(profile => {

        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(profile.member_id)
        );

        row.appendChild(
            createAdminTableCell(profile.full_name)
        );

        // Email is not currently stored in the profiles table.
        row.appendChild(
            createAdminTableCell("Not available")
        );

        row.appendChild(
            createAdminTableCell(profile.phone)
        );

        row.appendChild(
            createAdminTableCell(
                formatAdminDate(profile.created_at)
            )
        );

        table.appendChild(row);

    });

}


/* =========================================
   18. LOAD WITHDRAWAL REQUESTS
========================================= */

function displayAdminWithdrawals(withdrawals, profiles) {

    const table = document.getElementById("withdrawalsTable");

    const recentTable =
        document.getElementById("recentWithdrawalsTable");

    if (!withdrawals.length) {

        showAdminTableMessage(
            "withdrawalsTable",
            7,
            "No withdrawal requests found."
        );

        showAdminTableMessage(
            "recentWithdrawalsTable",
            5,
            "No withdrawal requests found."
        );

        return;

    }

    table.replaceChildren();

    if (recentTable) {
        recentTable.replaceChildren();
    }

    withdrawals.forEach((request, index) => {

        const memberName = getAdminMemberName(
            request.user_id,
            profiles
        );

        const requestId = String(request.id).slice(0, 8);

        const methodLabels = {
            mtn_momo: "MTN Mobile Money",
            telecel_cash: "Telecel Cash",
            at_money: "AT Money",
            bank: "Bank Account"
        };

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
                methodLabels[request.withdrawal_method] ||
                request.withdrawal_method
            )
        );

        row.appendChild(
            createAdminTableCell(request.payment_details)
        );

        const statusCell = createAdminTableCell(
    request.status.toUpperCase()
);

row.appendChild(statusCell);

const actionCell = document.createElement("td");

if (
    request.status === "pending" ||
    request.status === "processing"
) {

    if (request.status === "pending") {

        const processButton = document.createElement("button");

        processButton.textContent = "Process";

        processButton.className = "admin-action-button";

        processButton.addEventListener("click", () => {
            reviewNexusWithdrawal(request.id, "processing");
        });

        actionCell.appendChild(processButton);

    }

    const rejectButton = document.createElement("button");

    rejectButton.textContent = "Reject";

    rejectButton.className = "admin-action-button reject";

    rejectButton.addEventListener("click", () => {
        reviewNexusWithdrawal(request.id, "rejected");
    });

    actionCell.appendChild(rejectButton);

} else {

    actionCell.textContent = "No action";

}

row.appendChild(actionCell);

        row.appendChild(
            createAdminTableCell(
                formatAdminDate(request.created_at)
            )
        );

        table.appendChild(row);

        // Show the five most recent requests on overview.
        if (index < 5 && recentTable) {

            const recentRow = document.createElement("tr");

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
                    methodLabels[request.withdrawal_method] ||
                    request.withdrawal_method
                )
            );

            recentRow.appendChild(
                createAdminTableCell(request.status.toUpperCase())
            );

            recentTable.appendChild(recentRow);

        }

    });

}


/* =========================================
   19. LOAD WALLET AND SAVINGS DATA
========================================= */

function displayAdminSavings(wallets, profiles) {

    const table = document.getElementById("savingsTable");

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

        row.appendChild(
            createAdminTableCell(
                profiles.find(
                    profile => profile.id === wallet.user_id
                )?.member_id
            )
        );

        row.appendChild(
            createAdminTableCell(
                getAdminMemberName(wallet.user_id, profiles)
            )
        );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(wallet.balance)
            )
        );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(wallet.total_deposits)
            )
        );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(wallet.total_withdrawals)
            )
        );

        table.appendChild(row);

    });

}


/* =========================================
   20. LOAD ALL DASHBOARD RECORDS
========================================= */

async function loadAdminDashboardData() {

    console.log("Loading Nexus admin dashboard data...");

    const [
        profilesResult,
        walletsResult,
        withdrawalsResult
    ] = await Promise.all([

        nexusAdminSupabase
            .from("profiles")
            .select("id, full_name, phone, member_id, created_at")
            .order("created_at", { ascending: false }),

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
            .order("created_at", { ascending: false })

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

    const profiles = profilesResult.data || [];
    const wallets = walletsResult.data || [];
    const withdrawals = withdrawalsResult.data || [];

    /* TOTAL MEMBERS */

    document.getElementById("totalMembers").textContent =
        profiles.length.toLocaleString("en-GH");


    /* TOTAL WALLET BALANCES */

    const totalBalances = wallets.reduce(
        (sum, wallet) => sum + Number(wallet.balance || 0),
        0
    );

    document.getElementById("totalWalletBalances").textContent =
        formatNexusAdminMoney(totalBalances);


    /* TOTAL DEPOSITS */

    const totalDeposits = wallets.reduce(
        (sum, wallet) => sum + Number(wallet.total_deposits || 0),
        0
    );

    document.getElementById("totalDeposits").textContent =
        formatNexusAdminMoney(totalDeposits);


    /* TOTAL WITHDRAWALS */

    const totalWithdrawals = wallets.reduce(
        (sum, wallet) => sum + Number(wallet.total_withdrawals || 0),
        0
    );

    document.getElementById("totalWithdrawals").textContent =
        formatNexusAdminMoney(totalWithdrawals);


    /* WITHDRAWAL COUNTS */

    const pending = withdrawals.filter(
        request => request.status === "pending"
    ).length;

    const processing = withdrawals.filter(
        request => request.status === "processing"
    ).length;

    const completed = withdrawals.filter(
        request => request.status === "completed"
    ).length;

    document.getElementById(
        "overviewPendingWithdrawals"
    ).textContent = pending;

    document.getElementById(
        "overviewProcessingWithdrawals"
    ).textContent = processing;

    document.getElementById(
        "overviewCompletedWithdrawals"
    ).textContent = completed;


    /* PENDING SIDEBAR BADGE */

    const badge = document.getElementById(
        "pendingWithdrawalBadge"
    );

    if (badge) {

        badge.textContent = pending;
        badge.hidden = pending === 0;

    }


    /* DISPLAY TABLES */

    displayAdminMembers(profiles);

    displayAdminWithdrawals(withdrawals, profiles);

    displayAdminSavings(wallets, profiles);


    console.log("Nexus admin dashboard data loaded.", {
        members: profiles.length,
        wallets: wallets.length,
        withdrawalRequests: withdrawals.length
    });

}

/* =========================================
   22. ADMIN WITHDRAWAL REVIEW
========================================= */

async function reviewNexusWithdrawal(requestId, action) {

    const actionName =
        action === "processing" ? "process" : "reject";

    const confirmed = window.confirm(
        `Are you sure you want to ${actionName} this withdrawal request?`
    );

    if (!confirmed) return;

    try {

        const { data, error } =
            await nexusAdminSupabase.rpc(
                "admin_review_withdrawal",
                {
                    p_request_id: requestId,
                    p_action: action
                }
            );

        if (error) {
            throw error;
        }

        if (!data || data.success !== true) {
            throw new Error(
                data?.message || "Withdrawal update failed."
            );
        }

        alert(data.message);

        await loadAdminDashboardData();

    } catch (error) {

        console.error(
            "Withdrawal review error:",
            error
        );

        alert(
            "Unable to update withdrawal: " + error.message
        );

    }

}

/* =========================================
   21. START ADMIN DASHBOARD
========================================= */

checkAdminSession();

console.log(
    "Nexus Wealth Partners Admin Dashboard initialized."
);


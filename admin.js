
/* =========================================
   NEXUS WEALTH PARTNERS
   COMPLETE ADMINISTRATOR DASHBOARD
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
   5. HELPER FUNCTIONS
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
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);

}


function getAdminMemberName(userId, profiles) {

    const profile = profiles.find(
        item => item.id === userId
    );

    return profile?.full_name ||
        profile?.member_id ||
        userId;

}


/* =========================================
   6. SHOW ADMIN LOGIN
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

}


/* =========================================
   7. SHOW ADMIN DASHBOARD
========================================= */

async function showAdminDashboard(email) {

    console.log("Verifying Nexus administrator...");

    if (adminLoginScreen) {
        adminLoginScreen.hidden = false;
    }

    if (adminDashboard) {
        adminDashboard.hidden = true;
    }

    const { data, error } =
        await nexusAdminSupabase.rpc("is_nexus_admin");

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

    await loadAdminDashboardData();

}


/* =========================================
   8. ADMIN PAGE NAVIGATION
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
   9. NAVIGATION CLICK EVENTS
========================================= */

document.querySelectorAll(".admin-nav-link[data-page]")
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
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());

}

updateAdminDate();


/* =========================================
   12. ADMINISTRATOR LOGIN
========================================= */

if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document
            .getElementById("adminEmail")
            ?.value.trim().toLowerCase();

        const password = document
            .getElementById("adminPassword")
            ?.value;

        if (!email || !password) {

            adminLoginMessage.textContent =
                "Enter your administrator email and password.";

            return;

        }

        if (email !== AUTHORIZED_ADMIN_EMAIL) {

            adminLoginMessage.textContent =
                "This email is not authorized for administrator access.";

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
                await nexusAdminSupabase.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

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

    });

}


/* =========================================
   13. CHECK EXISTING LOGIN SESSION
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
   14. ADMIN SIGN OUT
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

            if (error) throw error;

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
   15. AUTHENTICATION STATE
========================================= */

nexusAdminSupabase.auth.onAuthStateChange(
    (event) => {

        if (event === "SIGNED_OUT") {
            showAdminLogin();
        }

    }
);


/* =========================================
   16. LOAD MEMBERS
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

        table.appendChild(row);

    });

}


/* =========================================
   17. LOAD WITHDRAWAL REQUESTS
========================================= */

function displayAdminWithdrawals(withdrawals, profiles) {

    const table =
        document.getElementById("withdrawalsTable");

    const recentTable =
        document.getElementById("recentWithdrawalsTable");

    if (!withdrawals.length) {

        showAdminTableMessage(
            "withdrawalsTable",
            8,
            "No withdrawal requests found."
        );

        showAdminTableMessage(
            "recentWithdrawalsTable",
            5,
            "No withdrawal requests found."
        );

        return;

    }

    if (table) {
        table.replaceChildren();
    }

    if (recentTable) {
        recentTable.replaceChildren();
    }

    const methodLabels = {
        mtn_momo: "MTN Mobile Money",
        telecel_cash: "Telecel Cash",
        at_money: "AT Money",
        bank: "Bank Account"
    };

    withdrawals.forEach((request, index) => {

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
                methodLabels[request.withdrawal_method] ||
                request.withdrawal_method
            )
        );

        row.appendChild(
            createAdminTableCell(request.payment_details)
        );

        const statusCell = createAdminTableCell(
            String(request.status || "").toUpperCase()
        );

        statusCell.className =
            "transaction-status status-" + request.status;

        row.appendChild(statusCell);

        const actionCell = document.createElement("td");

        if (
            request.status === "pending" ||
            request.status === "processing"
        ) {

            if (request.status === "pending") {

                const processButton =
                    document.createElement("button");

                processButton.type = "button";
                processButton.textContent = "Process";
                processButton.className = "admin-action-button";

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

        row.appendChild(
            createAdminTableCell(
                formatAdminDate(request.created_at)
            )
        );

        if (table) {
            table.appendChild(row);
        }

        // FIVE MOST RECENT REQUESTS
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
                createAdminTableCell(
                    String(request.status || "").toUpperCase()
                )
            );

            recentTable.appendChild(recentRow);

        }

    });

}


/* =========================================
   18. CALCULATE MEMBER DISPLAY BALANCE
========================================= */

function getMemberPendingWithdrawalTotal(userId, withdrawals) {

    return withdrawals
        .filter(request =>
            request.user_id === userId &&
            ["pending", "processing"].includes(request.status)
        )
        .reduce((total, request) => {

            return total + (Number(request.amount) || 0);

        }, 0);

}


function getMemberDisplayBalance(wallet, withdrawals) {

    const actualBalance =
        Number(wallet.balance) || 0;

    const pendingAmount =
        getMemberPendingWithdrawalTotal(
            wallet.user_id,
            withdrawals
        );

    return Math.max(
        0,
        actualBalance - pendingAmount
    );

}


/* =========================================
   19. LOAD WALLET AND SAVINGS DATA
========================================= */

function displayAdminSavings(wallets, profiles, withdrawals) {

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

        // MEMBER ID
        row.appendChild(
            createAdminTableCell(
                memberProfile?.member_id
            )
        );

        // MEMBER NAME
        row.appendChild(
            createAdminTableCell(
                getAdminMemberName(
                    wallet.user_id,
                    profiles
                )
            )
        );

        // ADJUSTED WALLET BALANCE
        const displayBalance =
            getMemberDisplayBalance(
                wallet,
                withdrawals
            );

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(displayBalance)
            )
        );

        // TOTAL DEPOSITS
        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    wallet.total_deposits
                )
            )
        );

        // COMPLETED WITHDRAWALS
        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    wallet.total_withdrawals
                )
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
            .select(
                "id, full_name, phone, member_id, email, created_at"
            )
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

    const totalMembersElement =
        document.getElementById("totalMembers");

    if (totalMembersElement) {

        totalMembersElement.textContent =
            profiles.length.toLocaleString("en-GH");

    }


    /* TOTAL ADJUSTED WALLET BALANCES */

    const totalBalances = wallets.reduce(
        (sum, wallet) => {

            return sum + getMemberDisplayBalance(
                wallet,
                withdrawals
            );

        },
        0
    );

    const totalWalletBalancesElement =
        document.getElementById("totalWalletBalances");

    if (totalWalletBalancesElement) {

        totalWalletBalancesElement.textContent =
            formatNexusAdminMoney(totalBalances);

    }


    /* TOTAL DEPOSITS */

    const totalDeposits = wallets.reduce(
        (sum, wallet) => {

            return sum +
                (Number(wallet.total_deposits) || 0);

        },
        0
    );

    const totalDepositsElement =
        document.getElementById("totalDeposits");

    if (totalDepositsElement) {

        totalDepositsElement.textContent =
            formatNexusAdminMoney(totalDeposits);

    }


    /* COMPLETED WITHDRAWALS */

    const totalWithdrawals = wallets.reduce(
        (sum, wallet) => {

            return sum +
                (Number(wallet.total_withdrawals) || 0);

        },
        0
    );

    const totalWithdrawalsElement =
        document.getElementById("totalWithdrawals");

    if (totalWithdrawalsElement) {

        totalWithdrawalsElement.textContent =
            formatNexusAdminMoney(totalWithdrawals);

    }


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


    const pendingElement =
        document.getElementById("overviewPendingWithdrawals");

    const processingElement =
        document.getElementById("overviewProcessingWithdrawals");

    const completedElement =
        document.getElementById("overviewCompletedWithdrawals");


    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (processingElement) {
        processingElement.textContent = processing;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }


    /* PENDING SIDEBAR BADGE */

    const badge = document.getElementById(
        "pendingWithdrawalBadge"
    );

    if (badge) {

        badge.textContent = pending;

        badge.hidden = pending === 0;

    }


    /* DISPLAY ALL TABLES */

    displayAdminMembers(profiles);

    displayAdminWithdrawals(
        withdrawals,
        profiles
    );

    displayAdminSavings(
        wallets,
        profiles,
        withdrawals
    );


    console.log("Nexus admin dashboard data loaded.", {

        members: profiles.length,

        wallets: wallets.length,

        withdrawalRequests: withdrawals.length,

        pendingWithdrawals: pending,

        processingWithdrawals: processing,

        completedWithdrawals: completed

    });

}


/* =========================================
   21. ADMIN WITHDRAWAL REVIEW
========================================= */

async function reviewNexusWithdrawal(requestId, action) {

    if (!["processing", "rejected"].includes(action)) {

        alert("Invalid withdrawal action.");

        return;

    }

    const actionName =
        action === "processing"
            ? "process"
            : "reject";

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
                data?.message ||
                "Withdrawal update failed."
            );

        }

        alert(
            data.message ||
            (
                action === "rejected"
                    ? "Withdrawal rejected successfully. The member's displayed balance will be restored."
                    : "Withdrawal moved to processing successfully."
            )
        );

        // REFRESH ALL ADMIN RECORDS
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
   22. START ADMIN DASHBOARD
========================================= */

checkAdminSession();

console.log(
    "Nexus Wealth Partners Admin Dashboard initialized."
);

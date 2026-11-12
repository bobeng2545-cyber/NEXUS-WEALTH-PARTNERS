
/* =========================================
   NEXUS WEALTH PARTNERS
   COMPLETE ADMINISTRATOR DASHBOARD
   UPDATED AND CORRECTED VERSION
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

    withdrawals: "Withdrawal Requests",

    deposits: "Deposits Management",

    transactions: "Transactions",

    savings: "Savings Management"

};


/* =========================================
   5. HELPER FUNCTIONS
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


/* DATE ONLY */

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


/* DATE AND TIME */

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

    console.log(
        "Verifying Nexus administrator..."
    );

    if (adminLoginScreen) {
        adminLoginScreen.hidden = false;
    }

    if (adminDashboard) {
        adminDashboard.hidden = true;
    }

    /*
       VERIFY ADMINISTRATOR USING SUPABASE RPC

       The database function is the actual
       authorization check.
    */

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
   8. ADMIN PAGE NAVIGATION
========================================= */

function showAdminPage(pageName) {

    const selectedPage =
        document.getElementById(
            "page-" + pageName
        );

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

}


/* =========================================
   9. NAVIGATION CLICK EVENTS
========================================= */

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
   12. ADMINISTRATOR LOGIN
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

                adminLoginButton.textContent =
                    "Signing In...";

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

                if (error) {
                    throw error;
                }

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
   13. CHECK EXISTING LOGIN SESSION
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
   14. ADMIN SIGN OUT
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

                if (error) {
                    throw error;
                }

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

function displayAdminMembers(profiles = []) {

    const table =
        document.getElementById("membersTable");

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
            createAdminTableCell(
                profile.member_id
            )
        );

        row.appendChild(
            createAdminTableCell(
                profile.full_name
            )
        );

        row.appendChild(
            createAdminTableCell(
                profile.email
            )
        );

        row.appendChild(
            createAdminTableCell(
                profile.phone
            )
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

function displayAdminWithdrawals(
    withdrawals = [],
    profiles = []
) {

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
                getAdminPaymentMethodLabel(
                    request.withdrawal_method
                )
            )
        );

        row.appendChild(
            createAdminTableCell(
                request.payment_details
            )
        );

        row.appendChild(
            createAdminStatusCell(request.status)
        );

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

                processButton.addEventListener(
                    "click",
                    () => {

                        reviewNexusWithdrawal(
                            request.id,
                            "processing"
                        );

                    }
                );

                actionCell.appendChild(
                    processButton
                );

            }

            const rejectButton =
                document.createElement("button");

            rejectButton.type = "button";

            rejectButton.textContent = "Reject";

            rejectButton.className =
                "admin-action-button reject";

            rejectButton.addEventListener(
                "click",
                () => {

                    reviewNexusWithdrawal(
                        request.id,
                        "rejected"
                    );

                }
            );

            actionCell.appendChild(
                rejectButton
            );

        } else {

            actionCell.textContent = "No action";

        }

        row.appendChild(actionCell);

        const dateTimeCell =
            createAdminTableCell(
                formatAdminDateTime(request.created_at)
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
                    String(request.status || "")
                        .toUpperCase()
                )
            );

            recentTable.appendChild(recentRow);

        }

    });

}


/* =========================================
   18. WALLET BALANCE CALCULATION
========================================= */

/*
   IMPORTANT:

   The customer's wallet is already reduced
   when the withdrawal request is submitted.

   Therefore, pending and processing withdrawals
   must NOT be deducted again here.

   The actual wallet balance is the correct
   amount to display.
*/

function getMemberDisplayBalance(wallet) {

    return getAdminNumber(
        wallet?.balance
    );

}


/* =========================================
   19. DEPOSIT AND WITHDRAWAL TOTALS
========================================= */

function getSuccessfulDepositsForMember(
    userId,
    deposits = []
) {

    return deposits

        .filter(deposit =>

            deposit.user_id === userId &&

            normalizeAdminStatus(deposit.status) ===
                "successful"

        )

        .reduce((total, deposit) => {

            return total +
                getAdminNumber(deposit.amount);

        }, 0);

}


function getCompletedWithdrawalsForMember(
    userId,
    withdrawals = []
) {

    return withdrawals

        .filter(request =>

            request.user_id === userId &&

            normalizeAdminStatus(request.status) ===
                "completed"

        )

        .reduce((total, request) => {

            return total +
                getAdminNumber(request.amount);

        }, 0);

}


/* =========================================
   20. LOAD WALLET AND SAVINGS DATA
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

        const row =
            document.createElement("tr");

        const memberProfile =
            profiles.find(
                profile =>
                    profile.id === wallet.user_id
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

        /*
           CURRENT WALLET BALANCE

           Pending and processing withdrawals
           have already been deducted.
        */

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    getMemberDisplayBalance(wallet)
                )
            )
        );

        /*
           SUCCESSFUL DEPOSITS ONLY
        */

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

        /*
           COMPLETED WITHDRAWALS ONLY
        */

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
   21. DEPOSIT MANAGEMENT
========================================= */


/* DISPLAY DEPOSIT RECORDS */

function displayAdminDeposits(
    deposits = [],
    profiles = []
) {

    const table =
        document.getElementById("depositsTable");

    if (!table) return;

    if (!deposits.length) {

        showAdminTableMessage(
            "depositsTable",
            7,
            "No deposit transactions found."
        );

        return;

    }

    table.replaceChildren();

    deposits.forEach(deposit => {

        const row =
            document.createElement("tr");

        /*
           PAYMENT REFERENCE
        */

        row.appendChild(
            createAdminTableCell(
                deposit.reference || deposit.id
            )
        );

        /*
           MEMBER NAME
        */

        row.appendChild(
            createAdminTableCell(
                getAdminMemberName(
                    deposit.user_id,
                    profiles
                )
            )
        );

        /*
           DEPOSIT AMOUNT
        */

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    deposit.amount
                )
            )
        );

        /*
           PAYMENT METHOD
        */

        row.appendChild(
            createAdminTableCell(
                getAdminPaymentMethodLabel(
                    deposit.payment_method
                )
            )
        );

        /*
           PAYMENT PHONE
        */

        row.appendChild(
            createAdminTableCell(
                deposit.payment_phone
            )
        );

        /*
           PAYMENT STATUS
        */

        row.appendChild(
            createAdminStatusCell(
                deposit.status
            )
        );

        /*
           DATE AND TIME
        */

        const dateCell =
            createAdminTableCell(
                formatAdminDateTime(
                    deposit.created_at
                )
            );

        if (deposit.created_at) {

            dateCell.title =
                String(deposit.created_at);

        }

        row.appendChild(dateCell);

        table.appendChild(row);

    });

    console.log(
        "Nexus deposit records displayed:",
        deposits.length
    );

}


/* =========================================
   UPDATE DEPOSIT STATISTICS
========================================= */

function updateAdminDepositStatistics(
    deposits = [],
    depositsAvailable = true
) {

    const pendingElement =
        document.getElementById(
            "adminPendingDeposits"
        );

    const successfulElement =
        document.getElementById(
            "adminSuccessfulDeposits"
        );

    const failedElement =
        document.getElementById(
            "adminFailed

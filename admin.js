
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

    trash: "Transaction Trash",

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

   /* SAVE THE AUTHENTICATED ADMINISTRATOR ID */
   
   const { data: adminUserData, error: adminUserError } =
      await nexusAdminSupabase.auth.getUser();
   
   if (adminUserError || !adminUserData.user) {
      throw new Error(
         "Could not verify the administrator account."
      );
   }

currentAdminUserId = adminUserData.user.id;

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
   16. MEMBER MANAGEMENT
========================================= */

/*
   Cached dashboard records.
   These are populated by loadAdminDashboardData().
*/

let adminProfilesCache = [];
let adminWalletsCache = [];
let adminDepositsCache = [];
let adminWithdrawalsCache = [];
let adminDepositsAvailable = true;
let currentAdminUserId = null;


/* =========================================
   MEMBER SEARCH AND DIRECTORY
========================================= */

function displayAdminMembers(profiles = []) {

    const table = document.getElementById("membersTable");

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

        viewButton.className =
            "view-member-button";

        viewButton.textContent =
            "View Profile";

        viewButton.addEventListener("click", () => {

            openAdminMemberProfile(profile.id);

        });

        actionCell.appendChild(viewButton);

        row.appendChild(actionCell);

        table.appendChild(row);

    });

}


/* =========================================
   MEMBER SEARCH EVENTS
========================================= */

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
   MEMBER PROFILE MODAL
========================================= */

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

    const successfulDeposits =
        getSuccessfulDepositsForMember(
            userId,
            adminDepositsCache
        );

    const completedWithdrawals =
        getCompletedWithdrawalsForMember(
            userId,
            adminWithdrawalsCache
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

    setProfileValue(
        "profileMemberId",
        profile.member_id
    );

    setProfileValue(
        "profileMemberName",
        profile.full_name
    );

    setProfileValue(
        "profileMemberEmail",
        profile.email
    );

    setProfileValue(
        "profileMemberPhone",
        profile.phone
    );

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

    displayAdminMemberTransactions(userId);

    const modal =
       document.getElementById("memberProfileModal");
   
   if (modal) {
      
      // Remember the member whose profile is open.
      modal.dataset.memberId = userId;
      
      // Display the correct Suspend or Activate button.
      updateMemberAccountActionButtons(profile);
      
      modal.hidden = false;
      
      document.body.style.overflow = "hidden";
   
   }

}

/* =========================================
   MEMBER ACCOUNT STATUS MANAGEMENT
========================================= */

const suspendMemberButton =
    document.getElementById("suspendMemberButton");

const activateMemberButton =
    document.getElementById("activateMemberButton");


/* SHOW THE CORRECT ACCOUNT ACTION */

function updateMemberAccountActionButtons(profile) {

    if (!suspendMemberButton || !activateMemberButton) {
        return;
    }

    suspendMemberButton.hidden = true;
    activateMemberButton.hidden = true;

    suspendMemberButton.disabled = false;
    activateMemberButton.disabled = false;

    if (!profile) return;

    /*
       NEVER SHOW ACCOUNT CONTROLS
       ON THE CURRENT ADMINISTRATOR'S PROFILE.
    */

    if (
        profile.id === currentAdminUserId ||
        String(profile.email || "").toLowerCase() ===
            AUTHORIZED_ADMIN_EMAIL
    ) {
        return;
    }

    const status = normalizeAdminStatus(profile.status);

    if (status === "active") {

        suspendMemberButton.hidden = false;

    } else if (status === "suspended") {

        activateMemberButton.hidden = false;

    }

}


/* CHANGE MEMBER ACCOUNT STATUS */

async function updateNexusMemberStatus(newStatus) {

    const profile = adminProfilesCache.find(
        member =>
            member.id ===
            document.getElementById("memberProfileModal")
                ?.dataset.memberId
    );

    if (!profile) {

        alert("Member information could not be found.");

        return;

    }

    if (
        !["Active", "Suspended"].includes(newStatus)
    ) {
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

    const action =
        newStatus === "Suspended"
            ? "suspend"
            : "activate";

    const confirmed = window.confirm(
        newStatus === "Suspended"

            ? `Are you sure you want to suspend ${profile.full_name || "this member"}? The member will not be able to initiate new deposits or withdrawals.`

            : `Are you sure you want to activate ${profile.full_name || "this member"}?`
    );

    if (!confirmed) return;

    const button =
        newStatus === "Suspended"
            ? suspendMemberButton
            : activateMemberButton;

    const originalText = button?.textContent || "";

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

        if (error) {
            throw error;
        }

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "The member account status could not be updated."
            );
        }

        /*
           UPDATE THE LOCAL MEMBER RECORD.
        */

        profile.status = newStatus;

        /*
           REFRESH THE MEMBER DIRECTORY.
        */

        displayAdminMembers(adminProfilesCache);

        /*
           REFRESH THE OPEN PROFILE.
        */

        openAdminMemberProfile(profile.id);

        alert(
           data.message ||
           `Member account ${newStatus.toLowerCase()} successfully.`
        );
       
        console.log(
            "Member account status updated:",
            data
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


/* SUSPEND BUTTON */

if (suspendMemberButton) {

    suspendMemberButton.addEventListener(
        "click",
        () => updateNexusMemberStatus("Suspended")
    );

}


/* ACTIVATE BUTTON */

if (activateMemberButton) {

    activateMemberButton.addEventListener(
        "click",
        () => updateNexusMemberStatus("Active")
    );

}


/* =========================================
   MEMBER TRANSACTION HISTORY
========================================= */

function displayAdminMemberTransactions(userId) {

    const table =
        document.getElementById(
            "memberProfileTransactions"
        );

    if (!table) return;

    const memberTransactions = [];

    if (adminDepositsAvailable) {

        adminDepositsCache

            .filter(deposit =>
                deposit.user_id === userId
            )

            .forEach(deposit => {

                memberTransactions.push({

                    reference:
                        deposit.reference || deposit.id,

                    type: "Deposit",

                    amount: deposit.amount,

                    status: deposit.status,

                    created_at: deposit.created_at

                });

            });

    }

    adminWithdrawalsCache

        .filter(withdrawal =>
            withdrawal.user_id === userId
        )

        .forEach(withdrawal => {

            memberTransactions.push({

                reference:
                    "WDR-" +
                    String(withdrawal.id).slice(0, 8),

                type: "Withdrawal",

                amount: withdrawal.amount,

                status: withdrawal.status,

                created_at: withdrawal.created_at

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
                ? "No transactions found for this member."
                : "Deposit history is currently unavailable."
        );

        return;

    }

    table.replaceChildren();

    memberTransactions.forEach(transaction => {

        const row = document.createElement("tr");

        row.appendChild(
            createAdminTableCell(
                transaction.reference
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
   CLOSE MEMBER PROFILE MODAL
========================================= */

function closeAdminMemberProfile() {

    const modal =
        document.getElementById("memberProfileModal");

    if (modal) {

        modal.hidden = true;

        document.body.style.overflow = "";

        // Clear the selected member after closing.
        delete modal.dataset.memberId;

    }

    // Hide both account action buttons.
    if (suspendMemberButton) {

        suspendMemberButton.hidden = true;
        suspendMemberButton.disabled = false;

    }

    if (activateMemberButton) {

        activateMemberButton.hidden = true;
        activateMemberButton.disabled = false;

    }

}


/* =========================================
   MEMBER PROFILE CLOSE EVENT LISTENERS
========================================= */

const closeMemberProfile =
    document.getElementById("closeMemberProfile");

const closeMemberProfileFooter =
    document.getElementById("closeMemberProfileFooter");

const memberProfileModal =
    document.getElementById("memberProfileModal");


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


/* =========================================
   SECURE ADMIN DEPOSIT VERIFICATION
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

    const originalText = button
        ? button.textContent
        : "Verify";

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

                if (response && typeof response.json === "function") {
                    const result = await response.json();
                    details = result.message || "";
                }
            } catch (_) {
                // Keep the original function error.
            }

            throw new Error(
                details || error.message ||
                "Could not contact the verification service."
            );
        }

        if (!data || data.success !== true) {
            throw new Error(
                data?.message || "Deposit verification was unsuccessful."
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
   DISPLAY DEPOSIT RECORDS
   WITH MOVE-TO-TRASH BUTTON
========================================= */

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
            8,
            "No deposit transactions found."
        );

        return;

    }

    table.replaceChildren();

    deposits.forEach(deposit => {

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
            createAdminTableCell(
                deposit.payment_phone
            )
        );

        row.appendChild(
            createAdminStatusCell(deposit.status)
        );

        row.appendChild(
            createAdminTableCell(
                formatAdminDateTime(deposit.created_at)
            )
        );

        /* ACTION BUTTONS */

        const actionCell =
            document.createElement("td");

        const status =
            normalizeAdminStatus(deposit.status);

        if (status === "pending") {

            const verifyButton =
                document.createElement("button");

            verifyButton.type = "button";

            verifyButton.textContent = "Verify Deposit";

            verifyButton.className =
                "admin-action-button";

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

        /* MOVE TRANSACTION TO TRASH */

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
            "adminFailedDeposits"
        );

    const totalElement =
        document.getElementById(
            "adminDepositTotal"
        );

    const badge =
        document.getElementById(
            "pendingDepositBadge"
        );

    if (!depositsAvailable) {

        if (pendingElement) {
            pendingElement.textContent = "—";
        }

        if (successfulElement) {
            successfulElement.textContent = "—";
        }

        if (failedElement) {
            failedElement.textContent = "—";
        }

        if (totalElement) {
            totalElement.textContent = "Unavailable";
        }

        if (badge) {
            badge.hidden = true;
        }

        return;

    }

    const pendingDeposits =
        deposits.filter(deposit =>

            normalizeAdminStatus(deposit.status) ===
                "pending"

        );

    const successfulDeposits =
        deposits.filter(deposit =>

            normalizeAdminStatus(deposit.status) ===
                "successful"

        );

    const failedDeposits =
        deposits.filter(deposit =>

            normalizeAdminStatus(deposit.status) ===
                "failed"

        );

    const successfulTotal =
        successfulDeposits.reduce(
            (total, deposit) => {

                return total +
                    getAdminNumber(deposit.amount);

            },
            0
        );

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

        badge.textContent =
            pendingDeposits.length;

        badge.hidden =
            pendingDeposits.length === 0;

    }

}


/* =========================================
   22. DISPLAY ALL FINANCIAL TRANSACTIONS
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

    /*
       CREATE TABLE HEADINGS
    */

    const parentTable =
        table.closest("table");

    if (parentTable) {

        let thead =
            parentTable.querySelector("thead");

        if (!thead) {

            thead =
                document.createElement("thead");

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

            "Date & Time"

        ].forEach(heading => {

            const th =
                document.createElement("th");

            th.textContent = heading;

            headingRow.appendChild(th);

        });

        thead.replaceChildren(headingRow);

    }


    /*
       COMBINE TRANSACTIONS
    */

    const transactions = [];


    /* DEPOSITS */

    deposits.forEach(deposit => {

        transactions.push({

            id: deposit.id,

            reference: deposit.reference,

            user_id: deposit.user_id,

            type: "Deposit",

            amount: deposit.amount,

            payment_method: deposit.payment_method,

            status: deposit.status,

            created_at: deposit.created_at

        });

    });


    /* WITHDRAWALS */

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

            created_at: withdrawal.created_at

        });

    });


    /*
       NEWEST FIRST
    */

    transactions.sort((a, b) => {

        return new Date(b.created_at || 0) -
            new Date(a.created_at || 0);

    });


    if (!transactions.length) {

        showAdminTableMessage(
            "transactionsTable",
            7,
            "No financial transactions have been recorded yet."
        );

        return;

    }

    table.replaceChildren();


    /*
       DISPLAY TRANSACTIONS
    */

    transactions.forEach(transaction => {

        const row =
            document.createElement("tr");

        /*
           REFERENCE
        */

        row.appendChild(
            createAdminTableCell(
                transaction.reference ||
                transaction.id
            )
        );

        /*
           MEMBER
        */

        row.appendChild(
            createAdminTableCell(
                getAdminMemberName(
                    transaction.user_id,
                    profiles
                )
            )
        );

        /*
           TYPE
        */

        const typeCell =
            createAdminTableCell(
                transaction.type
            );

        typeCell.className =
            transaction.type === "Deposit"
                ? "transaction-type deposit"
                : "transaction-type withdrawal";

        row.appendChild(typeCell);

        /*
           AMOUNT
        */

        row.appendChild(
            createAdminTableCell(
                formatNexusAdminMoney(
                    transaction.amount
                )
            )
        );

        /*
           PAYMENT METHOD
        */

        row.appendChild(
            createAdminTableCell(
                getAdminPaymentMethodLabel(
                    transaction.payment_method
                )
            )
        );

        /*
           STATUS
        */

        row.appendChild(
            createAdminStatusCell(
                transaction.status
            )
        );

        /*
           DATE AND TIME
        */

        row.appendChild(
            createAdminTableCell(
                formatAdminDateTime(
                    transaction.created_at
                )
            )
        );

        table.appendChild(row);

    });

    console.log(
        "Admin financial transactions displayed:",
        transactions.length
    );

}



/* =========================================
   23. LOAD ALL DASHBOARD RECORDS
========================================= */

let adminDashboardLoading = false;

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

        /*
           LOAD ALL FOUR TABLES
        */

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

        /*
           CHECK REQUIRED TABLES
        */

        if (profilesResult.error) {
            throw profilesResult.error;
        }

        if (walletsResult.error) {
            throw walletsResult.error;
        }

        if (withdrawalsResult.error) {
            throw withdrawalsResult.error;
        }

        /*
           EXTRACT DATA
        */

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

        /*
           CACHE MEMBER MANAGEMENT RECORDS
        */

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

        /*
           TOTAL MEMBERS
        */

        const totalMembersElement =
            document.getElementById("totalMembers");

        if (totalMembersElement) {

            totalMembersElement.textContent =
                profiles.length.toLocaleString("en-GH");

        }

        /*
           TOTAL WALLET BALANCES
        */

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

        /*
           TOTAL SUCCESSFUL DEPOSITS
        */

        const totalDeposits =
            deposits.reduce((sum, deposit) => {

                if (
                    normalizeAdminStatus(deposit.status) !==
                    "successful"
                ) {
                    return sum;
                }

                return sum +
                    getAdminNumber(deposit.amount);

            }, 0);

        const totalDepositsElement =
            document.getElementById("totalDeposits");

        if (totalDepositsElement) {

            totalDepositsElement.textContent =
                depositsAvailable
                    ? formatNexusAdminMoney(totalDeposits)
                    : "Unavailable";

        }

        /*
           TOTAL COMPLETED WITHDRAWALS
        */

        const completedWithdrawalRecords =
            withdrawals.filter(request =>

                normalizeAdminStatus(request.status) ===
                "completed"

            );

        const totalWithdrawals =
            completedWithdrawalRecords.reduce(
                (sum, request) => {

                    return sum +
                        getAdminNumber(request.amount);

                },
                0
            );

        const totalWithdrawalsElement =
            document.getElementById("totalWithdrawals");

        if (totalWithdrawalsElement) {

            totalWithdrawalsElement.textContent =
                formatNexusAdminMoney(totalWithdrawals);

        }

        /*
           WITHDRAWAL COUNTS
        */

        const pending =
            withdrawals.filter(request =>

                normalizeAdminStatus(request.status) ===
                "pending"

            ).length;

        const processing =
            withdrawals.filter(request =>

                normalizeAdminStatus(request.status) ===
                "processing"

            ).length;

        const completed =
            completedWithdrawalRecords.length;

        const pendingElement =
            document.getElementById(
                "overviewPendingWithdrawals"
            );

        const processingElement =
            document.getElementById(
                "overviewProcessingWithdrawals"
            );

        const completedElement =
            document.getElementById(
                "overviewCompletedWithdrawals"
            );

        if (pendingElement) {
            pendingElement.textContent = pending;
        }

        if (processingElement) {
            processingElement.textContent = processing;
        }

        if (completedElement) {
            completedElement.textContent = completed;
        }

        /*
           PENDING WITHDRAWAL BADGE
        */

        const withdrawalBadge =
            document.getElementById(
                "pendingWithdrawalBadge"
            );

        if (withdrawalBadge) {

            withdrawalBadge.textContent = pending;

            withdrawalBadge.hidden =
                pending === 0;

        }

        /*
           DISPLAY MEMBERS
        */

        displayAdminMembers(profiles);

        /*
           DISPLAY WITHDRAWALS
        */

        displayAdminWithdrawals(
            withdrawals,
            profiles
        );

        /*
           DISPLAY SAVINGS
        */

        displayAdminSavings(
            wallets,
            profiles,
            deposits,
            withdrawals,
            depositsAvailable
        );

        /*
           DISPLAY DEPOSITS
        */

        if (depositsAvailable) {

            displayAdminDeposits(
                deposits,
                profiles
            );

        } else {

            showAdminTableMessage(
                "depositsTable",
                8,
                "Unable to load deposits. Check Supabase permissions: " +
                depositsResult.error.message
            );

        }

        /*
           UPDATE DEPOSIT STATISTICS
        */

        updateAdminDepositStatistics(
            deposits,
            depositsAvailable
        );

        /*
           DISPLAY TRANSACTIONS
        */

        displayAdminTransactions(
            deposits,
            withdrawals,
            profiles
        );

        /*
           LOAD TRASH RECORDS
        */

        await loadAdminTrash();

        /*
           DASHBOARD SUMMARY
        */

        console.log(
            "Nexus admin dashboard data loaded.",
            {
                members: profiles.length,

                wallets: wallets.length,

                totalWalletBalances: totalBalances,

                totalSuccessfulDeposits:
                    depositsAvailable
                        ? totalDeposits
                        : "Unavailable",

                totalCompletedWithdrawals:
                    totalWithdrawals,

                depositTransactions:
                    deposits.length,

                withdrawalRequests:
                    withdrawals.length,

                totalFinancialTransactions:
                    deposits.length + withdrawals.length,

                pendingWithdrawals: pending,

                processingWithdrawals: processing,

                completedWithdrawals: completed
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
   25. ADMIN WITHDRAWAL REVIEW
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

            ? "Are you sure you want to reject this withdrawal? The database function must safely restore the customer's wallet balance."

            : "Are you sure you want to move this withdrawal to processing?";

    const confirmed =
        window.confirm(confirmationMessage);

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

                    ? "Withdrawal rejected successfully."

                    : "Withdrawal moved to processing successfully."
            )
        );

        /*
           RELOAD ALL DASHBOARD RECORDS

           This refreshes wallet balances,
           withdrawal status and statistics.
        */

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
   NEXUS WEALTH PARTNERS
   DEPOSIT TRANSACTION TRASH MANAGEMENT
========================================= */


/* =========================================
   1. TRASH ELEMENTS
========================================= */

const refreshTrashButton =
    document.getElementById("refreshTrashButton");

const trashTransactionsTable =
    document.getElementById("trashTransactionsTable");

const trashCountBadge =
    document.getElementById("trashCountBadge");


/* =========================================
   2. MOVE DEPOSIT TO TRASH
========================================= */

async function moveDepositToTrash(
    depositId,
    button
) {

    if (!depositId) {

        alert("Transaction ID is missing.");

        return;

    }

    const confirmed = window.confirm(
        "Move this deposit transaction to Trash? You can restore it later. This action will not change the member's wallet balance."
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

        if (error) {
            throw error;
        }

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

        /*
           REFRESH DASHBOARD DATA.

           This removes the transaction from the
           active Deposits and Transactions lists.
        */

        await loadAdminDashboardData();

        /*
           REFRESH TRASH.
        */

        await loadAdminTrash();

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


/* =========================================
   3. LOAD TRASH RECORDS
========================================= */

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

        if (error) {
            throw error;
        }

        const trashRecords = data || [];

        /*
           UPDATE TRASH COUNT
        */

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

            const row =
                document.createElement("tr");

            /*
               REFERENCE
            */

            row.appendChild(
                createAdminTableCell(
                    deposit.reference || deposit.id
                )
            );

            /*
               MEMBER
            */

            row.appendChild(
                createAdminTableCell(
                    getAdminMemberName(
                        deposit.user_id,
                        adminProfilesCache
                    )
                )
            );

            /*
               AMOUNT
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
               STATUS
            */

            row.appendChild(
                createAdminStatusCell(
                    deposit.status
                )
            );

            /*
               DELETED DATE
            */

            row.appendChild(
                createAdminTableCell(
                    formatAdminDateTime(
                        deposit.deleted_at
                    )
                )
            );

            /*
               ACTIONS
            */

            const actionCell =
                document.createElement("td");

            /*
               RESTORE BUTTON
            */

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


/* =========================================
   4. RESTORE DEPOSIT FROM TRASH
========================================= */

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

        if (error) {
            throw error;
        }

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

        /*
           REFRESH ACTIVE RECORDS.
        */

        await loadAdminDashboardData();

        /*
           REFRESH TRASH.
        */

        await loadAdminTrash();

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


/* =========================================
   5. REFRESH TRASH BUTTON
========================================= */

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
   6. LOAD TRASH WHEN OPENED
========================================= */

document.querySelectorAll(
    '[data-page="trash"]'
).forEach(button => {

    button.addEventListener("click", () => {

        loadAdminTrash();

    });

});

/* =========================================
   26. START ADMIN DASHBOARD
========================================= */

checkAdminSession();

console.log(
    "Nexus Wealth Partners Admin Dashboard initialized."
);

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
                    "Deposit refresh error:",
                    error
                );

                alert("Could not refresh dashboard records.");

            } finally {

                refreshDepositsButton.disabled = false;

                refreshDepositsButton.textContent =
                    originalText;

            }

        }
    );

}


/* =========================================
   NEXUS WEALTH PARTNERS
   COMPLETE MAIN JAVASCRIPT
========================================= */


/* =========================================
   1. SUPABASE CONNECTION
========================================= */

const SUPABASE_URL =
    "https://lzvtgxittsdhgjnfzdpk.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_191rkqJFaFYGbZxZMAzFPQ_DyMa5wi0";

if (!window.supabase) {
    throw new Error(
        "Supabase library not loaded. Check index.html script order."
    );
}

const nexusSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================
   2. NEXUS PAYSTACK PAYMENT CALLBACK
========================================= */

let nexusPaymentCallbackStarted = false;

async function handleNexusPaymentCallback() {

    const url = new URL(window.location.href);

    const reference =
        url.searchParams.get("reference") ||
        url.searchParams.get("trxref");

    if (!reference || !/^NEXUS_[a-f0-9]{32}$/i.test(reference)) {
        return;
    }

    if (nexusPaymentCallbackStarted) {
        return;
    }

    nexusPaymentCallbackStarted = true;

    try {

        console.log("NEXUS: Payment reference detected:", reference);

        const {
            data: sessionData,
            error: sessionError
        } = await nexusSupabase.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session?.user || !session.access_token) {

            nexusPaymentCallbackStarted = false;

            showLogin();

            showMessage(
                "Please log in to verify your deposit. " +
                "Your payment reference has been preserved."
            );

            return;
        }

        console.log("NEXUS: Customer authenticated.");

        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/nexus-verify-deposit`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${session.access_token}`
                },

                body: JSON.stringify({
                    reference: reference
                })
            }
        );

        const result = await response.json().catch(() => null);

        console.log("NEXUS: Verification HTTP status:", response.status);
        console.log("NEXUS: Verification response:", result);

        if (!response.ok || !result || result.success !== true) {

            throw new Error(
                result?.message ||
                `Deposit verification failed. HTTP status: ${response.status}`
            );
        }

        url.searchParams.delete("reference");
        url.searchParams.delete("trxref");

        window.history.replaceState(
            {},
            document.title,
            url.pathname + url.search + url.hash
        );

        console.log("NEXUS: Deposit successfully verified.");

        showMessage(
            result.already_processed
                ? "This deposit has already been credited."
                : "Deposit successful! Your wallet has been credited."
        );

        await loadDashboard(session.user);

    } catch (error) {

        console.error("NEXUS PAYMENT VERIFICATION ERROR:", error);

        nexusPaymentCallbackStarted = false;

        showMessage(
            "We could not complete your deposit verification.\n\n" +
            "Reason: " + (error.message || "Unknown error") +
            "\n\nPayment reference: " + reference +
            "\n\nYour payment has not been marked as credited."
        );
    }
}


/* =========================================
   3. GET HTML ELEMENTS
========================================= */

const websiteHeader = document.getElementById("websiteHeader");
const websiteFooter = document.getElementById("websiteFooter");
const publicMain = document.getElementById("publicMain");

const registerSection = document.getElementById("register");
const loginSection = document.getElementById("login");
const forgotPasswordSection = document.getElementById("forgotPassword");

const memberDashboard = document.getElementById("memberDashboard");

const registrationForm = document.getElementById("registrationForm");
const loginForm = document.getElementById("loginForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

const publicSections = [
    document.getElementById("home"),
    document.getElementById("about"),
    document.getElementById("savings")
].filter(Boolean);


/* =========================================
   4. HELPER FUNCTIONS
========================================= */

function getElement(id) {
    return document.getElementById(id);
}

function showMessage(message) {
    alert(message);
}

function formatMoney(amount) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function getFirstName(fullName) {
    return String(fullName || "Member").trim().split(/\s+/)[0];
}


/* =========================================
   5. HIDE AUTHENTICATION SCREENS
========================================= */

function hideAuthenticationScreens() {

    if (registerSection) {
        registerSection.classList.remove("active");
    }

    if (loginSection) {
        loginSection.classList.remove("active");
    }

    if (forgotPasswordSection) {
        forgotPasswordSection.classList.remove("active");
    }
}


/* =========================================
   6. HIDE MEMBER DASHBOARD
========================================= */


function hideMemberDashboard() {

    if (memberDashboard) {

        memberDashboard.style.display = "none";

        memberDashboard.classList.remove(
            "mobile-inner-page",
            "nexus-support-recovery-mode"
        );

        memberDashboard.style.paddingTop = "";
    }
}


/* =========================================
   7. SHOW PUBLIC HOMEPAGE
========================================= */

function showPublicHome() {

    hideAuthenticationScreens();
    hideMemberDashboard();

    publicSections.forEach(section => {
        section.style.display = "";
    });

    if (websiteHeader) websiteHeader.style.display = "";
    if (websiteFooter) websiteFooter.style.display = "";
    if (publicMain) publicMain.style.display = "";

    closeNexusNotificationMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   8. SHOW LOGIN
========================================= */

function showLogin() {

    hideAuthenticationScreens();
    hideMemberDashboard();

    publicSections.forEach(section => {
        section.style.display = "none";
    });

    if (loginSection) loginSection.classList.add("active");

    if (websiteHeader) websiteHeader.style.display = "none";
    if (websiteFooter) websiteFooter.style.display = "none";
    if (publicMain) publicMain.style.display = "block";

    window.scrollTo(0, 0);
}


/* =========================================
   9. SHOW REGISTRATION
========================================= */

function showRegistration() {

    hideAuthenticationScreens();
    hideMemberDashboard();

    publicSections.forEach(section => {
        section.style.display = "none";
    });

    if (registerSection) registerSection.classList.add("active");

    if (websiteHeader) websiteHeader.style.display = "none";
    if (websiteFooter) websiteFooter.style.display = "none";
    if (publicMain) publicMain.style.display = "block";

    window.scrollTo(0, 0);
}


/* =========================================
   10. SHOW FORGOT PASSWORD
========================================= */

function showForgotPassword() {

    hideAuthenticationScreens();
    hideMemberDashboard();

    publicSections.forEach(section => {
        section.style.display = "none";
    });

    if (forgotPasswordSection) {
        forgotPasswordSection.classList.add("active");
    }

    if (websiteHeader) websiteHeader.style.display = "none";
    if (websiteFooter) websiteFooter.style.display = "none";
    if (publicMain) publicMain.style.display = "block";

    window.scrollTo(0, 0);
}




/* =========================================
   11. MEMBER DASHBOARD NAVIGATION
   SAVINGS + PENSION + MOBILE RESPONSIVENESS
========================================= */

let currentDashboardView = "home";

function setMobileDashboardView(screen, shouldScroll = true) {

    const isMobile = window.matchMedia("(max-width: 700px)").matches;

    const dashboard = getElement("memberDashboard");
    const homeHeader = getElement("mobileHomeHeader");
    const screenHeader = getElement("mobileScreenHeader");
    const screenTitle = getElement("mobileScreenTitle");
    const backButton = getElement("mobileBackButton");

    const screenTitles = {
        home: "My Dashboard",
        transactions: "Transactions",
        pendingWithdrawals: "Pending Withdrawals",
        savings: "My Savings",
        pension: "My Pension",
        profile: "My Profile",
        support: "Customer Support"
    };

    const allSections = [
        ".home-dashboard-content",
        "#pendingWithdrawals",
        "#memberTransactions",
        "#memberSavings",
        "#memberPension",
        "#memberProfile",
        "#memberSupport"
    ];

    const screenSections = {

        home: [
            ".home-dashboard-content"
        ],

        transactions: [
            "#memberTransactions"
        ],

        pendingWithdrawals: [
            "#pendingWithdrawals"
        ],

        savings: [
            ".dashboard-content-grid",
            "#memberSavings"
        ],

        pension: [
            "#memberPension"
        ],

        profile: [
            "#memberProfile"
        ],

        support: [
            "#memberSupport"
        ]

    };

    if (!screenSections[screen]) {
        screen = "home";
    }

    currentDashboardView = screen;

    /* RESTORE ALL SECTIONS FIRST */

    allSections.forEach(selector => {

        document.querySelectorAll(
            "#memberDashboard " + selector
        ).forEach(element => {

            if (element && element.classList) {
                element.classList.remove("mobile-view-hidden");
                element.style.display = "";
            }

        });

    });

    document.querySelectorAll(
        "#memberDashboard .dashboard-content-grid"
    ).forEach(element => {

        if (element && element.classList) {
            element.classList.remove("mobile-savings-visible");
        }

    });

    /* DESKTOP VIEW */

    if (!isMobile) {

        document.body.classList.remove("mobile-inner-page");

        if (dashboard) {
            dashboard.classList.remove("mobile-inner-page");
            dashboard.style.paddingTop = "";
        }

        if (homeHeader) homeHeader.style.display = "none";
        if (screenHeader) screenHeader.style.display = "none";
        if (backButton) backButton.style.display = "none";

        const desktopTargets = {
            home: ".dashboard-heading",
            transactions: "#memberTransactions",
            pendingWithdrawals: "#pendingWithdrawals",
            savings: "#memberSavings",
            pension: "#memberPension",
            profile: "#memberProfile",
            support: "#memberSupport"
        };

        document.querySelectorAll(
            ".member-navigation a[data-screen]"
        ).forEach(link => {

            if (link && link.classList) {
                link.classList.toggle(
                    "active",
                    link.dataset.screen === screen
                );
            }

        });

        if (shouldScroll) {

            const target = document.querySelector(
                desktopTargets[screen] || ".dashboard-heading"
            );

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }

        return;
    }

    /* MOBILE VIEW: HIDE ALL SCREENS FIRST */

    allSections.forEach(selector => {

        document.querySelectorAll(
            "#memberDashboard " + selector
        ).forEach(element => {

            element.classList.add("mobile-view-hidden");
            element.style.display = "none";

        });

    });

    /* SHOW SELECTED SCREEN */

    screenSections[screen].forEach(selector => {

        document.querySelectorAll(
            "#memberDashboard " + selector
        ).forEach(element => {

            element.classList.remove("mobile-view-hidden");
            element.style.display = "";

        });

    });

    /* SAVINGS OVERVIEW */

    if (screen === "savings") {

        const savingsWrapper = document.querySelector(
            "#memberDashboard .dashboard-content-grid"
        );

        if (savingsWrapper) {
            savingsWrapper.classList.add("mobile-savings-visible");
            savingsWrapper.style.display = "grid";
        }

    }

    /* CONTROL MOBILE HEADERS */

    if (screen === "home") {

        document.body.classList.remove("mobile-inner-page");

        if (dashboard) {
            dashboard.classList.remove("mobile-inner-page");
            dashboard.style.paddingTop = "";
        }

        if (homeHeader) {
            homeHeader.style.display = "flex";
        }

        if (screenHeader) {
            screenHeader.style.display = "none";
        }

    } else {

        document.body.classList.add("mobile-inner-page");

        if (dashboard) {
            dashboard.classList.add("mobile-inner-page");
            dashboard.style.paddingTop = "";
        }

        if (homeHeader) {
            homeHeader.style.display = "none";
        }

        if (screenHeader) {
            screenHeader.style.display = "flex";
        }

    }

    if (screenTitle) {
        screenTitle.textContent = screenTitles[screen];
    }

    if (backButton) {
        backButton.style.display =
            screen === "home" ? "none" : "flex";
    }

    document.querySelectorAll(
        ".member-navigation a[data-screen]"
    ).forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.screen === screen
        );

    });

    if (shouldScroll) {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}


/* BACK BUTTON */

const mobileBackButton = getElement("mobileBackButton");

if (mobileBackButton) {

    mobileBackButton.addEventListener("click", function(event) {

        event.preventDefault();

        setMobileDashboardView("home");

    });

}


/* KEEP OLD FUNCTION NAME WORKING */

function showMobileDashboardScreen(screen) {
    setMobileDashboardView(screen);
}

window.showMobileDashboardScreen = showMobileDashboardScreen;
window.setMobileDashboardView = setMobileDashboardView;


/* HANDLE SCREEN RESIZING */

window.addEventListener("resize", function() {

    if (
        memberDashboard &&
        memberDashboard.style.display !== "none"
    ) {

        setMobileDashboardView(currentDashboardView, false);

    }

});




/* =========================================
   12. SHOW MEMBER DASHBOARD
========================================= */

function showMemberDashboard() {

    hideAuthenticationScreens();

    publicSections.forEach(section => {
        section.style.display = "none";
    });

    if (websiteHeader) websiteHeader.style.display = "none";
    if (websiteFooter) websiteFooter.style.display = "none";

    if (memberDashboard) {
        memberDashboard.style.display = "block";
    }

    if (publicMain) {
        publicMain.style.display = "block";
    }

    setMobileDashboardView("home", false);

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}


/* =========================================
   SUSPENDED MEMBER SUPPORT-ONLY ACCESS
========================================= */

function showSupportRecoveryView() {

    hideAuthenticationScreens();

    // Hide normal public content.
    publicSections.forEach(section => {
        section.style.display = "none";
    });

    if (websiteHeader) websiteHeader.style.display = "";
    if (websiteFooter) websiteFooter.style.display = "";

    if (publicMain) {
        publicMain.style.display = "block";
    }

    if (!memberDashboard) {
        showPublicHome();
        return;
    }

    // Add the recovery-only display rules once.
    if (!document.getElementById("nexusSupportRecoveryStyles")) {

        const style = document.createElement("style");

        style.id = "nexusSupportRecoveryStyles";

        style.textContent = `
            #memberDashboard.nexus-support-recovery-mode > :not(#memberSupport) {
                display: none !important;
            }

            #memberDashboard.nexus-support-recovery-mode #memberSupport {
                display: block !important;
                width: min(100% - 30px, 1000px);
                margin: 30px auto;
            }
        `;

        document.head.appendChild(style);
    }

    // Display only the customer support section.
    memberDashboard.classList.remove("mobile-inner-page");
    memberDashboard.classList.add("nexus-support-recovery-mode");
    memberDashboard.style.display = "block";

    document.body.classList.remove("mobile-inner-page");

    const supportSection = getElement("memberSupport");

    if (supportSection) {
        supportSection.classList.remove("mobile-view-hidden");
        supportSection.style.display = "block";
    }

    // Keep the authenticated session.
    initializeNexusSupport();

    refreshNexusSupport().catch(error => {
        console.error("Support recovery loading error:", error);
    });

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}


/* =========================================
   13. NEXUS MEMBER NOTIFICATIONS
========================================= */

let nexusNotificationsInitialized = false;

document.addEventListener("DOMContentLoaded", function () {

    const notificationMenu = getElement("notificationMenu");

    if (
        notificationMenu &&
        notificationMenu.parentElement !== document.body
    ) {
        document.body.appendChild(notificationMenu);
    }

});


function formatNotificationDate(dateValue) {

    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-GH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function closeNexusNotificationMenu() {

    const menu = getElement("notificationMenu");
    const button = getElement("notificationButton");

    if (menu) {
        menu.hidden = true;
    }

    if (button) {
        button.setAttribute("aria-expanded", "false");
    }
}


async function loadNexusNotifications(user) {

    const notificationCount = getElement("notificationCount");
    const notificationList = getElement("notificationList");
    const markAllButton = getElement("markAllNotifications");

    if (!user || !notificationList) return;

    try {

        const { data, error } = await nexusSupabase
            .from("nexus_notifications")
            .select("id, title, message, type, is_read, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        const notifications = data || [];

        const unreadCount = notifications.filter(
            notification => !notification.is_read
        ).length;

        const notificationButton = getElement("notificationButton");

        if (notificationButton) {

            notificationButton.classList.toggle(
                "has-unread",
                unreadCount > 0
            );

        }

        if (notificationCount) {

            notificationCount.textContent =
                unreadCount > 99 ? "99+" : String(unreadCount);

            notificationCount.hidden = unreadCount === 0;
        }

        if (markAllButton) {
            markAllButton.disabled = unreadCount === 0;
        }

        notificationList.replaceChildren();

        if (notifications.length === 0) {

            const empty = document.createElement("div");
            empty.className = "empty-notifications";

            const icon = document.createElement("span");
            icon.textContent = "🔔";

            const message = document.createElement("p");
            message.textContent = "No notifications yet.";

            empty.append(icon, message);
            notificationList.appendChild(empty);

            return;
        }

        notifications.forEach(notification => {

            const item = document.createElement("div");

            item.className = "nexus-notification-item";

            if (!notification.is_read) {
                item.classList.add("unread");
            }

            item.dataset.notificationId = notification.id;

            const content = document.createElement("div");
            content.className = "nexus-notification-content";

            const title = document.createElement("h4");
            title.textContent = notification.title || "Notification";

            const message = document.createElement("p");
            message.textContent = notification.message || "";

            const date = document.createElement("small");
            date.textContent = formatNotificationDate(
                notification.created_at
            );

            content.append(title, message, date);

            const status = document.createElement("span");
            status.className = "nexus-notification-status";
            status.textContent = notification.is_read ? "" : "●";

            item.append(content, status);

            item.addEventListener("click", async function() {

                if (!notification.is_read) {
                    await markNexusNotificationRead(notification.id);
                }

            });

            notificationList.appendChild(item);

        });

    } catch (error) {

        console.error("Notification loading error:", error);

        notificationList.replaceChildren();

        const empty = document.createElement("div");
        empty.className = "empty-notifications";

        const message = document.createElement("p");
        message.textContent = "Unable to load notifications.";

        empty.appendChild(message);
        notificationList.appendChild(empty);
    }
}


async function markNexusNotificationRead(notificationId) {

    try {

        const { error } = await nexusSupabase.rpc(
            "mark_nexus_notification_read",
            {
                p_notification_id: notificationId
            }
        );

        if (error) throw error;

        const { data, error: authError } =
            await nexusSupabase.auth.getUser();

        if (authError) throw authError;

        if (data.user) {
            await loadNexusNotifications(data.user);
        }

    } catch (error) {

        console.error(
            "Could not mark notification as read:",
            error
        );

        showMessage("Unable to update this notification.");

    }
}


async function markAllNexusNotificationsRead() {

    const button = getElement("markAllNotifications");

    if (button) {
        button.disabled = true;
    }

    try {

        const { error } = await nexusSupabase.rpc(
            "mark_all_nexus_notifications_read"
        );

        if (error) throw error;

        const { data, error: authError } =
            await nexusSupabase.auth.getUser();

        if (authError) throw authError;

        if (data.user) {
            await loadNexusNotifications(data.user);
        }

    } catch (error) {

        console.error(
            "Could not mark all notifications as read:",
            error
        );

        if (button) {
            button.disabled = false;
        }

        showMessage("Unable to mark all notifications as read.");

    }
}


function initializeNexusNotifications() {

    if (nexusNotificationsInitialized) return;

    const notificationButton = getElement("notificationButton");
    const notificationMenu = getElement("notificationMenu");
    const markAllButton = getElement("markAllNotifications");

    if (!notificationButton || !notificationMenu) {

        console.warn(
            "Notification HTML elements were not found."
        );

        return;
    }

    notificationButton.addEventListener("click", async function() {

        const isOpening = notificationMenu.hidden;

        notificationMenu.hidden = !isOpening;

        notificationButton.setAttribute(
            "aria-expanded",
            String(isOpening)
        );

        if (isOpening) {

            const { data, error } =
                await nexusSupabase.auth.getUser();

            if (error) {
                console.error("Notification user check error:", error);
                return;
            }

            if (data.user) {
                await loadNexusNotifications(data.user);
            }

        }

    });

    if (markAllButton) {

        markAllButton.addEventListener("click", function() {
            markAllNexusNotificationsRead();
        });

    }

    document.addEventListener("click", function(event) {

        const notificationArea = notificationButton.closest(
            ".notification-area"
        );

        if (
            notificationArea &&
            !notificationArea.contains(event.target)
        ) {
            closeNexusNotificationMenu();
        }

    });

    document.addEventListener("keydown", function(event) {

        if (event.key === "Escape") {
            closeNexusNotificationMenu();
        }

    });

    nexusNotificationsInitialized = true;
}


/* =========================================
   14. DISPLAY MEMBER INFORMATION
========================================= */

function displayMemberInformation(user, profile) {

    const fullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "Member";

    const firstName = getFirstName(fullName);

    const phone =
        profile?.phone ||
        user.user_metadata?.phone ||
        "";

    const memberId = profile?.member_id || "Pending";

    const accountStatus =
        profile?.status ||
        user.user_metadata?.status ||
        "Active";

    if (getElement("memberFirstName")) {
        getElement("memberFirstName").textContent = firstName;
    }

    if (getElement("profileName")) {
        getElement("profileName").textContent = fullName;
    }

    if (getElement("profileEmail")) {
        getElement("profileEmail").textContent = user.email || "";
    }

    if (getElement("profilePhone")) {
        getElement("profilePhone").textContent = phone;
    }

    if (getElement("memberId")) {
        getElement("memberId").textContent = memberId;
    }

    if (getElement("accountMemberId")) {
        getElement("accountMemberId").textContent = memberId;
    }

    if (getElement("profileMemberId")) {
        getElement("profileMemberId").textContent = memberId;
    }

    const statusElement = getElement("accountStatus");

    if (statusElement) {
        statusElement.textContent = accountStatus;
    }
}


/* =========================================
   15. LOAD MEMBER PROFILE
========================================= */



async function loadMemberProfile(user) {

    if (!user?.id) {
        throw new Error("Authentication is required.");
    }

    const { data, error } = await nexusSupabase
        .from("profiles")
        .select("full_name, phone, member_id, status")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Profile loading error:", error);
        throw error;
    }

    if (!data) {
        throw new Error(
            "Your member profile was not found. Please contact support."
        );
    }

    // Verify ordinary member account status.
    if (String(data.status || "").toLowerCase() !== "active") {
        throw new Error(
            "Your ordinary member account is not active. Please contact NEXUS WEALTH PARTNERS support."
        );
    }

    // Save verified account-holder details for statement exports.
   memberStatementAccount = {
      full_name:
         data.full_name ||
         user.user_metadata?.full_name ||
         "Member",
      
      member_id: data.member_id || "Pending",
      
      phone:
         data.phone ||
         user.user_metadata?.phone ||
         "Not provided",
      
      email: user.email || "Not provided",
      
      account_status: data.status || "Active"
   };
   
   // Display member information on the dashboard.
   displayMemberInformation(user, data);
   
   return data;
}



/* =========================================
   16. LOAD MEMBER WALLET
========================================= */

async function loadMemberWallet(user) {

    if (!user) {
        throw new Error("Member authentication is required.");
    }

    const { data, error } = await nexusSupabase
        .from("wallets")
        .select("balance, total_deposits, total_withdrawals")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Wallet loading error:", error);
        throw error;
    }

    if (!data) {
        throw new Error("Your wallet record was not found.");
    }

    const actualBalance = Number(data.balance) || 0;

    const deposits = Number(data.total_deposits) || 0;
    const withdrawals = Number(data.total_withdrawals) || 0;

    if (
        !Number.isFinite(actualBalance) ||
        actualBalance < 0
    ) {
        throw new Error("Your wallet balance is invalid.");
    }

    const {
        data: requests,
        error: requestError
    } = await nexusSupabase
        .from("withdrawal_requests")
        .select("amount, status")
        .eq("user_id", user.id)
        .in("status", ["pending", "processing"]);

    if (requestError) {
        console.error("Withdrawal loading error:", requestError);
        throw requestError;
    }

    const pendingWithdrawals = (requests || []).reduce(
        (total, request) => {

            const amount = Number(request.amount);

            if (!Number.isFinite(amount) || amount < 0) {
                return total;
            }

            return total + amount;

        },
        0
    );

    const currentBalance = actualBalance;

    const availableBalance = Math.max(
        0,
        actualBalance - pendingWithdrawals
    );

    [
        "walletBalance",
        "walletBalanceDisplay",
        "depositCurrentBalance",
        "totalSavingsBalance"
    ].forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent = formatMoney(currentBalance);
        }

    });

    [
        "walletAvailableBalance",
        "availableBalance"
    ].forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent = formatMoney(availableBalance);
        }

    });

    const pendingCard = getElement("walletPendingWithdrawals");

    if (pendingCard) {
        pendingCard.textContent = formatMoney(pendingWithdrawals);
    }

    [
        "walletTotalDeposits",
        "totalDeposits"
    ].forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent = formatMoney(deposits);
        }

    });

    const totalWithdrawalsElement = getElement(
        "walletTotalWithdrawals"
    );

    if (totalWithdrawalsElement) {
        totalWithdrawalsElement.textContent =
            formatMoney(withdrawals);
    }

    return {
        ...data,
        actual_balance: actualBalance,
        balance: currentBalance,
        available_balance: availableBalance,
        reserved_withdrawals: pendingWithdrawals
    };
}




/* =====================================================
   16A. NEXUS MEMBER PENSION
   ACCOUNT DETAILS + SUBACCOUNTS + REQUEST HISTORY

   SIMULATION ONLY

   No real pension payments.
   No wallet deductions.
   No pension balance credits.
   No ledger postings.
===================================================== */


/* =========================================
   PENSION REQUEST STATE
========================================= */

let memberPensionRequestEnabled = false;


/* =========================================
   LOAD MEMBER PENSION INFORMATION
========================================= */

async function loadMemberPension(user) {

    if (!user?.id) {

        throw new Error(
            "Member authentication is required."
        );

    }


    /* =====================================
       GET DASHBOARD ELEMENTS
    ===================================== */

    const balanceElement =
        getElement("memberPensionBalance");

    const dashboardBalance =
        getElement("dashboardPensionBalance");

    const accountNumberElement =
        getElement("pensionAccountNumber");

    const accountStatusElement =
        getElement("pensionAccountStatus");

    const sectorElement =
        getElement("pensionMemberSector");

    const classificationElement =
        getElement("pensionClassification");

    const subaccountElement =
        getElement("pensionSubaccountSummary");

    const contributionTotalElement =
        getElement("pensionTotalContributions");

    const lastContributionElement =
        getElement("pensionLastContribution");

    const contributionCountElement =
        getElement("pensionContributionCount");

    const contributionList =
        getElement("pensionContributionList");

    const destinationSelect =
        getElement("depositDestination");

    const pensionOption =
        destinationSelect?.querySelector(
            'option[value="pension"]'
        );

    const openingPanel =
        getElement("pensionAccountOpeningPanel");

    const openingButton =
        getElement("openPensionAccountButton");


    /* =====================================
       INITIAL DISPLAY
    ===================================== */

    if (balanceElement) {
        balanceElement.textContent =
            formatMoney(0);
    }

    if (dashboardBalance) {
        dashboardBalance.textContent =
            formatMoney(0);
    }

    if (accountNumberElement) {
        accountNumberElement.textContent =
            "Loading...";
    }

    if (accountStatusElement) {
        accountStatusElement.textContent =
            "Loading...";
    }

    if (sectorElement) {
        sectorElement.textContent =
            "Not verified";
    }

    if (classificationElement) {
        classificationElement.textContent =
            "Pending verification";
    }

    if (subaccountElement) {
        subaccountElement.replaceChildren();

        subaccountElement.textContent =
            "Loading Pension subaccounts...";
    }

    if (contributionTotalElement) {
        contributionTotalElement.textContent =
            "Not enabled";
    }

    if (lastContributionElement) {
        lastContributionElement.textContent =
            "No payment received";
    }

    if (contributionCountElement) {
        contributionCountElement.textContent =
            "0";
    }

    if (contributionList) {
        contributionList.replaceChildren();

        contributionList.textContent =
            "Loading Pension requests...";
    }


    /* =====================================
       LOAD PENSION ACCOUNT
    ===================================== */

    const {
        data: account,
        error: accountError
    } = await nexusSupabase
        .from("nexus_pension_accounts")
        .select(`
            id,
            account_number,
            currency,
            balance,
            status,
            member_sector,
            mandatory_scheme_status,
            classification_verified_at
        `)
        .eq("user_id", user.id)
        .maybeSingle();


    if (accountError) {

        console.error(
            "Pension account loading error:",
            accountError
        );

        throw accountError;

    }


    /* =====================================
       LOAD PENSION SUBACCOUNTS
    ===================================== */

    let subaccounts = [];

    if (account) {

        const {
            data,
            error
        } = await nexusSupabase
            .from("nexus_pension_subaccounts")
            .select(`
                id,
                account_id,
                user_id,
                sub_account_type,
                currency,
                balance,
                status
            `)
            .eq("account_id", account.id)
            .eq("user_id", user.id)
            .order(
                "sub_account_type",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Pension subaccount loading error:",
                error
            );

            throw error;

        }

        subaccounts = data || [];

    }


    /* =====================================
       LOAD PENSION CONTRIBUTION REQUESTS

       These are requests only.
       They are not confirmed payments.
    ===================================== */

    const {
        data: requests,
        error: requestError
    } = await nexusSupabase
        .from("nexus_pension_contribution_requests")
        .select(`
            id,
            amount,
            currency,
            request_reference,
            status,
            created_at,
            member_note
        `)
        .eq("member_user_id", user.id)
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(100);


    if (requestError) {

        console.error(
            "Pension contribution request loading error:",
            requestError
        );

        throw requestError;

    }


    const pensionRequests =
        requests || [];


    /* =====================================
       VERIFY ACCOUNT CLASSIFICATION
    ===================================== */

    const accountStatus =
        String(
            account?.status || ""
        ).trim().toLowerCase();

    const memberSector =
        String(
            account?.member_sector || ""
        ).trim().toLowerCase();

    const mandatoryStatus =
        String(
            account?.mandatory_scheme_status || ""
        ).trim().toLowerCase();


    const classificationVerified =
        Boolean(
            account?.classification_verified_at
        );


    /* =====================================
       DETERMINE REQUIRED SUBACCOUNTS
    ===================================== */

    let expectedSubaccountTypes = [];

    if (memberSector === "formal") {

        expectedSubaccountTypes = [
            "retirement"
        ];

    } else if (memberSector === "informal") {

        expectedSubaccountTypes = [
            "retirement",
            "personal_savings"
        ];

    }


    /* =====================================
       VERIFY SUBACCOUNT RECORDS
    ===================================== */

    const validSubaccounts =
        subaccounts.filter(subaccount => {

            const balance =
                Number(subaccount.balance);

            return (

                subaccount.account_id === account?.id &&

                subaccount.user_id === user.id &&

                String(subaccount.currency)
                    .toUpperCase() === "GHS" &&

                String(subaccount.status)
                    .toLowerCase() === "active" &&

                Number.isFinite(balance) &&

                balance >= 0

            );

        });


    const activeSubaccountTypes =
        validSubaccounts.map(subaccount =>

            String(
                subaccount.sub_account_type
            ).toLowerCase()

        );


    const hasExactExpectedSubaccounts =
        expectedSubaccountTypes.length > 0 &&

        validSubaccounts.length ===
            expectedSubaccountTypes.length &&

        expectedSubaccountTypes.every(type =>

            activeSubaccountTypes.includes(type)

        );


    /* =====================================
       FINAL PENSION CONTRIBUTION READINESS

       IMPORTANT:
       The backend requires OPERATIONAL status.
       ACTIVE alone is not sufficient.
    ===================================== */

    const pensionReady = Boolean(

        account &&

        accountStatus === "operational" &&

        classificationVerified &&

        ["formal", "informal"].includes(
            memberSector
        ) &&

        ["covered", "not_covered"].includes(
            mandatoryStatus
        ) &&

        hasExactExpectedSubaccounts

    );


    /* =====================================
       UPDATE GLOBAL REQUEST PERMISSION
    ===================================== */

    memberPensionRequestEnabled =
        pensionReady;


    /* =====================================
       PENSION ACCOUNT OPENING PANEL

       Show only when no account exists.
    ===================================== */

    if (openingPanel) {

        openingPanel.hidden =
            Boolean(account);

    }

    if (openingButton) {

        openingButton.disabled =
            Boolean(account);

    }


    /* =====================================
       KEEP PENSION DESTINATION AVAILABLE
       FOR STATUS INFORMATION
    ===================================== */

    if (pensionOption) {

        pensionOption.disabled = false;

    }


    /* =====================================
       DISPLAY ACCOUNT INFORMATION
    ===================================== */

    const pensionBalance =
        Number(account?.balance ?? 0);


    if (
        !Number.isFinite(pensionBalance) ||
        pensionBalance < 0
    ) {

        throw new Error(
            "The Pension account balance is invalid."
        );

    }


    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(pensionBalance);

    }

    if (dashboardBalance) {

        dashboardBalance.textContent =
            formatMoney(pensionBalance);

    }

    if (accountNumberElement) {

        accountNumberElement.textContent =
            account?.account_number ||
            "Not yet created";

    }

    if (accountStatusElement) {

        accountStatusElement.textContent =
            account
                ? String(account.status || "Unknown")
                    .toUpperCase()
                : "Not yet created";

    }


    /* =====================================
       DISPLAY MEMBER CLASSIFICATION
    ===================================== */

    const sectorLabel = {

        formal: "Formal sector",

        informal: "Informal sector"

    };


    const mandatoryLabel = {

        covered: "Covered",

        not_covered: "Not covered",

        unverified: "Unverified"

    };


    if (sectorElement) {

        sectorElement.textContent =
            account
                ? (
                    sectorLabel[memberSector] ||
                    "Not yet classified"
                )
                : "Not yet classified";

    }


    if (classificationElement) {

        if (!account) {

            classificationElement.textContent =
                "Pension account not yet opened";

        } else if (!classificationVerified) {

            classificationElement.textContent =
                "Pending administrator verification";

        } else {

            classificationElement.textContent =
                (
                    sectorLabel[memberSector] ||
                    "Unknown sector"
                ) +
                " — Mandatory scheme: " +
                (
                    mandatoryLabel[mandatoryStatus] ||
                    "Unverified"
                );

        }

    }


    /* =====================================
       DISPLAY SUBACCOUNT INFORMATION
    ===================================== */

    if (subaccountElement) {

        subaccountElement.replaceChildren();

        if (!account) {

            subaccountElement.textContent =
                "Open a Pension account to view your subaccounts.";

        } else if (subaccounts.length === 0) {

            subaccountElement.textContent =
                "No Pension subaccounts have been configured yet.";

        } else {

            subaccounts.forEach(subaccount => {

                const item =
                    document.createElement("div");

                item.className =
                    "pension-subaccount-item";


                const name =
                    document.createElement("strong");

                name.textContent = {

                    retirement: "Retirement",

                    personal_savings: "Personal Savings"

                }[
                    String(
                        subaccount.sub_account_type
                    ).toLowerCase()
                ] || subaccount.sub_account_type;


                const details =
                    document.createElement("p");

                details.textContent =
                    formatMoney(
                        Number(subaccount.balance) || 0
                    );


                const status =
                    document.createElement("small");

                status.textContent =
                    String(
                        subaccount.status || "Unknown"
                    ).toUpperCase();


                item.append(
                    name,
                    details,
                    status
                );

                subaccountElement.appendChild(item);

            });

        }

    }


    /* =====================================
       CONTRIBUTION SUMMARY

       Requests are not actual contributions.
       No payment has been received or credited.
    ===================================== */

    if (contributionTotalElement) {

        contributionTotalElement.textContent =
            "Not enabled";

    }

    if (lastContributionElement) {

        lastContributionElement.textContent =
            "No payment received";

    }

    if (contributionCountElement) {

        contributionCountElement.textContent =
            pensionRequests.length.toLocaleString(
                "en-GH"
            );

    }


    /* =====================================
       DISPLAY CONTRIBUTION REQUEST HISTORY
    ===================================== */

    if (contributionList) {

        contributionList.replaceChildren();

        if (pensionRequests.length === 0) {

            const emptyMessage =
                document.createElement("p");

            emptyMessage.textContent =
                account
                    ? "You have not submitted any Pension contribution requests."
                    : "No Pension contribution requests are available because you have not opened a Pension account.";

            contributionList.appendChild(
                emptyMessage
            );

        } else {

            pensionRequests.forEach(request => {

                const card =
                    document.createElement("article");

                card.className =
                    "pension-contribution-request";


                /* REQUEST REFERENCE */

                const reference =
                    document.createElement("strong");

                reference.textContent =
                    "Reference: " +
                    (
                        request.request_reference ||
                        request.id
                    );


                /* REQUEST AMOUNT */

                const amount =
                    document.createElement("p");

                amount.textContent =
                    "Requested amount: " +
                    formatMoney(
                        Number(request.amount) || 0
                    );


                /* REQUEST STATUS */

                const status =
                    document.createElement("p");

                const cleanStatus =
                    String(
                        request.status || "pending"
                    ).toLowerCase();

                status.textContent =
                    "Request status: " +
                    cleanStatus.toUpperCase();

                status.className =
                    "pension-request-status status-" +
                    cleanStatus.replace(
                        /[^a-z0-9_-]/g,
                        ""
                    );


                /* REQUEST DATE */

                const date =
                    document.createElement("small");

                const createdAt =
                    new Date(request.created_at);

                date.textContent =
                    Number.isNaN(createdAt.getTime())
                        ? "Date unavailable"
                        : createdAt.toLocaleString(
                            "en-GH",
                            {
                                dateStyle: "medium",
                                timeStyle: "short"
                            }
                        );


                /* MEMBER NOTE */

                card.append(
                    reference,
                    amount,
                    status,
                    date
                );


                if (request.member_note) {

                    const note =
                        document.createElement("p");

                    note.textContent =
                        "Your note: " +
                        request.member_note;

                    card.appendChild(note);

                }


                /* SIMULATION NOTICE */

                const notice =
                    document.createElement("small");

                notice.textContent =
                    "Simulation request only — no payment received and no Pension balance credited.";

                card.appendChild(notice);


                contributionList.appendChild(card);

            });

        }

    }


    /* =====================================
       UPDATE DEPOSIT DESTINATION DISPLAY
    ===================================== */

    if (
        typeof updateDepositDestinationUI ===
        "function"
    ) {

        updateDepositDestinationUI();

    }


    /* =====================================
       RETURN LOADED PENSION INFORMATION
    ===================================== */

    return {

        account,

        subaccounts,

        requests: pensionRequests,

        request_enabled: pensionReady

    };

}





/* =========================================
   16B. OPEN MEMBER PENSION ACCOUNT
   SIMULATION ONLY
========================================= */

const openPensionAccountButton =
    getElement("openPensionAccountButton");

const pensionAccountOpeningPanel =
    getElement("pensionAccountOpeningPanel");

const pensionAccountOpeningMessage =
    getElement("pensionAccountOpeningMessage");


if (openPensionAccountButton) {

    openPensionAccountButton.addEventListener(
        "click",
        async function() {

            if (openPensionAccountButton.disabled) {
                return;
            }

            openPensionAccountButton.disabled = true;

            openPensionAccountButton.textContent =
                "Opening Pension Account...";

            if (pensionAccountOpeningMessage) {
                pensionAccountOpeningMessage.textContent =
                    "Please wait while your account is being opened.";
            }

            try {

                /* AUTHENTICATION */

                const {
                    data: authData,
                    error: authError
                } = await nexusSupabase.auth.getUser();

                if (authError) {
                    throw authError;
                }

                if (!authData?.user) {
                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }


                /* OPEN ACCOUNT THROUGH DATABASE FUNCTION */

                const {
                    data,
                    error
                } = await nexusSupabase.rpc(
                    "open_nexus_pension_account"
                );

                if (error) {
                    throw error;
                }

                if (!data || data.success !== true) {
                    throw new Error(
                        data?.message ||
                        "Your Pension account could not be opened."
                    );
                }


                /* REFRESH PENSION DASHBOARD */

                await loadMemberPension(authData.user);


                /* DISPLAY RESULT */

                if (pensionAccountOpeningMessage) {
                    pensionAccountOpeningMessage.textContent =
                        data.message ||
                        "Your Pension account has been opened and is awaiting administrator activation.";
                }

                showMessage(
                    data.message ||
                    "Your Pension account has been opened successfully."
                );

            } catch (error) {

                console.error(
                    "Pension account opening error:",
                    error
                );

                if (pensionAccountOpeningMessage) {
                    pensionAccountOpeningMessage.textContent =
                        error.message ||
                        "Unable to open your Pension account.";
                }

                showMessage(
                    error.message ||
                    "Unable to open your Pension account. Please try again."
                );

            } finally {

                if (openPensionAccountButton) {

                    const accountNumber =
                        getElement("pensionAccountNumber")
                            ?.textContent?.trim();

                    const accountExists =
                        Boolean(
                            accountNumber &&
                            accountNumber !== "Not yet created" &&
                            accountNumber !== "Not yet assigned"
                        );

                    if (accountExists) {

                        openPensionAccountButton.disabled = true;

                        if (pensionAccountOpeningPanel) {
                            pensionAccountOpeningPanel.hidden = true;
                        }

                    } else {

                        openPensionAccountButton.disabled = false;

                    }

                    openPensionAccountButton.textContent =
                        "Open Pension Account";
                }
            }
        }
    );
}


   
   



/* =========================================
   17. LOAD MEMBER DASHBOARD DATA
========================================= */

async function loadDashboard(user) {

    if (!user?.id) return false;

    try {

        const {
            data: isActiveMember,
            error: accessError
        } = await nexusSupabase.rpc(
            "is_active_nexus_member"
        );

        if (accessError) {
            throw accessError;
        }

        if (isActiveMember !== true) {

            const {
                data: profileStatus,
                error: profileStatusError
            } = await nexusSupabase
                .from("profiles")
                .select("status")
                .eq("id", user.id)
                .maybeSingle();

            if (profileStatusError) {
                throw profileStatusError;
            }

            const status = String(
                profileStatus?.status || ""
            ).toLowerCase();

            if (status === "suspended") {

                showSupportRecoveryView();

                showMessage(
                    "Your member account is suspended. " +
                    "You can still contact NEXUS support through this page."
                );

            } else {

                showPublicHome();

                showMessage(
                    "This account does not have ordinary member dashboard access. " +
                    "Please use your authorized staff portal."
                );

            }

            return false;
        }


        await loadMemberProfile(user);

        showMemberDashboard();

        initializeNexusSupport();
        initializeNexusNotifications();


        const dashboardTasks = [

            {
                name: "Member wallet",
                run: () => loadMemberWallet(user)
            },

            {
                name: "Member transactions",
                run: () => loadMemberTransactions(user)
            },

            {
                name: "Pending withdrawals",
                run: () => loadPendingWithdrawals(user)
            },

            {
                name: "Member pension",
                run: () => loadMemberPension(user)
            },

            {
                name: "Notifications",
                run: () => loadNexusNotifications(user)
            },

            {
                name: "Customer support",
                run: () => refreshNexusSupport()
            }

        ];


        const results = await Promise.allSettled(
            dashboardTasks.map(async task => {

                try {

                    await task.run();

                    console.log(
                        task.name + " loaded successfully."
                    );

                } catch (error) {

                    console.error(
                        task.name + " loading error:",
                        error
                    );

                    throw error;
                }

            })
        );


        const failedTasks = results
            .map((result, index) => ({
                result,
                name: dashboardTasks[index].name
            }))
            .filter(item =>
                item.result.status === "rejected"
            );


        if (failedTasks.length > 0) {

            console.error(
                "Some dashboard sections failed:",
                failedTasks
            );

            showMessage(
                "Your dashboard has loaded, but some sections could not be updated. " +
                "Please refresh the affected sections."
            );

        }


        console.log(
            "NEXUS member dashboard initialization completed."
        );

        return true;

    } catch (error) {

        console.error(
            "Member dashboard authorization/loading error:",
            error
        );

        showPublicHome();

        showMessage(
            error.message ||
            "Unable to verify your member account access. Please contact support."
        );

        return false;
    }

}





/* =========================================
   18. REGISTRATION
========================================= */

if (registrationForm) {

    registrationForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const fullName = getElement("registerName")?.value.trim();
        const email = getElement("registerEmail")?.value.trim();
        const phone = getElement("registerPhone")?.value.trim();
        const password = getElement("registerPassword")?.value;
        const confirmPassword = getElement("confirmPassword")?.value;

        if (!fullName || !email || !phone || !password || !confirmPassword) {
            showMessage("Please complete all registration fields.");
            return;
        }

        if (password.length < 8) {
            showMessage("Your password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Your passwords do not match.");
            return;
        }

        const submitButton = registrationForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        try {

            const { data, error } = await nexusSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                        status: "Active"
                    }
                }
            });

            if (error) throw error;

            if (data.session && data.user) {

                showMessage("Your account has been created successfully!");

                await loadDashboard(data.user);

            } else {

                showMessage(
                    "Registration submitted successfully. Please check your email to confirm your account, then return to log in."
                );

                showLogin();
            }

        } catch (error) {

            console.error("Registration error:", error);

            showMessage(
                error.message || "Registration failed. Please try again."
            );

        } finally {

            if (submitButton) submitButton.disabled = false;
        }
    });
}


/* =========================================
   19. MEMBER LOGIN
========================================= */

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = getElement("loginEmail")?.value.trim();
        const password = getElement("loginPassword")?.value;

        if (!email || !password) {
            showMessage("Enter your email and password.");
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        try {

            const { data, error } =
                await nexusSupabase.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            await loadDashboard(data.user);

        } catch (error) {

            console.error("Login error:", error);

            showMessage(
                error.message || "Login failed. Check your details."
            );

        } finally {

            if (submitButton) submitButton.disabled = false;
        }
    });
}


/* =========================================
   20. FORGOT PASSWORD
========================================= */

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = getElement("resetEmail")?.value.trim();

        if (!email) {
            showMessage("Enter your email address.");
            return;
        }

        try {

            const { error } =
                await nexusSupabase.auth.resetPasswordForEmail(email, {
                    redirectTo:
                        window.location.origin + "/reset-password.html"
                });

            if (error) throw error;

            showMessage(
                "If the address is registered, a password reset email will be sent. Please check your inbox."
            );

        } catch (error) {

            console.error("Password reset error:", error);

            showMessage(error.message || "Password reset failed.");
        }
    });
}



/* =========================================
   21. NAVIGATION LINKS
========================================= */

document.addEventListener("click", function(event) {

    const loginLink = event.target.closest('a[href="#login"]');

    const registerLink = event.target.closest('a[href="#register"]');

    const forgotLink = event.target.closest('a[href="#forgotPassword"]');


    if (loginLink) {

        event.preventDefault();

        showLogin();

        return;
    }


    if (registerLink) {

        event.preventDefault();

        showRegistration();

        return;
    }


    if (forgotLink) {

        event.preventDefault();

        showForgotPassword();

        return;
    }


    const dashboardLink = event.target.closest(
        '#memberDashboard a[data-screen]'
    );

    if (!dashboardLink) return;


    const selectedView = dashboardLink.dataset.screen;

    if (selectedView) {

        event.preventDefault();

        setMobileDashboardView(selectedView);

    }

});



/* =========================================
   22. BACK TO HOME
========================================= */

function returnToHome() {
    showPublicHome();
}

window.showPublicHome = showPublicHome;
window.showLogin = showLogin;
window.showRegistration = showRegistration;
window.showForgotPassword = showForgotPassword;
window.returnToHome = returnToHome;



/* =========================================
   23. MEMBER LOGOUT
   CONNECTED TO SUPABASE AUTHENTICATION
========================================= */

const memberLogoutButton = getElement("memberLogoutButton");

let memberLogoutInProgress = false;


async function logoutMember() {

    // Prevent multiple logout requests.
    if (memberLogoutInProgress) return;

    memberLogoutInProgress = true;

    const button = getElement("memberLogoutButton");

    const label = button
        ? button.querySelector("span:last-child")
        : null;

    const originalLabel = label
        ? label.textContent
        : "Logout";

    // Update the button while logout is processing.
    if (button) {

        button.disabled = true;

        button.setAttribute("aria-busy", "true");

        if (label) {
            label.textContent = "Logging out...";
        }
    }

    try {

        // End the authenticated Supabase session.
        const { error } = await nexusSupabase.auth.signOut();

        if (error) {
            throw error;
        }

        // Close any open notification menu.
        closeNexusNotificationMenu();

        // Return the member to the public homepage.
        showPublicHome();

        showMessage("You have been logged out successfully.");

    } catch (error) {

        console.error("Member logout error:", error);

        showMessage(
            error.message ||
            "Logout failed. Please try again."
        );

    } finally {

        memberLogoutInProgress = false;

        if (button) {

            button.disabled = false;

            button.removeAttribute("aria-busy");

            if (label) {
                label.textContent = originalLabel;
            }
        }
    }
}


// Connect the visible dashboard Logout button.
if (memberLogoutButton) {

    memberLogoutButton.addEventListener(
        "click",
        logoutMember
    );

} else {

    console.warn(
        "Member logout button was not found. Check the HTML ID: memberLogoutButton."
    );
}


// Keep the logout function available to other scripts.
window.logoutMember = logoutMember;



/* =========================================
   24. AUTHENTICATION STATE
========================================= */

nexusSupabase.auth.onAuthStateChange((event, session) => {

    if (event === "SIGNED_OUT") {

        closeNexusNotificationMenu();

        showPublicHome();

        return;
    }

    if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        session?.user
    ) {

        Promise.resolve().then(async () => {

            await loadDashboard(session.user);

            await handleNexusPaymentCallback();

        });

    }

});


/* =========================================
   25. MEMBER TRANSACTION HISTORY
   FILTERING + STATEMENT EXPORTS
========================================= */

let memberTransactionsCache = [];
let memberStatementAccount = null;


/* =========================================
   TRANSACTION DISPLAY HELPERS
========================================= */

function getMemberTransactionReference(transaction) {

    return transaction.type === "deposit"
        ? transaction.reference || ""
        : transaction.payout_reference || "";
}


function getMemberTransactionLabel(transaction) {

    const depositMethods = {
        mtn: "MTN Mobile Money",
        telecel: "Telecel Cash",
        at: "AT Money",
        mtn_momo: "MTN Mobile Money",
        telecel_cash: "Telecel Cash",
        at_money: "AT Money"
    };

    const withdrawalMethods = {
        mtn_momo: "MTN Mobile Money",
        telecel_cash: "Telecel Cash",
        at_money: "AT Money",
        bank: "Bank Account"
    };

    if (transaction.type === "deposit") {

        return "Deposit - " +
            (
                depositMethods[transaction.payment_method] ||
                transaction.payment_method ||
                "Unknown Method"
            );
    }

    return "Withdrawal - " +
        (
            withdrawalMethods[transaction.withdrawal_method] ||
            transaction.withdrawal_method ||
            "Unknown Method"
        );
}


function getMemberTransactionStatusLabel(status) {

    const statuses = {
        pending: "Pending Approval",
        processing: "Approved - Processing Payment",
        successful: "Successful",
        completed: "Payment Completed",
        failed: "Failed",
        rejected: "Rejected",
        reversed: "Reversed"
    };

    return statuses[status] || status || "Unknown";
}


function escapeStatementHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}



/* =========================================
   DATE FILTER HELPERS
========================================= */

function getStatementDateRange() {

    const preset = getElement("statementDatePreset")?.value || "all";

    const now = new Date();

    let startDate = null;
    let endDate = null;

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    if (preset === "today") {

        startDate = today;
        endDate = new Date(today);

        endDate.setDate(endDate.getDate() + 1);

    } else if (preset === "yesterday") {

        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);

        endDate = new Date(today);

    } else if (preset === "last7") {

        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);

        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);

    } else if (preset === "last30") {

        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);

        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);

    } else if (preset === "custom") {

        const startValue =
            getElement("statementStartDate")?.value;

        const endValue =
            getElement("statementEndDate")?.value;

        if (!startValue || !endValue) {

            return {
                valid: false,
                message: "Please select both custom dates."
            };
        }

        const startParts = startValue.split("-").map(Number);
        const endParts = endValue.split("-").map(Number);

        startDate = new Date(
            startParts[0],
            startParts[1] - 1,
            startParts[2]
        );

        endDate = new Date(
            endParts[0],
            endParts[1] - 1,
            endParts[2]
        );

       if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            endDate < startDate
        ) {

            return {
                valid: false,
                message: "Please enter a valid date range."
            };
        }

        endDate.setDate(endDate.getDate() + 1);
    }

    return {
        valid: true,
        startDate,
        endDate
    };
}

/* =========================================
   APPLY MEMBER STATEMENT FILTERS
========================================= */

function getFilteredMemberTransactions() {

    const typeButton = document.querySelector(
        "#transactionFilters button.active"
    );

    const selectedType =
        typeButton?.dataset.filter || "all";

    const selectedStatus =
        getElement("statementStatus")?.value || "all";

    const searchReference =
        (
            getElement("statementReferenceSearch")?.value || ""
        ).trim().toLowerCase();

    const dateRange = getStatementDateRange();

    if (!dateRange.valid) {

        return {
            valid: false,
            message: dateRange.message,
            transactions: []
        };
    }

    const transactions = memberTransactionsCache.filter(
        transaction => {

            if (
                selectedType !== "all" &&
                transaction.type !== selectedType
            ) {
                return false;
            }

            if (
                selectedStatus !== "all" &&
                transaction.status !== selectedStatus
            ) {
                return false;
            }

            const transactionDate = new Date(
                transaction.created_at
            );

            if (
                dateRange.startDate &&
                transactionDate < dateRange.startDate
            ) {
                return false;
            }

            if (
                dateRange.endDate &&
                transactionDate >= dateRange.endDate
            ) {
                return false;
            }

            if (searchReference) {

                const reference =
                    getMemberTransactionReference(transaction)
                        .toLowerCase();

                if (!reference.includes(searchReference)) {
                    return false;
                }
            }

            return true;
        }
    );

    return {
        valid: true,
        message: "",
        transactions
    };
}

/* =========================================
   MEMBER STATEMENT TOTALS
========================================= */

function calculateMemberStatementTotals(transactions) {

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactions.forEach(transaction => {

        const amount = Number(transaction.amount) || 0;

        if (
            transaction.type === "deposit" &&
            ["successful", "completed"].includes(transaction.status)
        ) {

            totalDeposits += amount;
        }

        /*
         * Count a withdrawal as a wallet debit only when:
         * 1. The wallet was actually debited.
         * 2. The wallet amount has not been restored.
         */

        if (
            transaction.type === "withdrawal" &&
            transaction.wallet_debited === true &&
            transaction.wallet_restored !== true
        ) {

            totalWithdrawals += amount;
        }
    });

    return {
        totalDeposits,
        totalWithdrawals,
        transactionCount: transactions.length
    };
}


/* =========================================
   RENDER MEMBER TRANSACTION TABLE
========================================= */

function renderMemberTransactions() {

    const transactionList = getElement("transactionList");

    if (!transactionList) return;

    const result = getFilteredMemberTransactions();

    transactionList.innerHTML = "";

    if (!result.valid) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6">
                    ${escapeStatementHTML(result.message)}
                </td>
            </tr>
        `;

        updateMemberStatementSummary([]);

        const message = getElement("statementFilterMessage");

        if (message) {
            message.textContent = result.message;
        }

        return;
    }

    const transactions = result.transactions;

    updateMemberStatementSummary(transactions);

    const message = getElement("statementFilterMessage");

    if (message) {
        message.textContent =
            transactions.length +
            " matching transaction(s) found.";
    }

    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6">
                    No matching transactions available.
                </td>
            </tr>
        `;

        return;
    }

    transactions.forEach(transaction => {

        const row = document.createElement("tr");

        row.dataset.transactionType = transaction.type;

        const transactionCell = document.createElement("td");
        const referenceCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const statusCell = document.createElement("td");
        const receiptCell = document.createElement("td");

        transactionCell.textContent =
            getMemberTransactionLabel(transaction);

        referenceCell.textContent =
            getMemberTransactionReference(transaction) || "—";

        dateCell.textContent = new Date(
            transaction.created_at
        ).toLocaleString("en-GH", {
            dateStyle: "medium",
            timeStyle: "short"
        });

        const amount = Number(transaction.amount) || 0;

        amountCell.textContent =
            (transaction.type === "deposit" ? "+ " : "- ") +
            formatMoney(amount);

        statusCell.textContent =
            getMemberTransactionStatusLabel(transaction.status);

        const safeStatus = String(
            transaction.status || "unknown"
        ).toLowerCase().replace(/[^a-z0-9_-]/g, "");

        statusCell.className =
            "transaction-status status-" + safeStatus;

        const receiptButton = document.createElement("button");

        receiptButton.type = "button";
        receiptButton.textContent = "View Receipt";
        receiptButton.className = "view-receipt-button";

        const canViewReceipt =
            transaction.type === "deposit"
                ? transaction.status === "successful"
                : transaction.status === "completed";

        receiptButton.disabled = !canViewReceipt;

        if (canViewReceipt) {

            receiptButton.addEventListener("click", function() {

                generateTransactionReceipt(transaction);

            });

        } else {

            receiptButton.textContent = "Unavailable";
        }

        receiptCell.appendChild(receiptButton);

        row.appendChild(transactionCell);
        row.appendChild(referenceCell);
        row.appendChild(dateCell);
        row.appendChild(amountCell);
        row.appendChild(statusCell);
        row.appendChild(receiptCell);

        transactionList.appendChild(row);
    });
}

/* =========================================
   UPDATE MEMBER STATEMENT SUMMARY
========================================= */

function updateMemberStatementSummary(transactions) {

    const totals =
        calculateMemberStatementTotals(transactions);

    const depositsElement =
        getElement("statementTotalDeposits");

    const withdrawalsElement =
        getElement("statementTotalWithdrawals");

    const countElement =
        getElement("statementTransactionCount");

    if (depositsElement) {

        depositsElement.textContent =
            formatMoney(totals.totalDeposits);
    }

    if (withdrawalsElement) {

        withdrawalsElement.textContent =
            formatMoney(totals.totalWithdrawals);
    }

    if (countElement) {

        countElement.textContent =
            totals.transactionCount.toLocaleString("en-GH");
    }
}


/* =========================================
   LOAD MEMBER TRANSACTIONS
========================================= */

async function loadMemberTransactions(user) {

    const transactionList = getElement("transactionList");

    if (!transactionList || !user) return;

    transactionList.innerHTML = `
        <tr>
            <td colspan="6">Loading transactions...</td>
        </tr>
    `;

    initializeTransactionFilters();

    try {

        const { data: deposits, error: depositError } =
            await nexusSupabase
                .from("deposit_transactions")
                .select(`
                    id,
                    user_id,
                    amount,
                    payment_method,
                    status,
                    reference,
                    created_at
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

        if (depositError) throw depositError;


        const { data: withdrawals, error: withdrawalError } =
            await nexusSupabase
                .from("withdrawal_requests")
                .select(`
                    id,
                    user_id,
                    amount,
                    withdrawal_method,
                    status,
                    payout_reference,
                    wallet_debited,
                    wallet_restored,
                    created_at
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

        if (withdrawalError) throw withdrawalError;


        memberTransactionsCache = [

            ...(deposits || []).map(item => ({
                ...item,
                type: "deposit"
            })),

            ...(withdrawals || []).map(item => ({
                ...item,
                type: "withdrawal"
            }))
        ];

        memberTransactionsCache.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        renderMemberTransactions();

    } catch (error) {

        console.error("Transaction loading error:", error);

        memberTransactionsCache = [];

        transactionList.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load transactions. Please refresh.
                </td>
            </tr>
        `;

        updateMemberStatementSummary([]);

        const message = getElement("statementFilterMessage");

        if (message) {
            message.textContent =
                "Unable to load your transaction statement.";
        }
    }
}

/* =========================================
   26. LOAD PENDING WITHDRAWALS
========================================= */

async function loadPendingWithdrawals(user) {

    const list = getElement("pendingWithdrawalList");
    const totalDisplay = getElement("pendingWithdrawalTotal");
    const pendingCard = getElement("walletPendingWithdrawals");

    if (!user) return;

    if (list) {
        list.innerHTML = `
            <tr>
                <td colspan="4">Loading withdrawal requests...</td>
            </tr>
        `;
    }

    if (totalDisplay) {
        totalDisplay.textContent = formatMoney(0);
    }

    if (pendingCard) {
        pendingCard.textContent = formatMoney(0);
    }

    try {

        const { data, error } = await nexusSupabase
            .from("withdrawal_requests")
            .select("id, amount, withdrawal_method, status, created_at")
            .eq("user_id", user.id)
            .in("status", ["pending", "processing"])
            .order("created_at", { ascending: false });

        if (error) throw error;

        const requests = data || [];

        const reservedTotal = requests.reduce(
            (total, request) => {
                return total + (Number(request.amount) || 0);
            },
            0
        );

        if (totalDisplay) {
            totalDisplay.textContent = formatMoney(reservedTotal);
        }

        if (pendingCard) {
            pendingCard.textContent = formatMoney(reservedTotal);
        }

        if (!list) return;

        if (requests.length === 0) {

            list.innerHTML = `
                <tr>
                    <td colspan="4">
                        You have no pending withdrawal requests.
                    </td>
                </tr>
            `;

            return;
        }

        const methodLabels = {
            mtn_momo: "MTN Mobile Money",
            telecel_cash: "Telecel Cash",
            at_money: "AT Money",
            bank: "Bank Account"
        };

        const statusLabels = {
            pending: "Pending Approval",
            processing: "Approved - Processing Payment"
        };

        list.innerHTML = "";

        requests.forEach(request => {

            const row = document.createElement("tr");

            const amountCell = document.createElement("td");
            const methodCell = document.createElement("td");
            const dateCell = document.createElement("td");
            const statusCell = document.createElement("td");

            amountCell.textContent = formatMoney(
                request.amount
            );

            methodCell.textContent =
                methodLabels[request.withdrawal_method] ||
                request.withdrawal_method ||
                "Not specified";

            dateCell.textContent = request.created_at
                ? new Date(request.created_at).toLocaleString("en-GH")
                : "Date unavailable";

            statusCell.textContent =
                statusLabels[request.status] ||
                request.status;

            statusCell.className =
                "transaction-status status-" + request.status;

            row.appendChild(amountCell);
            row.appendChild(methodCell);
            row.appendChild(dateCell);
            row.appendChild(statusCell);

            list.appendChild(row);

        });

    } catch (error) {

        console.error("Pending withdrawals error:", error);

        if (list) {
            list.innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load withdrawal requests.
                    </td>
                </tr>
            `;
        }

        throw error;
    }
}




/* =========================================
   27. MEMBER DEPOSIT PROCESSING
   SAVINGS PAYSTACK + PENSION REQUEST ONLY
========================================= */

const depositForm = getElement("depositForm");
const depositDestination = getElement("depositDestination");
const depositPaymentDetails = getElement("depositPaymentDetails");
const depositPensionDetails = getElement("depositPensionDetails");
const depositDestinationNotice = getElement("depositDestinationNotice");
const depositSubmitButton = getElement("depositSubmitButton");



/* =========================================
   27A. DESTINATION DISPLAY
========================================= */

function updateDepositDestinationUI() {

    const destination = depositDestination?.value || "";

    if (depositPaymentDetails) {
        depositPaymentDetails.hidden =
            destination !== "savings";
    }

    if (depositPensionDetails) {
        depositPensionDetails.hidden =
            destination !== "pension";
    }

    if (depositDestinationNotice) {

        if (destination === "savings") {

            depositDestinationNotice.textContent =
                "Savings deposits are processed through Paystack.";

        } else if (destination === "pension") {

            if (!memberPensionRequestEnabled) {

                depositDestinationNotice.textContent =
                    "Pension contribution requests are currently unavailable. Open a Pension account and wait for administrator activation and classification before submitting a request. No payment will be collected.";

            } else {

                depositDestinationNotice.textContent =
                    "Pension contribution requests are submitted for administrator review. No payment will be collected, no wallet will be debited and your Pension balance will not be credited.";

            }

        } else {

            depositDestinationNotice.textContent =
                "Select a destination to continue.";

        }
    }

    if (depositSubmitButton) {

        depositSubmitButton.textContent =
            destination === "pension"
                ? "Submit Pension Request"
                : destination === "savings"
                    ? "Continue to Deposit"
                    : "Continue";

        depositSubmitButton.disabled =
            destination === "pension" &&
            !memberPensionRequestEnabled;
    }
}


/* DESTINATION CHANGE */

if (depositDestination) {

    depositDestination.addEventListener(
        "change",
        updateDepositDestinationUI
    );

    updateDepositDestinationUI();
}




/* =========================================
   27B. FORM SUBMISSION
   SAVINGS PAYSTACK + PENSION SIMULATION
========================================= */

if (depositForm) {

    depositForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const destination =
                depositDestination?.value;

            const amount = Number(
                getElement("depositAmount")?.value
            );

            const submitButton =
                depositSubmitButton ||
                depositForm.querySelector(
                    'button[type="submit"]'
                );


            /* =====================================
               COMMON VALIDATION
            ===================================== */

            if (
                !["savings", "pension"].includes(destination)
            ) {

                showMessage(
                    "Please select a valid deposit destination."
                );

                return;
            }

            if (
                !Number.isFinite(amount) ||
                amount < 1 ||
                amount > 100000
            ) {

                showMessage(
                    "Enter an amount between GHS 1 and GHS 100,000."
                );

                return;
            }


            /* =====================================
               AUTHENTICATION
            ===================================== */

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {

                const {
                    data: authData,
                    error: authError
                } = await nexusSupabase.auth.getUser();

                if (authError) {
                    throw authError;
                }

                if (!authData?.user) {

                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }


                /* =====================================
                   PENSION CONTRIBUTION REQUEST
                   SIMULATION ONLY
                ===================================== */

                if (destination === "pension") {

                    if (!memberPensionRequestEnabled) {

                        throw new Error(
                            "Your Pension account is not yet operational. Open your Pension account and wait for administrator activation and classification before submitting a contribution request. No payment has been collected."
                        );
                    }

                    if (submitButton) {

                        submitButton.textContent =
                            "Submitting Pension Request...";
                    }

                    const pensionNote =
                        getElement("depositPensionNote")
                            ?.value.trim() || null;


                    const {
                        data,
                        error
                    } = await nexusSupabase.rpc(
                        "submit_nexus_pension_contribution_request",
                        {
                            p_amount: amount,
                            p_member_note: pensionNote
                        }
                    );

                    if (error) {
                        throw error;
                    }

                    if (
                        !data ||
                        data.success !== true
                    ) {

                        throw new Error(
                            data?.message ||
                            "Your Pension request could not be confirmed."
                        );
                    }


                    /* REFRESH PENSION INFORMATION */

                    depositForm.reset();

                    updateDepositDestinationUI();

                    if (
                        typeof loadMemberPension === "function"
                    ) {

                        await loadMemberPension(
                            authData.user
                        );
                    }


                    showMessage(
                        data.message ||
                        "Your Pension contribution request has been submitted for administrator review. No payment was collected, no wallet was debited and your Pension balance was not credited."
                    );

                    return;
                }


                /* =====================================
                   SAVINGS DEPOSIT
                   ORIGINAL PAYSTACK PROCESS
                ===================================== */

                const selectedMethod =
                    getElement("depositMethod")?.value;

                const phone =
                    getElement("depositPhone")?.value.trim();

                const methodMap = {

                    mtn_momo: "mtn",

                    telecel_cash: "telecel",

                    at_money: "at"

                };

                const method =
                    methodMap[selectedMethod];


                if (!method) {

                    throw new Error(
                        "Please select a valid Savings deposit method."
                    );
                }

                if (!/^0\d{9}$/.test(phone)) {

                    throw new Error(
                        "Enter a valid 10-digit Ghana mobile money number."
                    );
                }

                if (submitButton) {

                    submitButton.textContent =
                        "Connecting to Paystack...";
                }


                const {
                    data,
                    error
                } = await nexusSupabase.functions.invoke(
                    "nexus-deposit",
                    {
                        body: {
                            amount,
                            method,
                            phone
                        }
                    }
                );


                if (error) {

                    throw new Error(
                        error.message ||
                        "Unable to initialize your Savings deposit."
                    );
                }

                if (
                    !data ||
                    data.success !== true ||
                    !data.authorization_url
                ) {

                    throw new Error(
                        data?.message ||
                        "Paystack did not return a payment link."
                    );
                }


                console.log(
                    "Savings deposit initialized:",
                    data.reference
                );


                window.location.assign(
                    data.authorization_url
                );


            } catch (error) {

                console.error(
                    "Deposit or Pension request error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to complete your request. Please try again."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    updateDepositDestinationUI();
                }
            }

        }
    );
}





/* =========================================
   28. MEMBER WITHDRAWAL REQUEST
========================================= */

const withdrawalForm = getElement("withdrawalForm");

if (withdrawalForm) {

    withdrawalForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const amount = Number(
            getElement("withdrawAmount")?.value
        );

        const method =
            getElement("withdrawMethod")?.value;

        const accountName =
            getElement("withdrawAccountName")?.value.trim();

        const accountNumber =
            getElement("withdrawPhone")?.value.trim();

        const note =
            getElement("withdrawNote")?.value.trim() || null;

        if (!Number.isFinite(amount) || amount <= 0) {

            showMessage(
                "Please enter a valid withdrawal amount."
            );

            return;
        }

        if (!method) {

            showMessage(
                "Please select a withdrawal method."
            );

            return;
        }

        if (!accountName || accountName.length < 2) {

            showMessage(
                "Please enter the recipient's full account name."
            );

            return;
        }

        if (!accountNumber || accountNumber.length < 5) {

            showMessage(
                "Please enter a valid mobile money or bank account number."
            );

            return;
        }

        const paymentDetails =
            "Account Name: " + accountName +
            " | Account Number: " + accountNumber;

        const submitButton = withdrawalForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting Request...";
        }

        try {

            const {
                data: authData,
                error: authError
            } = await nexusSupabase.auth.getUser();

            if (authError) throw authError;

            if (!authData.user) {

                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const {
                data,
                error
            } = await nexusSupabase.rpc(
                "submit_withdrawal_request",
                {
                    p_amount: amount,
                    p_method: method,
                    p_payment_details: paymentDetails,
                    p_note: note
                }
            );

            if (error) throw error;

            if (!data || data.success !== true) {

                throw new Error(
                    data?.message ||
                    "Your withdrawal request could not be submitted."
                );
            }

            withdrawalForm.reset();

            await loadMemberWallet(authData.user);

            await loadMemberTransactions(authData.user);

            await loadPendingWithdrawals(authData.user);

            await loadNexusNotifications(authData.user);

            showMessage(
                "Withdrawal request submitted successfully!\n\n" +

                "Amount: " + formatMoney(amount) + "\n" +

                "Recipient Name: " + accountName + "\n" +

                "Account Number: " + accountNumber + "\n" +

                "Withdrawal Method: " + method + "\n" +

                "Status: Pending\n" +

                "Request ID: " + data.request_id + "\n\n" +

                "Your money is reserved while the request awaits review. It is not yet paid out."
            );

            console.log(
                "Withdrawal request submitted:",
                data
            );

        } catch (error) {

            console.error(
                "Withdrawal request error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to submit your withdrawal request. Please try again."
            );

        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Submit Withdrawal Request";
            }
        }

    });
}


/* =========================================
   29. MEMBER TRANSACTION FILTERS
========================================= */

function initializeTransactionFilters() {

    const filterContainer =
        getElement("transactionFilters");

    const transactionList =
        getElement("transactionList");

    if (!filterContainer || !transactionList) {
        return;
    }

    /*
     * Prevent duplicate event listeners if this function
     * is called more than once.
     */

    if (filterContainer.dataset.initialized === "true") {
        return;
    }

    filterContainer.dataset.initialized = "true";


    /* Transaction type buttons */

    filterContainer.addEventListener("click", function(event) {

        const button = event.target.closest(
            "button[data-filter]"
        );

        if (!button) return;

        filterContainer.querySelectorAll(
            "button[data-filter]"
        ).forEach(item => {

            item.classList.remove("active");

        });

        button.classList.add("active");

        renderMemberTransactions();
    });


    /* Date preset */

    const datePreset =
        getElement("statementDatePreset");

    const customDates =
        getElement("customStatementDates");

    if (datePreset) {

        datePreset.addEventListener("change", function() {

            if (customDates) {

                customDates.hidden =
                    datePreset.value !== "custom";
            }

        });
    }


    /* Apply filters */

    const applyButton =
        getElement("applyStatementFilters");

    if (applyButton) {

        applyButton.addEventListener("click", function() {

            renderMemberTransactions();

        });
    }


    /* Reset filters */

    const resetButton =
        getElement("resetStatementFilters");

    if (resetButton) {

        resetButton.addEventListener("click", function() {

            if (datePreset) {
                datePreset.value = "all";
            }

            if (customDates) {
                customDates.hidden = true;
            }

            const startDate =
                getElement("statementStartDate");

            const endDate =
                getElement("statementEndDate");

            const status =
                getElement("statementStatus");

            const reference =
                getElement("statementReferenceSearch");

            if (startDate) startDate.value = "";
            if (endDate) endDate.value = "";

            if (status) status.value = "all";

            if (reference) reference.value = "";

            filterContainer.querySelectorAll(
                "button[data-filter]"
            ).forEach(item => {

                item.classList.toggle(
                    "active",
                    item.dataset.filter === "all"
                );

            });

            renderMemberTransactions();

        });
    }


    /* Search when Enter is pressed */

    const referenceSearch =
        getElement("statementReferenceSearch");

    if (referenceSearch) {

        referenceSearch.addEventListener("keydown", function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                renderMemberTransactions();
            }
        });
    }


    /* Export buttons */

    const pdfButton =
        getElement("downloadStatementPDF");

    if (pdfButton) {

        pdfButton.addEventListener("click", function() {

            downloadMemberStatementPDF();

        });
    }

    const excelButton =
        getElement("downloadStatementExcel");

    if (excelButton) {

        excelButton.addEventListener("click", function() {

            downloadMemberStatementExcel();

        });
    }
}


/* =========================================
   30. MEMBER STATEMENT EXPORT DATA
========================================= */

function getMemberStatementExportData() {

    const result = getFilteredMemberTransactions();

    if (!result.valid) {

        alert(result.message);

        return null;
    }

    if (result.transactions.length === 0) {

        alert("There are no matching transactions to export.");

        return null;
    }

    return {
        transactions: result.transactions,
        totals: calculateMemberStatementTotals(
            result.transactions
        )
    };
}


function getMemberStatementPeriodLabel() {

    const preset =
        getElement("statementDatePreset")?.value || "all";

    if (preset === "today") return "Today";

    if (preset === "yesterday") return "Yesterday";

    if (preset === "last7") return "Last 7 Days";

    if (preset === "last30") return "Last 30 Days";

    if (preset === "custom") {

        return (
            (getElement("statementStartDate")?.value || "") +
            " to " +
            (getElement("statementEndDate")?.value || "")
        );
    }

    return "All Dates";
}


/* =========================================
   31. MEMBER STATEMENT PDF EXPORT
========================================= */


function downloadMemberStatementPDF() {

    const exportData = getMemberStatementExportData();

    if (!exportData) return;

    if (!memberStatementAccount) {
        alert("Member account details are not available. Please refresh your dashboard and try again.");
        return;
    }

    const printWindow = window.open(
        "",
        "_blank",
        "width=1000,height=750"
    );

    if (!printWindow) {
        alert(
            "Your browser blocked the statement window. " +
            "Please allow pop-ups for this website and try again."
        );
        return;
    }

    const transactions = exportData.transactions;
    const totals = exportData.totals;
    const account = memberStatementAccount;

    const generatedDate = new Date();

    const generatedAt = generatedDate.toLocaleString("en-GH");

    const statementReference =
        "NWP-STMT-" +
        generatedDate.toISOString()
            .replace(/[-:TZ.]/g, "")
            .slice(0, 14);

    const rows = transactions.map(transaction => {

        const reference =
            getMemberTransactionReference(transaction);

        const amount = Number(transaction.amount) || 0;

        return `
            <tr>
                <td>${escapeStatementHTML(
                    getMemberTransactionLabel(transaction)
                )}</td>

                <td>${escapeStatementHTML(reference || "—")}</td>

                <td>${escapeStatementHTML(
                    new Date(transaction.created_at).toLocaleString(
                        "en-GH",
                        {
                            dateStyle: "medium",
                            timeStyle: "short"
                        }
                    )
                )}</td>

                <td class="amount">
                    ${transaction.type === "deposit" ? "+" : "-"}
                    GH₵${amount.toFixed(2)}
                </td>

                <td>${escapeStatementHTML(
                    getMemberTransactionStatusLabel(
                        transaction.status
                    )
                )}</td>
            </tr>
        `;
    }).join("");

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <meta name="viewport"
                content="width=device-width, initial-scale=1.0">

            <title>NEXUS WEALTH PARTNERS - Account Statement</title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    color: #263747;
                    margin: 0;
                    padding: 35px;
                    background: #fff;
                }

                .statement {
                    max-width: 1050px;
                    margin: auto;
                }

                .header {
                    border-bottom: 4px solid #087443;
                    padding-bottom: 18px;
                    margin-bottom: 25px;
                }

                .brand {
                    color: #102b46;
                    font-size: 25px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    margin: 0;
                }

                .brand-subtitle {
                    color: #64748b;
                    font-size: 12px;
                    margin-top: 6px;
                    letter-spacing: 2px;
                }

                .document-title {
                    text-align: right;
                    margin-top: 22px;
                }

                .document-title h2 {
                    color: #102b46;
                    margin: 0 0 5px;
                    font-size: 21px;
                }

                .document-title p {
                    margin: 0;
                    color: #64748b;
                    font-size: 12px;
                }

                .account-section {
                    border: 1px solid #dce4eb;
                    border-radius: 7px;
                    padding: 18px;
                    margin-bottom: 22px;
                }

                .section-title {
                    color: #102b46;
                    font-size: 14px;
                    font-weight: 700;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 10px;
                    margin: 0 0 14px;
                }

                .account-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px 30px;
                }

                .detail-label {
                    color: #64748b;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                    margin-bottom: 5px;
                }

                .detail-value {
                    color: #102b46;
                    font-size: 13px;
                    font-weight: 700;
                    overflow-wrap: anywhere;
                }

                .statement-meta {
                    background: #f8fafc;
                    padding: 14px 18px;
                    border-radius: 6px;
                    margin-bottom: 22px;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin: 20px 0;
                }

                .summary-card {
                    border: 1px solid #dce4eb;
                    border-radius: 6px;
                    padding: 14px;
                }

                .summary-card span {
                    display: block;
                    color: #64748b;
                    font-size: 11px;
                }

                .summary-card strong {
                    display: block;
                    color: #102b46;
                    font-size: 17px;
                    margin-top: 8px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 18px;
                    font-size: 11px;
                }

                th, td {
                    border: 1px solid #dce4eb;
                    padding: 10px 8px;
                    text-align: left;
                }

                th {
                    background: #102b46;
                    color: white;
                    font-size: 10px;
                    text-transform: uppercase;
                }

                tbody tr:nth-child(even) {
                    background: #f8fafc;
                }

                .amount {
                    white-space: nowrap;
                    font-weight: 700;
                }

                .footer {
                    border-top: 1px solid #dce4eb;
                    margin-top: 35px;
                    padding-top: 15px;
                    color: #64748b;
                    font-size: 10px;
                    line-height: 1.7;
                    text-align: center;
                }

                @media print {
                    body {
                        padding: 10px;
                    }

                    .statement {
                        max-width: none;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        page-break-inside: avoid;
                    }
                }

                @media (max-width: 600px) {
                    body {
                        padding: 15px;
                    }

                    .account-grid,
                    .statement-meta {
                        grid-template-columns: 1fr;
                    }

                    .summary {
                        grid-template-columns: 1fr;
                    }

                    table {
                        font-size: 9px;
                    }

                    th, td {
                        padding: 6px 4px;
                    }
                }

            </style>
        </head>

        <body>

            <div class="statement">

                <div class="header">

                    <h1 class="brand">
                        NEXUS WEALTH PARTNERS
                    </h1>

                    <div class="brand-subtitle">
                        FINANCIAL SERVICES
                    </div>

                    <div class="document-title">
                        <h2>ACCOUNT STATEMENT</h2>
                        <p>Official Member Transaction Record</p>
                    </div>

                </div>

                <div class="account-section">

                    <h3 class="section-title">
                        ACCOUNT HOLDER INFORMATION
                    </h3>

                    <div class="account-grid">

                        <div>
                            <div class="detail-label">
                                Account Holder
                            </div>

                            <div class="detail-value">
                                ${escapeStatementHTML(account.full_name)}
                            </div>
                        </div>

                        <div>
                            <div class="detail-label">
                                Member ID
                            </div>

                            <div class="detail-value">
                                ${escapeStatementHTML(account.member_id)}
                            </div>
                        </div>

                        <div>
                            <div class="detail-label">
                                Registered Phone Number
                            </div>

                            <div class="detail-value">
                                ${escapeStatementHTML(account.phone)}
                            </div>
                        </div>

                        <div>
                            <div class="detail-label">
                                Registered Email Address
                            </div>

                            <div class="detail-value">
                                ${escapeStatementHTML(account.email)}
                            </div>
                        </div>

                        <div>
                            <div class="detail-label">
                                Account Status
                            </div>

                            <div class="detail-value">
                                ${escapeStatementHTML(account.account_status)}
                            </div>
                        </div>

                    </div>

                </div>

                <div class="statement-meta">

                    <div>
                        <div class="detail-label">
                            Statement Period
                        </div>

                        <div class="detail-value">
                            ${escapeStatementHTML(
                                getMemberStatementPeriodLabel()
                            )}
                        </div>
                    </div>

                    <div>
                        <div class="detail-label">
                            Statement Reference
                        </div>

                        <div class="detail-value">
                            ${escapeStatementHTML(statementReference)}
                        </div>
                    </div>

                    <div>
                        <div class="detail-label">
                            Date Generated
                        </div>

                        <div class="detail-value">
                            ${escapeStatementHTML(generatedAt)}
                        </div>
                    </div>

                </div>

                <h3 class="section-title">
                    TRANSACTION SUMMARY
                </h3>

                <div class="summary">

                    <div class="summary-card">
                        <span>Total Successful Deposits</span>

                        <strong>
                            GH₵${totals.totalDeposits.toFixed(2)}
                        </strong>
                    </div>

                    <div class="summary-card">
                        <span>Total Wallet Debits</span>

                        <strong>
                            GH₵${totals.totalWithdrawals.toFixed(2)}
                        </strong>
                    </div>

                    <div class="summary-card">
                        <span>Matching Transactions</span>

                        <strong>
                            ${totals.transactionCount}
                        </strong>
                    </div>

                </div>

                <h3 class="section-title">
                    TRANSACTION DETAILS
                </h3>

                <table>

                    <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>Reference</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

                <div class="footer">

                    <strong>NEXUS WEALTH PARTNERS</strong>

                    <p>
                        This statement is generated from the
                        transaction records available in your
                        NEXUS member account.
                    </p>

                    <p>
                        This document is intended for account
                        information and record-keeping purposes.
                    </p>

                    <p>
                        Statement Reference:
                        ${escapeStatementHTML(statementReference)}
                    </p>

                </div>

            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>

        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}






/* =========================================================
   32. PROFESSIONAL MEMBER STATEMENT EXCEL EXPORT
   NEXUS WEALTH PARTNERS

   Professional branded Excel statement.
   No transaction summary.
   Read-only export.
   Does not modify wallet balances or transactions.
========================================================= */

function downloadMemberStatementExcel() {

    const exportData = getMemberStatementExportData();

    if (!exportData) return;

    if (
        typeof XLSX === "undefined" ||
        !XLSX.utils ||
        !XLSX.writeFile
    ) {

        alert(
            "The professional Excel library could not be loaded. " +
            "Please refresh the page and try again."
        );

        return;
    }


    const transactions = exportData.transactions || [];

    const generatedDate = new Date();

    const statementReference =
        "NWP-STMT-" + generatedDate.getTime();


    /* =====================================================
       1. ACCOUNT HOLDER INFORMATION
    ===================================================== */

    function getProfileText(elementId, fallback) {

        const element =
            document.getElementById(elementId);

        const value =
            element?.textContent?.trim();

        return value || fallback;

    }


    const accountName =
        getProfileText("profileName", "Not available");

    const accountEmail =
        getProfileText("profileEmail", "Not available");

    const accountPhone =
        getProfileText("profilePhone", "Not available");

    const memberId =
        getProfileText("profileMemberId", "Not available");

    const accountStatus =
        getProfileText("accountStatus", "Not available");


    /* =====================================================
       2. WORKSHEET STRUCTURE
       TRANSACTION SUMMARY REMOVED
    ===================================================== */

    const worksheetData = [

        ["NEXUS WEALTH PARTNERS"],

        ["OFFICIAL MEMBER TRANSACTION STATEMENT"],

        [],

        ["ACCOUNT HOLDER INFORMATION"],

        [
            "Full Name",
            accountName,
            "",
            "",
            "Member ID",
            memberId
        ],

        [
            "Phone Number",
            accountPhone,
            "",
            "",
            "Email Address",
            accountEmail
        ],

        [
            "Account Status",
            accountStatus,
            "",
            "",
            "Statement Reference",
            statementReference
        ],

        [],

        ["STATEMENT DETAILS"],

        [
            "Statement Period",
            getMemberStatementPeriodLabel(),
            "",
            "",
            "Generated On",
            generatedDate
        ],

        [],

        ["TRANSACTION DETAILS"],

        [
            "No.",
            "Transaction",
            "Reference",
            "Date",
            "Type",
            "Amount (GHS)",
            "Status",
            "Wallet Debited / Restored"
        ]

    ];


    /* =====================================================
       3. TRANSACTION RECORDS
    ===================================================== */

    transactions.forEach((transaction, index) => {

        const amount =
            Number(transaction.amount) || 0;

        const transactionDate =
            transaction.created_at
                ? new Date(transaction.created_at)
                : null;

        const validDate =
            transactionDate &&
            !Number.isNaN(transactionDate.getTime());


        let walletAction = "—";


        if (transaction.type === "withdrawal") {

            const debited =
                transaction.wallet_debited === true;

            const restored =
                transaction.wallet_restored === true;


            walletAction =
                "Debited: " +
                (debited ? "Yes" : "No") +
                " | Restored: " +
                (restored ? "Yes" : "No");

        }


        worksheetData.push([

            index + 1,

            getMemberTransactionLabel(transaction),

            getMemberTransactionReference(transaction) || "—",

            validDate ? transactionDate : "—",

            transaction.type === "deposit"
                ? "Deposit"
                : "Withdrawal",

            amount,

            getMemberTransactionStatusLabel(
                transaction.status
            ),

            walletAction

        ]);

    });


    /* =====================================================
       4. CREATE WORKSHEET
    ===================================================== */

    const worksheet =
        XLSX.utils.aoa_to_sheet(worksheetData);


    /* =====================================================
       5. CORRECT ROW POSITIONS
       SUMMARY ROWS REMOVED
    ===================================================== */

    const titleRow = 0;

    const subtitleRow = 1;

    const accountHeadingRow = 3;

    const accountFirstRow = 4;

    const statementHeadingRow = 8;

    const statementDetailsRow = 9;

    const transactionHeadingRow = 11;

    const transactionHeaderRow = 12;

    const firstTransactionRow = 13;

    const lastTransactionRow =
        firstTransactionRow + transactions.length - 1;


    /* =====================================================
       6. MERGED CELLS
    ===================================================== */

    worksheet["!merges"] = [

        // Main company heading
        {
            s: { r: titleRow, c: 0 },
            e: { r: titleRow, c: 7 }
        },

        // Subtitle
        {
            s: { r: subtitleRow, c: 0 },
            e: { r: subtitleRow, c: 7 }
        },

        // Account information heading
        {
            s: { r: accountHeadingRow, c: 0 },
            e: { r: accountHeadingRow, c: 7 }
        },

        // Statement details heading
        {
            s: { r: statementHeadingRow, c: 0 },
            e: { r: statementHeadingRow, c: 7 }
        },

        // Transaction details heading
        {
            s: { r: transactionHeadingRow, c: 0 },
            e: { r: transactionHeadingRow, c: 7 }
        },


        // Account information
        {
            s: { r: 4, c: 1 },
            e: { r: 4, c: 3 }
        },

        {
            s: { r: 4, c: 5 },
            e: { r: 4, c: 7 }
        },

        {
            s: { r: 5, c: 1 },
            e: { r: 5, c: 3 }
        },

        {
            s: { r: 5, c: 5 },
            e: { r: 5, c: 7 }
        },

        {
            s: { r: 6, c: 1 },
            e: { r: 6, c: 3 }
        },

        {
            s: { r: 6, c: 5 },
            e: { r: 6, c: 7 }
        },


        // Statement details
        {
            s: { r: 9, c: 1 },
            e: { r: 9, c: 3 }
        },

        {
            s: { r: 9, c: 5 },
            e: { r: 9, c: 7 }
        }

    ];


    /* =====================================================
       7. PROFESSIONAL COLOUR PALETTE
    ===================================================== */

    const navy = "102B46";

    const blue = "1D4E75";

    const lightBlue = "EAF1F7";

    const lighterBlue = "F5F8FC";

    const borderColour = "D6E0EA";

    const darkText = "263747";

    const white = "FFFFFF";


    /* =====================================================
       8. STYLE HELPERS
    ===================================================== */

    function applyCellStyle(cellAddress, style) {

        if (!worksheet[cellAddress]) return;

        worksheet[cellAddress].s = style;

    }


    function applyRowStyle(rowNumber, columnCount, style) {

        for (
            let column = 0;
            column < columnCount;
            column++
        ) {

            const address = XLSX.utils.encode_cell({

                r: rowNumber,

                c: column

            });

            applyCellStyle(address, style);

        }

    }


    const thinBorder = {

        top: {
            style: "thin",
            color: borderColour
        },

        bottom: {
            style: "thin",
            color: borderColour
        },

        left: {
            style: "thin",
            color: borderColour
        },

        right: {
            style: "thin",
            color: borderColour
        }

    };


    /* =====================================================
       9. MAIN COMPANY HEADING
    ===================================================== */

    applyCellStyle("A1", {

        font: {

            name: "Arial",

            sz: 22,

            bold: true,

            color: {
                rgb: white
            }

        },

        fill: {

            patternType: "solid",

            fgColor: {
                rgb: navy
            }

        },

        alignment: {

            horizontal: "center",

            vertical: "center"

        }

    });


    applyCellStyle("A2", {

        font: {

            name: "Arial",

            sz: 11,

            bold: true,

            color: {
                rgb: white
            }

        },

        fill: {

            patternType: "solid",

            fgColor: {
                rgb: blue
            }

        },

        alignment: {

            horizontal: "center",

            vertical: "center"

        }

    });


    /* =====================================================
       10. SECTION HEADINGS
    ===================================================== */

    [

        accountHeadingRow,

        statementHeadingRow,

        transactionHeadingRow

    ].forEach(rowNumber => {

        applyRowStyle(rowNumber, 8, {

            font: {

                name: "Arial",

                sz: 11,

                bold: true,

                color: {
                    rgb: white
                }

            },

            fill: {

                patternType: "solid",

                fgColor: {
                    rgb: navy
                }

            },

            alignment: {

                vertical: "center",

                indent: 1

            }

        });

    });


    /* =====================================================
       11. ACCOUNT HOLDER INFORMATION
    ===================================================== */

    [4, 5, 6].forEach(rowNumber => {

        for (
            let column = 0;
            column < 8;
            column++
        ) {

            const address = XLSX.utils.encode_cell({

                r: rowNumber,

                c: column

            });


            const isLabel =
                column === 0 || column === 4;


            applyCellStyle(address, {

                font: {

                    name: "Arial",

                    sz: 10,

                    color: {
                        rgb: darkText
                    },

                    bold: isLabel

                },

                fill: {

                    patternType: "solid",

                    fgColor: {

                        rgb: isLabel
                            ? lightBlue
                            : white

                    }

                },

                alignment: {

                    vertical: "center",

                    wrapText: true

                },

                border: thinBorder

            });

        }

    });


    /* =====================================================
       12. STATEMENT DETAILS
    ===================================================== */

    for (
        let column = 0;
        column < 8;
        column++
    ) {

        const address = XLSX.utils.encode_cell({

            r: statementDetailsRow,

            c: column

        });


        const isLabel =
            column === 0 || column === 4;


        applyCellStyle(address, {

            font: {

                name: "Arial",

                sz: 10,

                color: {
                    rgb: darkText
                },

                bold: isLabel

            },

            fill: {

                patternType: "solid",

                fgColor: {

                    rgb: isLabel
                        ? lightBlue
                        : white

                }

            },

            alignment: {

                vertical: "center",

                wrapText: true

            },

            border: thinBorder

        });

    }


    applyCellStyle("F10", {

        font: {

            name: "Arial",

            sz: 10,

            color: {
                rgb: darkText
            }

        },

        alignment: {

            vertical: "center",

            wrapText: true

        },

        numFmt: "dd mmm yyyy hh:mm",

        border: thinBorder

    });


    /* =====================================================
       13. TRANSACTION TABLE HEADER
    ===================================================== */

    applyRowStyle(transactionHeaderRow, 8, {

        font: {

            name: "Arial",

            sz: 10,

            bold: true,

            color: {
                rgb: white
            }

        },

        fill: {

            patternType: "solid",

            fgColor: {
                rgb: blue
            }

        },

        alignment: {

            horizontal: "center",

            vertical: "center",

            wrapText: true

        },

        border: thinBorder

    });


    /* =====================================================
       14. TRANSACTION TABLE BODY
    ===================================================== */

    for (
        let row = firstTransactionRow;
        row <= lastTransactionRow;
        row++
    ) {

        const worksheetRow = row + 1;

        const alternate =
            (row - firstTransactionRow) % 2 === 1;


        for (
            let column = 0;
            column < 8;
            column++
        ) {

            const address = XLSX.utils.encode_cell({

                r: row,

                c: column

            });


            applyCellStyle(address, {

                font: {

                    name: "Arial",

                    sz: 9,

                    color: {
                        rgb: darkText
                    },

                    bold: column === 5

                },

                fill: {

                    patternType: "solid",

                    fgColor: {

                        rgb: alternate
                            ? lighterBlue
                            : white

                    }

                },

                alignment: {

                    vertical: "center",

                    wrapText: true,

                    horizontal:
                        column === 0
                            ? "center"
                            : column === 5
                                ? "right"
                                : "left"

                },

                border: thinBorder

            });

        }


        /* Ghana cedi amount formatting */

        const amountAddress = "F" + worksheetRow;

        applyCellStyle(amountAddress, {

            font: {

                name: "Arial",

                sz: 9,

                bold: true,

                color: {
                    rgb: navy
                }

            },

            fill: {

                patternType: "solid",

                fgColor: {

                    rgb: alternate
                        ? lighterBlue
                        : white

                }

            },

            alignment: {

                horizontal: "right",

                vertical: "center"

            },

            numFmt: '"GH₵" #,##0.00;[Red]-"GH₵" #,##0.00',

            border: thinBorder

        });


        /* Transaction date formatting */

        const dateAddress = "D" + worksheetRow;

        applyCellStyle(dateAddress, {

            font: {

                name: "Arial",

                sz: 9,

                color: {
                    rgb: darkText
                }

            },

            fill: {

                patternType: "solid",

                fgColor: {

                    rgb: alternate
                        ? lighterBlue
                        : white

                }

            },

            alignment: {

                vertical: "center"

            },

            numFmt: "dd mmm yyyy hh:mm",

            border: thinBorder

        });

    }


    /* =====================================================
       15. COLUMN WIDTHS
    ===================================================== */

    worksheet["!cols"] = [

        { wch: 7 },

        { wch: 27 },

        { wch: 30 },

        { wch: 23 },

        { wch: 15 },

        { wch: 20 },

        { wch: 20 },

        { wch: 32 }

    ];


    /* =====================================================
       16. ROW HEIGHTS
    ===================================================== */

    worksheet["!rows"] = [

        { hpt: 38 },

        { hpt: 25 },

        { hpt: 10 },

        { hpt: 24 },

        { hpt: 28 },

        { hpt: 28 },

        { hpt: 28 },

        { hpt: 10 },

        { hpt: 24 },

        { hpt: 30 },

        { hpt: 10 },

        { hpt: 24 },

        { hpt: 34 }

    ];


    for (
        let row = firstTransactionRow;
        row <= lastTransactionRow;
        row++
    ) {

        worksheet["!rows"][row] = {

            hpt: 30

        };

    }


    /* =====================================================
       17. TRANSACTION TABLE FILTER
    ===================================================== */

    if (transactions.length > 0) {

        worksheet["!autofilter"] = {

            ref:
                "A13:H" + (lastTransactionRow + 1)

        };

    }


    /* =====================================================
       18. PRINT SETTINGS
    ===================================================== */

    worksheet["!margins"] = {

        left: 0.35,

        right: 0.35,

        top: 0.55,

        bottom: 0.55,

        header: 0.2,

        footer: 0.2

    };


    worksheet["!pageSetup"] = {

        paperSize: 9,

        orientation: "landscape",

        fitToWidth: 1,

        fitToHeight: 0

    };


    /* =====================================================
       19. WORKBOOK PROPERTIES
    ===================================================== */

    const workbook = XLSX.utils.book_new();

    workbook.Props = {

        Title:
            "NEXUS WEALTH PARTNERS Member Statement",

        Subject:
            "Official Member Transaction Statement",

        Author:
            "NEXUS WEALTH PARTNERS",

        Company:
            "NEXUS WEALTH PARTNERS",

        Category:
            "Financial Statement"

    };


    /* =====================================================
       20. ADD WORKSHEET
    ===================================================== */

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Member Statement"

    );


    /* =====================================================
       21. DOWNLOAD EXCEL FILE
    ===================================================== */

    const fileDate =
        generatedDate.toISOString().slice(0, 10);


    XLSX.writeFile(

        workbook,

        "NEXUS_Member_Statement_" + fileDate + ".xlsx",

        {

            bookType: "xlsx",

            cellStyles: true

        }

    );

}





/* =========================================
   30. PROFESSIONAL TRANSACTION RECEIPT
========================================= */

function generateTransactionReceipt(transaction) {

    if (!transaction) return;

    const isDeposit = transaction.type === "deposit";

    const successful = isDeposit
        ? transaction.status === "successful"
        : transaction.status === "completed";

    if (!successful) {
        showMessage(
            "A receipt is only available for a completed transaction."
        );
        return;
    }

    const amount = Number(transaction.amount);

    const reference =
        transaction.reference || transaction.id;

    const date = new Date(
        transaction.created_at
    ).toLocaleString("en-GH", {
        dateStyle: "long",
        timeStyle: "short"
    });

    const method = isDeposit
        ? ({
            mtn: "MTN Mobile Money",
            telecel: "Telecel Cash",
            at: "AT Money",
            mtn_momo: "MTN Mobile Money",
            telecel_cash: "Telecel Cash",
            at_money: "AT Money"
        }[transaction.payment_method] || transaction.payment_method)
        : ({
            mtn_momo: "MTN Mobile Money",
            telecel_cash: "Telecel Cash",
            at_money: "AT Money",
            bank: "Bank Account"
        }[transaction.withdrawal_method] || transaction.withdrawal_method);

    const memberName =
        getElement("profileName")?.textContent || "Nexus Member";

    const memberId =
        getElement("memberId")?.textContent || "Member";

    const memberEmail =
        getElement("profileEmail")?.textContent || "";

    const receiptWindow = window.open(
        "",
        "_blank",
        "width=750,height=850"
    );

    if (!receiptWindow) {
        showMessage(
            "Please allow pop-ups in your browser to view your receipt."
        );
        return;
    }

    const receiptHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nexus Transaction Receipt</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    background: #f1f5f9;
                    padding: 25px;
                    color: #1e293b;
                }

                .receipt {
                    max-width: 650px;
                    margin: 20px auto;
                    background: white;
                    padding: 40px;
                    border-radius: 14px;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.08);
                }

                .header {
                    text-align: center;
                    border-bottom: 2px solid #16a34a;
                    padding-bottom: 25px;
                }

                .brand {
                    font-size: 28px;
                    font-weight: bold;
                    color: #123b2a;
                }

                .subtitle {
                    color: #64748b;
                    margin-top: 8px;
                }

                .success {
                    display: inline-block;
                    background: #dcfce7;
                    color: #15803d;
                    padding: 8px 18px;
                    border-radius: 30px;
                    margin-top: 20px;
                    font-weight: bold;
                }

                .amount {
                    text-align: center;
                    margin: 30px 0;
                }

                .amount h1 {
                    font-size: 34px;
                    color: #123b2a;
                    margin: 10px 0;
                }

                .details {
                    margin-top: 25px;
                }

                .detail {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 13px 0;
                    border-bottom: 1px solid #e2e8f0;
                }

                .detail span:first-child {
                    color: #64748b;
                }

                .detail strong {
                    text-align: right;
                    overflow-wrap: anywhere;
                }

                .footer {
                    text-align: center;
                    margin-top: 35px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    line-height: 1.7;
                }

                .print-button {
                    display: block;
                    margin: 25px auto 0;
                    padding: 14px 28px;
                    background: #123b2a;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 15px;
                }

                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }

                    .receipt {
                        box-shadow: none;
                        margin: 0 auto;
                    }

                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>

        <body>
            <div class="receipt">

                <div class="header">
                    <div class="brand">
                        NEXUS WEALTH PARTNERS
                    </div>

                    <div class="subtitle">
                        Official Transaction Receipt
                    </div>

                    <div class="success">
                        ${isDeposit ? "DEPOSIT SUCCESSFUL" : "WITHDRAWAL COMPLETED"}
                    </div>
                </div>

                <div class="amount">
                    <p>
                        ${isDeposit ? "Amount Deposited" : "Amount Withdrawn"}
                    </p>

                    <h1>${formatMoney(amount)}</h1>
                </div>

                <div class="details">

                    <div class="detail">
                        <span>Member Name</span>
                        <strong>${escapeReceiptText(memberName)}</strong>
                    </div>

                    <div class="detail">
                        <span>Member ID</span>
                        <strong>${escapeReceiptText(memberId)}</strong>
                    </div>

                    <div class="detail">
                        <span>Email</span>
                        <strong>${escapeReceiptText(memberEmail)}</strong>
                    </div>

                    <div class="detail">
                        <span>Transaction Type</span>
                        <strong>${isDeposit ? "Deposit" : "Withdrawal"}</strong>
                    </div>

                    <div class="detail">
                        <span>Payment Method</span>
                        <strong>${escapeReceiptText(method)}</strong>
                    </div>

                    <div class="detail">
                        <span>Transaction Reference</span>
                        <strong>${escapeReceiptText(reference)}</strong>
                    </div>

                    <div class="detail">
                        <span>Date</span>
                        <strong>${escapeReceiptText(date)}</strong>
                    </div>

                    <div class="detail">
                        <span>Status</span>
                        <strong>Successful</strong>
                    </div>

                </div>

                <div class="footer">
                    Thank you for using Nexus Wealth Partners.
                    <br>
                    Keep this receipt for your records.
                </div>

                <button class="print-button" onclick="window.print()">
                    Print / Save Receipt
                </button>

            </div>
        </body>
        </html>
    `;

    receiptWindow.document.open();
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}


/* =========================================
   31. RECEIPT TEXT SECURITY
========================================= */

function escapeReceiptText(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]
    );
}


/* =========================================
   32. NEXUS CUSTOMER SUPPORT
========================================= */

let selectedSupportTicketId = null;
let supportEventsInitialized = false;


/* SUPPORT DATE FORMAT */

function formatSupportDate(value) {

    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-GH", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


/* SAFE ELEMENT CREATION */

function createSupportElement(tag, className, text) {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined && text !== null) {
        element.textContent = String(text);
    }

    return element;
}


/* VERIFY AUTHENTICATED USER */

async function getSupportUser() {

    const { data, error } =
        await nexusSupabase.auth.getUser();

    if (error) throw error;

    if (!data.user) {

        throw new Error(
            "Your session has expired. Please log in again."
        );
    }

    return data.user;
}


/* LOAD SUPPORT TICKETS */

async function loadSupportTickets() {

    const list = getElement("supportTicketList");

    if (!list) return [];

    list.replaceChildren(
        createSupportElement(
            "p",
            "",
            "Loading your reports..."
        )
    );

    try {

        await getSupportUser();

        const { data, error } = await nexusSupabase.rpc(
            "nexus_list_support_tickets",
            {
                p_limit: 100
            }
        );

        if (error) throw error;

        const tickets = data || [];

        list.replaceChildren();

        if (tickets.length === 0) {

            list.appendChild(
                createSupportElement(
                    "p",
                    "support-empty",
                    "You have not submitted any reports yet."
                )
            );

            return [];
        }

        tickets.forEach(ticket => {

            const card = createSupportElement(
                "article",
                "support-ticket-card"
            );

            const heading = createSupportElement(
                "h4",
                "",
                ticket.subject
            );

            const category = createSupportElement(
                "p",
                "support-ticket-category",
                "Category: " + ticket.category
            );

            const statusValue = String(
                ticket.status || "open"
            );

            const status = createSupportElement(
                "span",
                "support-status support-status-" + statusValue,
                statusValue.replaceAll("_", " ")
            );

            const date = createSupportElement(
                "small",
                "",
                "Last activity: " +
                formatSupportDate(ticket.last_message_at)
            );

            const openButton = createSupportElement(
                "button",
                "support-open-button",
                "Open Conversation"
            );

            openButton.type = "button";

            openButton.addEventListener("click", function() {

                openSupportConversation(ticket);

            });

            card.append(
                heading,
                category,
                status,
                date,
                openButton
            );

            list.appendChild(card);

        });

        return tickets;

    } catch (error) {

        console.error(
            "Support ticket loading error:",
            error
        );

        list.replaceChildren(
            createSupportElement(
                "p",
                "support-error",
                error.message ||
                "Unable to load your reports."
            )
        );

        throw error;
    }
}


/* SUBMIT NEW SUPPORT REPORT */

async function submitSupportTicket(event) {

    event.preventDefault();

    const form = getElement("supportTicketForm");
    const button = getElement("supportSubmitButton");

    const subject =
        getElement("supportSubject")?.value.trim();

    const category =
        getElement("supportCategory")?.value;

    const message =
        getElement("supportMessage")?.value.trim();

    if (
        !subject ||
        subject.length < 3 ||
        !category ||
        !message
    ) {

        showMessage(
            "Please enter a valid subject, category and message."
        );

        return;
    }

    if (message.length > 5000) {

        showMessage(
            "Your report message cannot exceed 5,000 characters."
        );

        return;
    }

    if (button) {

        button.disabled = true;
        button.textContent = "Submitting...";
    }

    try {

        await getSupportUser();

        const { data, error } = await nexusSupabase.rpc(
            "nexus_submit_support_ticket",
            {
                p_subject: subject,
                p_category: category,
                p_message: message
            }
        );

        if (error) throw error;

        if (!data || data.success !== true) {

            throw new Error(
                data?.message ||
                "Your report could not be submitted."
            );
        }

        form.reset();

        await loadSupportTickets();

        showMessage(
            "Your report has been submitted successfully. " +
            "Our support team can now review and reply to it."
        );

    } catch (error) {

        console.error(
            "Support submission error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to submit your report."
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = "Submit Report";
        }
    }
}


/* OPEN SUPPORT CONVERSATION */

async function openSupportConversation(ticket) {

    const conversation = getElement("supportConversation");

    const subject =
        getElement("supportConversationSubject");

    const status =
        getElement("supportConversationStatus");

    const messageList =
        getElement("supportMessageList");

    if (!conversation || !ticket) return;

    selectedSupportTicketId = ticket.ticket_id;

    if (subject) {
        subject.textContent = ticket.subject;
    }

    if (status) {

        status.textContent =
            "Status: " +
            String(ticket.status).replaceAll("_", " ");
    }

    conversation.hidden = false;

    if (messageList) {

        messageList.replaceChildren(
            createSupportElement(
                "p",
                "",
                "Loading conversation..."
            )
        );
    }

    await loadSupportMessages(
        ticket.ticket_id,
        ticket.status
    );

    conversation.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}



/* LOAD SUPPORT MESSAGES */

async function loadSupportMessages(ticketId, ticketStatus) {

    const messageList = getElement("supportMessageList");
    const replyForm = getElement("supportReplyForm");
    const closedNotice = getElement("supportReplyClosedNotice");
    const replyButton = getElement("supportReplyButton");

    if (!messageList || !ticketId) return;

    try {

        const { data, error } = await nexusSupabase.rpc(
            "nexus_list_support_messages",
            {
                p_ticket_id: ticketId
            }
        );

        if (error) throw error;

        const messages = data || [];

        messageList.replaceChildren();

        if (messages.length === 0) {

            messageList.appendChild(
                createSupportElement(
                    "p",
                    "support-empty",
                    "No messages yet. Send a reply to continue this conversation."
                )
            );
        }

        messages.forEach(message => {

            const role = String(
                message.sender_role || "customer"
            ).toLowerCase();

            const isCustomer = role === "customer";

            const item = createSupportElement(
                "article",
                "support-message " +
                (isCustomer
                    ? "support-message-customer"
                    : "support-message-staff")
            );

            const header = createSupportElement(
                "div",
                "support-message-header"
            );

            const senderInfo = createSupportElement(
                "div",
                "support-message-sender-info"
            );

            const sender = createSupportElement(
                "strong",
                "support-message-sender",
                message.sender_name || "Support Team"
            );

            const roleLabel = createSupportElement(
                "span",
                "support-message-role",
                role === "admin"
                    ? "Administrator"
                    : role === "teller"
                        ? "Support Staff"
                        : "You"
            );

            const date = createSupportElement(
                "time",
                "support-message-date",
                formatSupportDate(message.created_at)
            );

            const body = createSupportElement(
                "p",
                "support-message-body",
                message.message
            );

            senderInfo.append(sender, roleLabel);
            header.append(senderInfo, date);
            item.append(header, body);

            messageList.appendChild(item);

        });

        const isClosed = ticketStatus === "closed";

        if (replyForm) {
            replyForm.hidden = isClosed;
        }

        if (closedNotice) {
            closedNotice.hidden = !isClosed;
        }

        if (replyButton) {
            replyButton.disabled = isClosed;
        }

        const conversationStatus =
            getElement("supportConversationStatus");

        if (conversationStatus) {

            conversationStatus.textContent =
                "Status: " +
                String(ticketStatus || "open").replaceAll("_", " ");
        }

    } catch (error) {

        console.error(
            "Support conversation loading error:",
            error
        );

        messageList.replaceChildren(
            createSupportElement(
                "p",
                "support-error",
                error.message ||
                "Unable to load this conversation."
            )
        );
    }
}



/* SEND SUPPORT REPLY */

async function submitSupportReply(event) {

    event.preventDefault();

    const button =
        getElement("supportReplyButton");

    const messageInput =
        getElement("supportReplyMessage");

    const message = messageInput?.value.trim();

    if (!selectedSupportTicketId) {

        showMessage("Please open a report first.");

        return;
    }

    if (!message) {

        showMessage("Enter a message before sending.");

        return;
    }

    if (message.length > 5000) {

        showMessage(
            "Your reply cannot exceed 5,000 characters."
        );

        return;
    }

    if (button) {

        button.disabled = true;
        button.textContent = "Sending...";
    }

    try {

        await getSupportUser();

        const { data, error } = await nexusSupabase.rpc(
            "nexus_reply_support_ticket",
            {
                p_ticket_id: selectedSupportTicketId,
                p_message: message
            }
        );

        if (error) throw error;

        if (!data || data.success !== true) {

            throw new Error(
                data?.message ||
                "Your reply could not be sent."
            );
        }

        messageInput.value = "";

        const currentTicketId = selectedSupportTicketId;

        const tickets = await loadSupportTickets();

        const currentTicket = tickets.find(
            ticket =>
                ticket.ticket_id === currentTicketId
        );

        await loadSupportMessages(
            currentTicketId,
            currentTicket?.status || data.status || "open"
        );

    } catch (error) {

        console.error(
            "Support reply error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to send your reply."
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = "Send Reply";
        }
    }
}


/* INITIALIZE SUPPORT EVENTS */

function initializeNexusSupport() {

    if (supportEventsInitialized) return;

    const ticketForm =
        getElement("supportTicketForm");

    const replyForm =
        getElement("supportReplyForm");

    const refreshButton =
        getElement("refreshSupportTickets");

    const closeButton =
        getElement("closeSupportConversation");

    if (ticketForm) {

        ticketForm.addEventListener(
            "submit",
            submitSupportTicket
        );
    }

    if (replyForm) {

        replyForm.addEventListener(
            "submit",
            submitSupportReply
        );
    }

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadSupportTickets
        );
    }

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function() {

                const conversation =
                    getElement("supportConversation");

                if (conversation) {
                    conversation.hidden = true;
                }

                selectedSupportTicketId = null;

            }
        );
    }

    supportEventsInitialized = true;
}


/* REFRESH SUPPORT SYSTEM */

async function refreshNexusSupport() {

    initializeNexusSupport();

    await loadSupportTickets();
}


/* =========================================
   33. START WEBSITE
========================================= */

initializeTransactionFilters();

initializeWebsite();


/* =========================================
   INITIALIZE WEBSITE
========================================= */

async function initializeWebsite() {

    try {

        const { data, error } =
            await nexusSupabase.auth.getSession();

        if (error) throw error;

        if (data.session?.user) {

            const user = data.session.user;

            await loadDashboard(user);

            await handleNexusPaymentCallback();

        } else {

            const url = new URL(window.location.href);

            const reference =
                url.searchParams.get("reference") ||
                url.searchParams.get("trxref");

            const page = window.location.hash.toLowerCase();

            if (reference && reference.startsWith("NEXUS_")) {

                showLogin();

                showMessage(
                    "Please log in to verify your deposit and update your wallet."
                );

            } else if (page === "#register") {

                showRegistration();

            } else if (page === "#login") {

                showLogin();

            } else if (page === "#forgotpassword") {

                showForgotPassword();

            } else {

                showPublicHome();

            }

        }

    } catch (error) {

        console.error("Website initialization error:", error);

        showPublicHome();

    }
}


/* =========================================
   NEXUS FLOATING CUSTOMER SUPPORT BUTTON
========================================= */

const floatingSupportButton = document.getElementById(
    "floatingSupportButton"
);

if (floatingSupportButton) {

    floatingSupportButton.addEventListener("click", function () {

        const supportSection = document.getElementById("memberSupport");
        const memberDashboard = document.getElementById("memberDashboard");

        if (!supportSection || !memberDashboard) {
            return;
        }

        // Prevent access when the member is not logged in.
        if (
            window.getComputedStyle(memberDashboard).display === "none"
        ) {
            window.location.hash = "login";
            return;
        }

        // Open the support page on mobile.
        if (
            window.innerWidth <= 700 &&
            typeof setMobileDashboardView === "function"
        ) {
            setMobileDashboardView("support");
        } else {
            // Open the support section on desktop.
            supportSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

}

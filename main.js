
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
   NEXUS PAYSTACK PAYMENT CALLBACK
   VERIFY ONLY AFTER LOGIN IS RESTORED
========================================= */

let nexusPaymentCallbackStarted = false;

async function handleNexusPaymentCallback(user) {

    const url = new URL(window.location.href);

    const reference =
        url.searchParams.get("reference") ||
        url.searchParams.get("trxref");

    if (!reference || !reference.startsWith("NEXUS_")) {
        return;
    }

    // Wait until the customer is authenticated.
    if (!user) {
        return;
    }

    // Prevent duplicate verification calls.
    if (nexusPaymentCallbackStarted) {
        return;
    }

    nexusPaymentCallbackStarted = true;

    try {

        console.log("Verifying Nexus deposit:", reference);

        const { data, error } =
            await nexusSupabase.functions.invoke(
                "nexus-verify-deposit",
                {
                    body: { reference }
                }
            );

        if (error) {
            throw error;
        }

        if (!data || data.success !== true) {
            throw new Error(
                data?.message ||
                "Paystack has not confirmed this payment."
            );
        }

        // Remove callback parameters after successful verification.
        url.searchParams.delete("reference");
        url.searchParams.delete("trxref");

        window.history.replaceState(
            {},
            document.title,
            url.pathname + url.search + url.hash
        );

        showMessage(
            data.already_processed
                ? "This deposit has already been credited."
                : "Deposit successful! Your wallet has been credited."
        );

        console.log("Nexus deposit verified:", data);

        // Refresh wallet, transactions and dashboard.
        await loadDashboard(user);

    } catch (error) {

        console.error("Nexus payment verification error:", error);

        nexusPaymentCallbackStarted = false;

        showMessage(
            (error.message ||
            "We could not verify your payment.") +
            "\n\nYour payment reference is: " + reference +
            "\n\nPlease try again or contact support."
        );
    }
}




/* =========================================
   2. GET HTML ELEMENTS
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
   3. HELPER FUNCTIONS
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
   4. HIDE AUTHENTICATION SCREENS
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
   5. HIDE MEMBER DASHBOARD
========================================= */

function hideMemberDashboard() {

    if (memberDashboard) {
        memberDashboard.style.display = "none";
        memberDashboard.classList.remove("mobile-inner-page");
        memberDashboard.style.paddingTop = "";
    }
}


/* =========================================
   6. SHOW PUBLIC HOMEPAGE
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
   7. SHOW LOGIN
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
   8. SHOW REGISTRATION
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
   9. SHOW FORGOT PASSWORD
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
   10. MOBILE DASHBOARD NAVIGATION
   SHOW ONLY THE SELECTED SCREEN
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
        profile: "My Profile"
    };

    const allSections = [
        ".home-dashboard-content",
        "#pendingWithdrawals",
        "#memberTransactions",
        "#memberSavings",
        "#memberProfile"
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

        profile: [
            "#memberProfile"
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

            element.classList.remove("mobile-view-hidden");
            element.style.display = "";

        });

    });

    /* REMOVE SPECIAL SAVINGS DISPLAY CLASS */

    document.querySelectorAll(
        "#memberDashboard .dashboard-content-grid"
    ).forEach(element => {
        element.classList.remove("mobile-savings-visible");
    });

    /* DESKTOP VIEW */

    if (!isMobile) {

        document.body.classList.remove("mobile-inner-page");

        if (dashboard) {
            dashboard.classList.remove("mobile-inner-page");
            dashboard.style.paddingTop = "";
        }

        if (homeHeader) {
            homeHeader.style.display = "none";
        }

        if (screenHeader) {
            screenHeader.style.display = "none";
        }

        if (backButton) {
            backButton.style.display = "none";
        }

        document.querySelectorAll(
            ".member-navigation a[data-screen]"
        ).forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.screen === "home"
            );

        });

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

    /* UPDATE TITLE AND BACK BUTTON */

    if (screenTitle) {
        screenTitle.textContent = screenTitles[screen];
    }

    if (backButton) {
        backButton.style.display =
            screen === "home" ? "none" : "flex";
    }

    /* UPDATE ACTIVE NAVIGATION */

    document.querySelectorAll(
        ".member-navigation a[data-screen]"
    ).forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.screen === screen
        );

    });

    /* SCROLL TO TOP */

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
   11. SHOW MEMBER DASHBOARD
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
   12. NEXUS MEMBER NOTIFICATIONS
========================================= */

let nexusNotificationsInitialized = false;

/* MOVE NOTIFICATION POPUP OUTSIDE DASHBOARD */

document.addEventListener("DOMContentLoaded", function () {

    const notificationMenu = getElement("notificationMenu");

    if (notificationMenu && notificationMenu.parentElement !== document.body) {
        document.body.appendChild(notificationMenu);
    }

});


/* FORMAT NOTIFICATION DATE */

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


/* CLOSE NOTIFICATION MENU */

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


/* LOAD MEMBER NOTIFICATIONS */

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

       /* CONTROL NOTIFICATION RIPPLE */
       
       const notificationButton = getElement("notificationButton");
       
       if (notificationButton) {
          notificationButton.classList.toggle(
             "has-unread",
             unreadCount > 0
          );
       }

        /* UPDATE UNREAD COUNT */

        if (notificationCount) {

            notificationCount.textContent =
                unreadCount > 99 ? "99+" : String(unreadCount);

            notificationCount.hidden = unreadCount === 0;
        }

        /* UPDATE MARK ALL BUTTON */

        if (markAllButton) {
            markAllButton.disabled = unreadCount === 0;
        }

        notificationList.replaceChildren();

        /* EMPTY NOTIFICATION MESSAGE */

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

        /* DISPLAY NOTIFICATIONS */

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

            /* MARK INDIVIDUAL NOTIFICATION AS READ */

            item.addEventListener("click", async function() {

                if (!notification.is_read) {
                    await markNexusNotificationRead(notification.id);
                }

            });

            notificationList.appendChild(item);

        });

    } catch (error) {

        console.error("Notification loading error:", error);

        notificationList.innerHTML = `
            <div class="empty-notifications">
                <span>⚠️</span>
                <p>Unable to load notifications.</p>
            </div>
        `;
    }
}


/* MARK ONE NOTIFICATION AS READ */

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


/* MARK ALL NOTIFICATIONS AS READ */

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


/* INITIALIZE NOTIFICATION BELL */

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

    /* OPEN AND CLOSE MENU */

    notificationButton.addEventListener("click", async function() {

        const isOpening = notificationMenu.hidden;

        notificationMenu.hidden = !isOpening;

        notificationButton.setAttribute(
            "aria-expanded",
            String(isOpening)
        );

        /* REFRESH NOTIFICATIONS WHEN OPENED */

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

    /* MARK ALL AS READ */

    if (markAllButton) {

        markAllButton.addEventListener("click", function() {
            markAllNexusNotificationsRead();
        });

    }

    /* CLOSE MENU WHEN CLICKING OUTSIDE */

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

    /* CLOSE MENU WITH ESCAPE KEY */

    document.addEventListener("keydown", function(event) {

        if (event.key === "Escape") {
            closeNexusNotificationMenu();
        }

    });

    nexusNotificationsInitialized = true;
}


/* =========================================
   13. DISPLAY MEMBER INFORMATION
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

    // Use the saved Supabase status.
    // New accounts default to Active.
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

    // Display Account Status
    const statusElement = getElement("accountStatus");

    if (statusElement) {
        statusElement.textContent = accountStatus;
    }

}


/* =========================================
   14. LOAD MEMBER PROFILE
========================================= */

async function loadMemberProfile(user) {

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

    displayMemberInformation(user, data);

    return data;
}


/* =========================================
   15. LOAD MEMBER WALLET
   DISPLAY BALANCE AFTER PENDING WITHDRAWALS
========================================= */

async function loadMemberWallet(user) {

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

    /* LOAD PENDING AND PROCESSING WITHDRAWALS */

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

    /* CALCULATE TOTAL RESERVED WITHDRAWALS */

    const pendingWithdrawals = (requests || []).reduce(
        (total, request) => {
            return total + (Number(request.amount) || 0);
        },
        0
    );

    /* DISPLAY BALANCE AFTER WITHDRAWAL REQUESTS */

    const currentBalance = Math.max(
        0,
        actualBalance - pendingWithdrawals
    );

    const availableBalance = currentBalance;

    /* DISPLAY WALLET BALANCE */

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

    /* DISPLAY AVAILABLE BALANCE */

    [
        "walletAvailableBalance",
        "availableBalance"
    ].forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent = formatMoney(availableBalance);
        }

    });

    /* DISPLAY PENDING WITHDRAWALS */

    const pendingCard = getElement("walletPendingWithdrawals");

    if (pendingCard) {
        pendingCard.textContent = formatMoney(pendingWithdrawals);
    }

    /* DISPLAY TOTAL DEPOSITS */

    [
        "walletTotalDeposits",
        "totalDeposits"
    ].forEach(id => {

        const element = getElement(id);

        if (element) {
            element.textContent = formatMoney(deposits);
        }

    });

    /* DISPLAY COMPLETED WITHDRAWALS */

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


/* =========================================
   16. LOAD MEMBER DASHBOARD DATA
========================================= */

async function loadDashboard(user) {

    if (!user) return;

    showMemberDashboard();

    try {

        initializeNexusNotifications();

        await loadMemberProfile(user);

        await loadMemberWallet(user);

        await loadMemberTransactions(user);

        await loadPendingWithdrawals(user);

        await loadNexusNotifications(user);

        console.log("Member dashboard loaded successfully.");

    } catch (error) {

        console.error("Dashboard error:", error);

        showMessage(
            error.message ||
            "Unable to load your dashboard information."
        );
    }
}


/* =========================================
   17. REGISTRATION
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
   18. MEMBER LOGIN
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
   19. FORGOT PASSWORD
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
   20. NAVIGATION LINKS
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
        ".member-navigation a[data-screen]"
    );

    if (!dashboardLink) return;

    const selectedView = dashboardLink.dataset.screen;

    if (selectedView) {

        event.preventDefault();

        setMobileDashboardView(selectedView);

    }

});


/* =========================================
   21. BACK TO HOME
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
   22. LOGOUT
========================================= */

async function logoutMember() {

    const { error } = await nexusSupabase.auth.signOut();

    if (error) {

        console.error("Logout error:", error);

        showMessage(error.message);

        return;
    }

    closeNexusNotificationMenu();

    showPublicHome();

    showMessage("You have been logged out.");
}

window.logoutMember = logoutMember;



/* =========================================
   23. AUTHENTICATION STATE
========================================= */

nexusSupabase.auth.onAuthStateChange((event, session) => {

    if (event === "SIGNED_OUT") {

        closeNexusNotificationMenu();

        showPublicHome();

        return;
    }

    if (event === "SIGNED_IN" && session?.user) {

        Promise.resolve().then(async () => {

            await loadDashboard(session.user);

            // Check whether the customer has returned from Paystack.
            await handleNexusPaymentCallback(session.user);

        });

    }
});


/* =========================================
   24. MEMBER TRANSACTION HISTORY
========================================= */

async function loadMemberTransactions(user) {

    const transactionList = getElement("transactionList");

    if (!transactionList || !user) return;

    transactionList.innerHTML = `
        <tr>
            <td colspan="5">Loading transactions...</td>
        </tr>
    `;

    try {

        const { data: deposits, error: depositError } =
            await nexusSupabase
                .from("deposit_transactions")
                .select("id, amount, payment_method, status, reference, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

        if (depositError) throw depositError;

        const { data: withdrawals, error: withdrawalError } =
            await nexusSupabase
                .from("withdrawal_requests")
                .select("id, amount, withdrawal_method, status, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

        if (withdrawalError) throw withdrawalError;

        const transactions = [

            ...(deposits || []).map(item => ({
                ...item,
                type: "deposit"
            })),

            ...(withdrawals || []).map(item => ({
                ...item,
                type: "withdrawal"
            }))
        ];

        transactions.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        transactionList.innerHTML = "";

        if (transactions.length === 0) {

            transactionList.innerHTML = `
                <tr>
                    <td colspan="5">
                        No transactions available.
                    </td>
                </tr>
            `;

            return;
        }

        transactions.forEach(transaction => {

            const row = document.createElement("tr");

            row.dataset.transactionType = transaction.type;

            const transactionCell = document.createElement("td");
            const dateCell = document.createElement("td");
            const amountCell = document.createElement("td");
            const statusCell = document.createElement("td");
            const receiptCell = document.createElement("td");

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

            const statuses = {
                pending: "Pending Approval",
                processing: "Approved - Processing Payment",
                successful: "Successful",
                completed: "Payment Completed",
                failed: "Failed",
                rejected: "Rejected"
            };

            if (transaction.type === "deposit") {

                transactionCell.textContent =
                    "Deposit - " +
                    (
                        depositMethods[transaction.payment_method] ||
                        transaction.payment_method
                    );

                amountCell.textContent =
                    "+ " + formatMoney(transaction.amount);

            } else {

                transactionCell.textContent =
                    "Withdrawal - " +
                    (
                        withdrawalMethods[transaction.withdrawal_method] ||
                        transaction.withdrawal_method
                    );

                amountCell.textContent =
                    "- " + formatMoney(transaction.amount);
            }

            dateCell.textContent = new Date(
                transaction.created_at
            ).toLocaleString("en-GH", {
                dateStyle: "medium",
                timeStyle: "short"
            });

            statusCell.textContent =
                statuses[transaction.status] ||
                transaction.status;

            statusCell.className =
                "transaction-status status-" + transaction.status;

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
            row.appendChild(dateCell);
            row.appendChild(amountCell);
            row.appendChild(statusCell);
            row.appendChild(receiptCell);

            transactionList.appendChild(row);
        });

        const activeFilter = document.querySelector(
            "#transactionFilters button.active"
        );

        if (activeFilter) {
            activeFilter.click();
        }

    } catch (error) {

        console.error("Transaction loading error:", error);

        transactionList.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load transactions. Please refresh.
                </td>
            </tr>
        `;
    }
}


/* =========================================
   25. LOAD PENDING WITHDRAWALS
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

        /* CALCULATE TOTAL RESERVED */

        const reservedTotal = requests.reduce(
            (total, request) => {
                return total + (Number(request.amount) || 0);
            },
            0
        );

        /* UPDATE PENDING WITHDRAWAL DISPLAYS */

        if (totalDisplay) {
            totalDisplay.textContent = formatMoney(reservedTotal);
        }

        if (pendingCard) {
            pendingCard.textContent = formatMoney(reservedTotal);
        }

        if (!list) return;

        /* NO PENDING WITHDRAWALS */

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
   26. MEMBER DEPOSIT PROCESSING
========================================= */

const depositForm = getElement("depositForm");

if (depositForm) {

    depositForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const amount = Number(
            getElement("depositAmount")?.value
        );

        const selectedMethod =
            getElement("depositMethod")?.value;

        const phone =
            getElement("depositPhone")?.value.trim();

        const methodMap = {
            mtn_momo: "mtn",
            telecel_cash: "telecel",
            at_money: "at"
        };

        const method = methodMap[selectedMethod];

        if (
            !Number.isFinite(amount) ||
            amount < 1 ||
            amount > 100000
        ) {

            showMessage(
                "Enter a deposit amount between GHS 1 and GHS 100,000."
            );

            return;
        }

        if (!method) {

            showMessage("Please select a valid deposit method.");

            return;
        }

        if (!/^0\d{9}$/.test(phone)) {

            showMessage(
                "Enter a valid 10-digit Ghana mobile money number."
            );

            return;
        }

        const submitButton = depositForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Connecting to Paystack...";
        }

        try {

            const { data: authData, error: authError } =
                await nexusSupabase.auth.getUser();

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const { data, error } =
                await nexusSupabase.functions.invoke(
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
                    "Unable to initialize your deposit."
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
                "Deposit initialized:",
                data.reference
            );

            window.location.assign(data.authorization_url);

        } catch (error) {

            console.error("Deposit error:", error);

            showMessage(
                error.message ||
                "Unable to process your deposit. Please try again."
            );

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Continue to Deposit";
            }
        }
    });
}


/* =========================================
   27. MEMBER WITHDRAWAL REQUEST
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

        const paymentDetails =
            getElement("withdrawPhone")?.value.trim();

        const note =
            getElement("withdrawNote")?.value.trim() || null;

        if (!Number.isFinite(amount) || amount <= 0) {
            showMessage("Please enter a valid withdrawal amount.");
            return;
        }

        if (!method) {
            showMessage("Please select a withdrawal method.");
            return;
        }

        if (!paymentDetails || paymentDetails.length < 5) {
            showMessage("Please enter valid payment details.");
            return;
        }

        const submitButton = withdrawalForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting Request...";
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
                "Status: Pending\n" +
                "Request ID: " + data.request_id + "\n\n" +
                "Your money is reserved while the request awaits review. It is not yet paid out."
            );

            console.log(
                "Withdrawal request submitted:",
                data
            );

        } catch (error) {

            console.error("Withdrawal request error:", error);

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
   28. MEMBER TRANSACTION FILTERS
========================================= */

function initializeTransactionFilters() {

    const filterContainer = getElement("transactionFilters");
    const transactionList = getElement("transactionList");

    if (!filterContainer || !transactionList) {
        return;
    }

    filterContainer.addEventListener("click", function(event) {

        const button = event.target.closest("button[data-filter]");

        if (!button) return;

        const selectedFilter = button.dataset.filter;

        filterContainer.querySelectorAll("button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const rows = transactionList.querySelectorAll(
            "tr[data-transaction-type]"
        );

        let visibleCount = 0;

        rows.forEach(row => {

            const shouldShow =
                selectedFilter === "all" ||
                selectedFilter === row.dataset.transactionType;

            row.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        let emptyRow = getElement("noFilteredTransactions");

        if (!visibleCount) {

            if (!emptyRow) {

                emptyRow = document.createElement("tr");

                emptyRow.id = "noFilteredTransactions";

                const cell = document.createElement("td");

                cell.colSpan = 5;

                cell.textContent =
                    "No matching transactions available.";

                emptyRow.appendChild(cell);

                transactionList.appendChild(emptyRow);
            }

            emptyRow.hidden = false;

        } else if (emptyRow) {

            emptyRow.hidden = true;
        }
    });
}


/* =========================================
   29. PROFESSIONAL TRANSACTION RECEIPT
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
   30. RECEIPT TEXT SECURITY
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
   31. START WEBSITE
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

            // Verify a Paystack payment after restoring the session.
            await handleNexusPaymentCallback(user);

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

            } else if (
                page === "#forgotpassword"
            ) {

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



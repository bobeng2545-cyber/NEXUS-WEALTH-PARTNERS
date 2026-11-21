
/* =========================================================
   NEXUS WEALTH PARTNERS
   TELLER PORTAL
   COMPLETE TELLER.JS
   ========================================================= */


/* =========================================================
   1. SUPABASE CONNECTION
========================================================= */

const SUPABASE_URL =
    "https://lzvtgxittsdhgjnfzdpk.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_191rkqJFaFYGbZxZMAzFPQ_DyMa5wi0";

if (!window.supabase) {
    throw new Error("Supabase library was not loaded.");
}

const tellerSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

window.tellerSupabase = tellerSupabase;


/* =========================================================
   2. ELEMENT REFERENCES
========================================================= */

// LOGIN AND DASHBOARD

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const logoutButton = document.getElementById("logoutButton");
const connectionStatus = document.getElementById("connectionStatus");

const tellerName = document.getElementById("tellerName");
const tellerCode = document.getElementById("tellerCode");
const tellerStatus = document.getElementById("tellerStatus");


// LIVE DEPOSIT MEMBER SEARCH

const memberSearchForm = document.getElementById("memberSearchForm");
const memberSearchInput = document.getElementById("memberSearchInput");
const searchMemberButton = document.getElementById("searchMemberButton");
const memberSearchMessage = document.getElementById("memberSearchMessage");
const memberResults = document.getElementById("memberResults");

const selectedMemberCard = document.getElementById("selectedMemberCard");
const selectedMemberName = document.getElementById("selectedMemberName");
const selectedMemberId = document.getElementById("selectedMemberId");
const selectedMemberPhone = document.getElementById("selectedMemberPhone");
const selectedMemberStatus = document.getElementById("selectedMemberStatus");

const changeMemberButton = document.getElementById("changeMemberButton");


// LIVE DEPOSIT FORM

const depositForm = document.getElementById("depositForm");
const depositAmount = document.getElementById("depositAmount");
const depositMethod = document.getElementById("depositMethod");

const paymentPhoneGroup = document.getElementById("paymentPhoneGroup");
const paymentPhone = document.getElementById("paymentPhone");

const paymentNetworkGroup =
    document.getElementById("paymentNetworkGroup");

const paymentNetwork =
    document.getElementById("paymentNetwork");

const cashDepositNotice =
    document.getElementById("cashDepositNotice");

const paystackDepositNotice =
    document.getElementById("paystackDepositNotice");

const recordDepositButton = document.getElementById("recordDepositButton");
const depositMessage = document.getElementById("depositMessage");

const depositReceipt = document.getElementById("depositReceipt");
const receiptMessage = document.getElementById("receiptMessage");
const receiptReference = document.getElementById("receiptReference");
const receiptAmount = document.getElementById("receiptAmount");
const newDepositButton = document.getElementById("newDepositButton");


// LIVE DEPOSIT HISTORY

const historyTableBody = document.getElementById("historyTableBody");
const historyMessage = document.getElementById("historyMessage");
const refreshHistoryButton = document.getElementById("refreshHistoryButton");


// TELLER PROFILE

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileCode = document.getElementById("profileCode");
const profileStatus = document.getElementById("profileStatus");


// TEST WITHDRAWAL MEMBER SEARCH

const testMemberSearchForm =
    document.getElementById("testMemberSearchForm");

const testMemberSearchInput =
    document.getElementById("testMemberSearchInput");

const testSearchMemberButton =
    document.getElementById("testSearchMemberButton");

const testMemberSearchMessage =
    document.getElementById("testMemberSearchMessage");

const testMemberResults =
    document.getElementById("testMemberResults");


// SELECTED TEST WITHDRAWAL MEMBER

const selectedTestMemberCard =
    document.getElementById("selectedTestMemberCard");

const testMemberName =
    document.getElementById("testMemberName");

const testMemberId =
    document.getElementById("testMemberId");

const testMemberPhone =
    document.getElementById("testMemberPhone");

const testMemberStatus =
    document.getElementById("testMemberStatus");

const changeTestMemberButton =
    document.getElementById("changeTestMemberButton");


// TEST WITHDRAWAL FORM

const testWithdrawalForm =
    document.getElementById("testWithdrawalForm");

const testWithdrawalAmount =
    document.getElementById("testWithdrawalAmount");

const testWithdrawalMethod =
    document.getElementById("testWithdrawalMethod");

const testPaymentDetails =
    document.getElementById("testPaymentDetails");

const recordTestWithdrawalButton =
    document.getElementById("recordTestWithdrawalButton");

const testWithdrawalMessage =
    document.getElementById("testWithdrawalMessage");


// TEST WITHDRAWAL RECEIPT

const testWithdrawalReceipt =
    document.getElementById("testWithdrawalReceipt");

const testReceiptMessage =
    document.getElementById("testReceiptMessage");

const testReceiptReference =
    document.getElementById("testReceiptReference");

const testReceiptAmount =
    document.getElementById("testReceiptAmount");

const newTestWithdrawalButton =
    document.getElementById("newTestWithdrawalButton");


// TEST WITHDRAWAL HISTORY

const refreshTestWithdrawalHistoryButton =
    document.getElementById("refreshTestWithdrawalHistoryButton");

const testWithdrawalHistoryMessage =
    document.getElementById("testWithdrawalHistoryMessage");

const testWithdrawalHistoryBody =
    document.getElementById("testWithdrawalHistoryBody");


// CUSTOMER SUPPORT

const tellerSupportMessage =
    document.getElementById("tellerSupportMessage");

const refreshSupportTicketsButton =
    document.getElementById("refreshSupportTicketsButton");

const supportTicketSearch =
    document.getElementById("supportTicketSearch");

const tellerSupportTicketList =
    document.getElementById("tellerSupportTicketList");

const tellerSupportConversation =
    document.getElementById("tellerSupportConversation");

const tellerSupportSubject =
    document.getElementById("tellerSupportSubject");

const tellerSupportCustomer =
    document.getElementById("tellerSupportCustomer");

const tellerSupportCategory =
    document.getElementById("tellerSupportCategory");

const tellerSupportMemberId =
    document.getElementById("tellerSupportMemberId");

const tellerSupportStatus =
    document.getElementById("tellerSupportStatus");

const tellerSupportDate =
    document.getElementById("tellerSupportDate");

const tellerSupportStatusSelect =
    document.getElementById("tellerSupportStatusSelect");

const updateTellerSupportStatusButton =
    document.getElementById("updateTellerSupportStatusButton");

const tellerSupportMessageList =
    document.getElementById("tellerSupportMessageList");

const tellerSupportReplyForm =
    document.getElementById("tellerSupportReplyForm");

const tellerSupportReply =
    document.getElementById("tellerSupportReply");

const tellerSupportReplyButton =
    document.getElementById("tellerSupportReplyButton");

const closeTellerSupportConversation =
    document.getElementById("closeTellerSupportConversation");

const tellerSupportClosedNotice =
    document.getElementById("tellerSupportClosedNotice");


// TELLER MEMBER REGISTRATION

const tellerMemberRegistrationForm =
    document.getElementById("tellerMemberRegistrationForm");

const tellerNewMemberName =
    document.getElementById("tellerNewMemberName");

const tellerNewMemberEmail =
    document.getElementById("tellerNewMemberEmail");

const tellerNewMemberPhone =
    document.getElementById("tellerNewMemberPhone");

const registerTellerMemberButton =
    document.getElementById("registerTellerMemberButton");

const tellerMemberRegistrationMessage =
    document.getElementById("tellerMemberRegistrationMessage");


// MY REGISTERED MEMBERS

const refreshMyRegisteredMembersButton =
    document.getElementById("refreshMyRegisteredMembersButton");

const myRegisteredMembersMessage =
    document.getElementById("myRegisteredMembersMessage");

const myRegisteredMembersTableBody =
    document.getElementById("myRegisteredMembersTableBody");


/* =========================================================
   3. APPLICATION STATE
========================================================= */

let currentTeller = null;
let currentUser = null;

let searchedMembers = [];
let selectedMember = null;
let depositInProgress = false;

let testSearchedMembers = [];
let selectedTestMember = null;
let testWithdrawalInProgress = false;

let tellerSupportTickets = [];
let currentSupportTicket = null;

let supportReplyInProgress = false;
let supportStatusInProgress = false;

let memberRegistrationInProgress = false;
let registeredMembersLoadInProgress = false;

let tellerStatusInterval = null;
let tellerStatusChannel = null;
let tellerStatusCheckInProgress = false;
let tellerAccessLocked = false;
let tellerInitializationInProgress = false;


/* =========================================================
   4. GENERAL HELPERS
========================================================= */

function escapeHTML(value) {

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


function showMessage(element, message, type = "info") {

    if (!element) return;

    element.textContent = message;
    element.className = `message ${type}`;

}


function hideMessage(element) {

    if (!element) return;

    element.textContent = "";
    element.className = "message hidden";

}


function formatMoney(amount) {

    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2
    }).format(Number(amount || 0));

}


function formatDate(dateValue) {

    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-GH", {
        dateStyle: "medium",
        timeStyle: "short"
    });

}


function setConnectionStatus(message, state = "") {

    if (!connectionStatus) return;

    connectionStatus.textContent = message;
    connectionStatus.className = `connection-status ${state}`;

}


function setButtonLoading(button, loading, normalText) {

    if (!button) return;

    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : normalText;

}


function isActiveTellerSession() {

    return Boolean(
        currentTeller &&
        currentUser &&
        !tellerAccessLocked &&
        String(currentTeller.status || "").toLowerCase() === "active"
    );

}


function getErrorMessage(error, fallback) {

    return error?.message ||
        error?.error_description ||
        fallback;

}


/* =========================================================
   4.1 TELLER SUSPENSION MONITORING
========================================================= */

function stopTellerStatusMonitoring() {

    if (tellerStatusInterval) {

        clearInterval(tellerStatusInterval);

        tellerStatusInterval = null;
    }

    if (tellerStatusChannel) {

        tellerSupabase.removeChannel(tellerStatusChannel);

        tellerStatusChannel = null;
    }

    tellerStatusCheckInProgress = false;

}


async function lockSuspendedTeller(message) {

    if (tellerAccessLocked) return;

    tellerAccessLocked = true;

    stopTellerStatusMonitoring();

    showLogin();

    setConnectionStatus(
        "Teller access suspended",
        "offline"
    );

    showMessage(
        loginMessage,
        message ||
        "Your teller account is no longer active. Contact the administrator.",
        "error"
    );

    const { error } = await tellerSupabase.auth.signOut({
        scope: "local"
    });

    if (error) {
        console.error("Suspended teller sign-out error:", error);
    }

}


async function verifyTellerActive() {

    if (
        tellerStatusCheckInProgress ||
        !currentTeller ||
        !currentUser ||
        tellerAccessLocked
    ) {
        return;
    }

    tellerStatusCheckInProgress = true;

    const checkedUserId = currentUser.id;

    try {

        const { data, error } = await tellerSupabase
            .from("nexus_tellers")
            .select("user_id,status")
            .eq("user_id", checkedUserId)
            .maybeSingle();

        if (error) throw error;

        if (!currentUser || currentUser.id !== checkedUserId) {
            return;
        }

        if (
            !data ||
            String(data.status || "").toLowerCase() !== "active"
        ) {

            await lockSuspendedTeller(
                `Your teller account is ${data?.status || "unavailable"}. Please contact the administrator.`
            );

            return;
        }

        currentTeller.status = data.status;

        if (tellerStatus) {
            tellerStatus.textContent = data.status;
        }

        if (profileStatus) {
            profileStatus.textContent = data.status;
        }

        setConnectionStatus(
            "Secure connection active",
            "online"
        );

    } catch (error) {

        console.error("Teller status verification error:", error);

        setConnectionStatus(
            "Unable to verify account status",
            "offline"
        );

    } finally {

        tellerStatusCheckInProgress = false;

    }

}


function startTellerStatusMonitoring() {

    stopTellerStatusMonitoring();

    if (!currentTeller || !currentUser || tellerAccessLocked) {
        return;
    }

    const userId = currentUser.id;

    verifyTellerActive();

    tellerStatusInterval = setInterval(() => {

        if (
            currentUser &&
            currentUser.id === userId &&
            !tellerAccessLocked
        ) {
            verifyTellerActive();
        }

    }, 10000);

    tellerStatusChannel = tellerSupabase
        .channel(`teller-status-${userId}`)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "nexus_tellers",
                filter: `user_id=eq.${userId}`
            },
            payload => {

                const newStatus = String(
                    payload.new?.status || ""
                ).toLowerCase();

                if (newStatus !== "active") {

                    lockSuspendedTeller(
                        "Your teller account has been suspended or deactivated. Please contact the administrator."
                    );

                }

            }
        )
        .subscribe(status => {

            if (status === "CHANNEL_ERROR") {

                console.warn(
                    "Teller status Realtime connection failed. Polling remains active."
                );

            }

        });

}


document.addEventListener("visibilitychange", () => {

    if (
        !document.hidden &&
        currentUser &&
        !tellerAccessLocked
    ) {
        verifyTellerActive();
    }

});


window.addEventListener("focus", () => {

    if (currentUser && !tellerAccessLocked) {
        verifyTellerActive();
    }

});


/* =========================================================
   4.2 SHOW LOGIN
========================================================= */

function showLogin() {

    stopTellerStatusMonitoring();

    loginSection?.classList.remove("hidden");
    dashboardSection?.classList.add("hidden");
    logoutButton?.classList.add("hidden");

    currentTeller = null;
    currentUser = null;

    selectedMember = null;
    searchedMembers = [];

    selectedMemberCard?.classList.add("hidden");
    memberResults?.classList.add("hidden");

    if (recordDepositButton) {
        recordDepositButton.disabled = true;
    }

    selectedTestMember = null;
    testSearchedMembers = [];

    selectedTestMemberCard?.classList.add("hidden");
    testMemberResults?.classList.add("hidden");

    if (recordTestWithdrawalButton) {
        recordTestWithdrawalButton.disabled = true;
    }

    currentSupportTicket = null;
    tellerSupportTickets = [];

    tellerSupportConversation?.classList.add("hidden");

    if (tellerSupportTicketList) {
        tellerSupportTicketList.innerHTML = `
            <p class="empty-state">
                Sign in to view customer reports.
            </p>
        `;
    }

    if (myRegisteredMembersMessage) {
        hideMessage(myRegisteredMembersMessage);
    }

}


/* =========================================================
   4.3 SHOW DASHBOARD
========================================================= */

function showDashboard() {

    loginSection?.classList.add("hidden");
    dashboardSection?.classList.remove("hidden");
    logoutButton?.classList.remove("hidden");

}


/* =========================================================
   5. TELLER AUTHENTICATION AND VERIFICATION
========================================================= */

async function initializeTeller(user) {

    if (tellerInitializationInProgress) return;

    tellerInitializationInProgress = true;
    tellerAccessLocked = false;

    stopTellerStatusMonitoring();

    try {

        if (!user || !user.id) {
            showLogin();
            return;
        }

        setConnectionStatus("Verifying teller account...");

        const { data, error } = await tellerSupabase
            .from("nexus_tellers")
            .select(`
                user_id,
                teller_code,
                status,
                full_name,
                email,
                phone,
                created_at
            `)
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {

            await tellerSupabase.auth.signOut({
                scope: "local"
            });

            showLogin();

            showMessage(
                loginMessage,
                "This account is not registered as a Nexus teller. Contact the administrator.",
                "error"
            );

            setConnectionStatus("Access denied", "offline");

            return;
        }

        if (
            String(data.status || "").toLowerCase() !== "active"
        ) {

            tellerAccessLocked = true;

            await tellerSupabase.auth.signOut({
                scope: "local"
            });

            showLogin();

            showMessage(
                loginMessage,
                `Your teller account is ${data.status || "inactive"}. Please contact the administrator.`,
                "error"
            );

            setConnectionStatus("Account inactive", "offline");

            return;
        }

        currentTeller = data;
        currentUser = user;

        renderTellerProfile();

        showDashboard();

        setConnectionStatus(
            "Secure connection active",
            "online"
        );

        startTellerStatusMonitoring();

        await loadTellerHistory();

        await initializeTellerSupport();

    } catch (error) {

        console.error("Teller verification error:", error);

        await tellerSupabase.auth.signOut({
            scope: "local"
        });

        showLogin();

        showMessage(
            loginMessage,
            getErrorMessage(error, "Could not verify your teller account."),
            "error"
        );

        setConnectionStatus("Connection error", "offline");

    } finally {

        tellerInitializationInProgress = false;

    }

}


/* =========================================================
   6. LOGIN
========================================================= */

loginForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (tellerInitializationInProgress) return;

    hideMessage(loginMessage);

    const email = loginEmail?.value.trim();
    const password = loginPassword?.value;

    if (!email || !password) {

        showMessage(
            loginMessage,
            "Enter your email address and password.",
            "error"
        );

        return;
    }

    setButtonLoading(loginButton, true, "Sign In");

    try {

        const { data, error } =
            await tellerSupabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        if (!data.user) {
            throw new Error("Login could not be completed.");
        }

        await initializeTeller(data.user);

    } catch (error) {

        console.error("Teller login error:", error);

        showMessage(
            loginMessage,
            getErrorMessage(error, "Login failed. Check your credentials."),
            "error"
        );

    } finally {

        setButtonLoading(loginButton, false, "Sign In");

    }

});


/* =========================================================
   7. LOGOUT
========================================================= */

logoutButton?.addEventListener("click", async function () {

    logoutButton.disabled = true;

    try {

        stopTellerStatusMonitoring();

        const { error } = await tellerSupabase.auth.signOut();

        if (error) throw error;

        showLogin();

        if (loginPassword) {
            loginPassword.value = "";
        }

        hideMessage(loginMessage);

        setConnectionStatus("Signed out");

    } catch (error) {

        console.error("Logout error:", error);

        alert(getErrorMessage(error, "Could not log out."));

    } finally {

        logoutButton.disabled = false;

    }

});


/* =========================================================
   8. TELLER PROFILE
========================================================= */

function renderTellerProfile() {

    if (!currentTeller || !currentUser) return;

    const name =
        currentTeller.full_name ||
        currentUser.email ||
        "Teller";

    const email =
        currentTeller.email ||
        currentUser.email ||
        "—";

    const phone = currentTeller.phone || "—";

    if (tellerName) tellerName.textContent = name;

    const sidebarTellerName =
        document.getElementById("sidebarTellerName");

    if (sidebarTellerName) {
        sidebarTellerName.textContent = name;
    }

    const welcomeTellerName =
        document.getElementById("welcomeTellerName");

    if (welcomeTellerName) {
        welcomeTellerName.textContent = name;
    }

    if (tellerCode) {
        tellerCode.textContent = currentTeller.teller_code || "—";
    }

    if (tellerStatus) {
        tellerStatus.textContent = currentTeller.status || "—";
    }

    if (profileName) profileName.textContent = name;
    if (profileEmail) profileEmail.textContent = email;
    if (profilePhone) profilePhone.textContent = phone;

    if (profileCode) {
        profileCode.textContent = currentTeller.teller_code || "—";
    }

    if (profileStatus) {
        profileStatus.textContent = currentTeller.status || "—";
    }

}


/* =========================================================
   9. DASHBOARD NAVIGATION + MOBILE SIDEBAR
========================================================= */

const tellerMobileMenuButton =
    document.getElementById("tellerMobileMenuButton");

const tellerSidebar =
    document.getElementById("tellerSidebar");

const tellerSidebarOverlay =
    document.getElementById("tellerSidebarOverlay");

const closeTellerMobileMenuButton =
    document.getElementById("closeTellerMobileMenu");


function openTellerMobileMenu() {

    if (!tellerSidebar || !tellerSidebarOverlay) return;

    tellerSidebar.classList.add("mobile-open");
    tellerSidebarOverlay.classList.add("active");

    tellerMobileMenuButton?.setAttribute("aria-expanded", "true");
    tellerMobileMenuButton?.setAttribute("aria-label", "Close teller menu");

    tellerSidebarOverlay.setAttribute("aria-hidden", "false");

    document.body.classList.add("sidebar-open");

}


function closeTellerMobileDrawer() {

    if (!tellerSidebar || !tellerSidebarOverlay) return;

    tellerSidebar.classList.remove("mobile-open");
    tellerSidebarOverlay.classList.remove("active");

    tellerMobileMenuButton?.setAttribute("aria-expanded", "false");
    tellerMobileMenuButton?.setAttribute("aria-label", "Open teller menu");

    tellerSidebarOverlay.setAttribute("aria-hidden", "true");

    document.body.classList.remove("sidebar-open");

}


tellerMobileMenuButton?.addEventListener("click", function () {

    const isOpen =
        tellerSidebar?.classList.contains("mobile-open");

    if (isOpen) {
        closeTellerMobileDrawer();
    } else {
        openTellerMobileMenu();
    }

});


closeTellerMobileMenuButton?.addEventListener(
    "click",
    closeTellerMobileDrawer
);

tellerSidebarOverlay?.addEventListener(
    "click",
    closeTellerMobileDrawer
);


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeTellerMobileDrawer();
    }

});


window.addEventListener("resize", function () {

    if (window.innerWidth > 760) {
        closeTellerMobileDrawer();
    }

});


document.querySelectorAll(".nav-button").forEach(button => {

    button.addEventListener("click", async function () {

        if (!isActiveTellerSession()) return;

        const targetPanel = this.dataset.panel;

        if (!targetPanel) {
            console.error("Navigation button has no data-panel attribute.");
            return;
        }

        const targetElement =
            document.getElementById(targetPanel);

        if (!targetElement) {
            console.error("Dashboard panel not found:", targetPanel);
            return;
        }

        document.querySelectorAll(".nav-button").forEach(item => {
            item.classList.remove("active");
        });

        document.querySelectorAll(".dashboard-panel").forEach(panel => {
            panel.classList.add("hidden");
        });

        this.classList.add("active");
        targetElement.classList.remove("hidden");

        closeTellerMobileDrawer();

        try {

            if (targetPanel === "historyPanel") {
                await loadTellerHistory();
            }

            if (targetPanel === "testWithdrawalPanel") {
                await loadTestWithdrawalHistory();
            }

            if (targetPanel === "supportPanel") {

                currentSupportTicket = null;

                tellerSupportConversation?.classList.add("hidden");

                await loadTellerSupportTickets();
            }

            if (targetPanel === "myRegisteredMembersPanel") {
                await loadMyRegisteredMembers();
            }

        } catch (error) {

            console.error("Dashboard panel loading error:", error);

        }

    });

});


/* =========================================================
   10. LIVE DEPOSIT MEMBER SEARCH
========================================================= */

memberSearchForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(memberSearchMessage);

    if (!isActiveTellerSession()) return;

    memberResults?.classList.add("hidden");
    selectedMemberCard?.classList.add("hidden");

    selectedMember = null;
    searchedMembers = [];

    if (recordDepositButton) {
        recordDepositButton.disabled = true;
    }

    const searchValue = memberSearchInput?.value.trim();

    if (!searchValue) {

        showMessage(
            memberSearchMessage,
            "Enter a member ID or phone number.",
            "error"
        );

        return;
    }

    setButtonLoading(searchMemberButton, true, "Search");

    try {

        const { data, error } = await tellerSupabase.rpc(
            "lookup_teller_member",
            { p_search: searchValue }
        );

        if (error) throw error;

        searchedMembers = Array.isArray(data) ? data : [];

        if (searchedMembers.length === 0) {

            showMessage(
                memberSearchMessage,
                "No matching member was found. Check the member ID or phone number.",
                "error"
            );

            return;
        }

        renderMemberResults();

    } catch (error) {

        console.error("Member search error:", error);

        showMessage(
            memberSearchMessage,
            getErrorMessage(error, "Member search failed."),
            "error"
        );

    } finally {

        setButtonLoading(searchMemberButton, false, "Search");

    }

});


function renderMemberResults() {

    if (!memberResults) return;

    memberResults.innerHTML = "";

    searchedMembers.forEach((member, index) => {

        const item = document.createElement("div");

        item.className = "member-result";

        item.innerHTML = `
            <div>
                <strong>${escapeHTML(member.full_name)}</strong>
                <span>
                    ID: ${escapeHTML(member.member_id)}
                    · Phone: ${escapeHTML(member.phone || "Not provided")}
                </span>
            </div>

            <button
                type="button"
                class="primary-button select-member-button"
                data-index="${index}"
            >
                Select Member
            </button>
        `;

        memberResults.appendChild(item);

    });

    memberResults.classList.remove("hidden");

    memberResults.querySelectorAll(".select-member-button").forEach(button => {

        button.addEventListener("click", function () {

            if (!isActiveTellerSession()) return;

            const index = Number(this.dataset.index);
            const member = searchedMembers[index];

            if (member) selectMember(member);

        });

    });

}


function selectMember(member) {

    if (!isActiveTellerSession()) return;

    selectedMember = member;

    if (selectedMemberName) {
        selectedMemberName.textContent = member.full_name || "—";
    }

    if (selectedMemberId) {
        selectedMemberId.textContent = member.member_id || "—";
    }

    if (selectedMemberPhone) {
        selectedMemberPhone.textContent = member.phone || "Not provided";
    }

    if (selectedMemberStatus) {
        selectedMemberStatus.textContent = member.status || "Not specified";
    }

    selectedMemberCard?.classList.remove("hidden");
    memberResults?.classList.add("hidden");

    if (recordDepositButton) {
        recordDepositButton.disabled = false;
    }

    hideMessage(depositMessage);

    depositReceipt?.classList.add("hidden");

}


changeMemberButton?.addEventListener("click", function () {

    if (!isActiveTellerSession()) return;

    selectedMember = null;

    selectedMemberCard?.classList.add("hidden");

    if (recordDepositButton) {
        recordDepositButton.disabled = true;
    }

    memberSearchInput?.focus();

});


/* =========================================================
   11. DEPOSIT PAYMENT METHOD FIELDS
========================================================= */

function updateDepositPaymentFields() {

    const method = depositMethod?.value || "";

    const isMobileMoney = method === "mobile_money";
    const isCash = method === "cash";

    paymentPhoneGroup?.classList.toggle("hidden", !isMobileMoney);
    paymentNetworkGroup?.classList.toggle("hidden", !isMobileMoney);

    cashDepositNotice?.classList.toggle("hidden", !isCash);
    paystackDepositNotice?.classList.toggle("hidden", !isMobileMoney);

    if (paymentPhone) {
        paymentPhone.required = isMobileMoney;

        if (!isMobileMoney) {
            paymentPhone.value = "";
        }
    }

    if (paymentNetwork) {
        paymentNetwork.required = isMobileMoney;

        if (!isMobileMoney) {
            paymentNetwork.value = "";
        }
    }

}


depositMethod?.addEventListener(
    "change",
    updateDepositPaymentFields
);

updateDepositPaymentFields();


/* =========================================================
   12. RECORD LIVE TELLER DEPOSIT
========================================================= */

depositForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(depositMessage);

    if (!isActiveTellerSession()) {

        showMessage(
            depositMessage,
            "Your teller session is unavailable. Please sign in again.",
            "error"
        );

        return;
    }

    if (!selectedMember) {

        showMessage(
            depositMessage,
            "Search for and select a member first.",
            "error"
        );

        return;
    }

    if (depositInProgress) return;

    const amountText = depositAmount?.value.trim() || "";
    const amount = Number(amountText);

    const method = depositMethod?.value || "";
    const phone = paymentPhone?.value.trim() || "";
    const network = paymentNetwork?.value || "";

    if (
        !amountText ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !/^\d+(\.\d{1,2})?$/.test(amountText)
    ) {

        showMessage(
            depositMessage,
            "Enter a valid deposit amount greater than zero, using no more than two decimal places.",
            "error"
        );

        return;
    }

    if (!["cash", "mobile_money", "bank_transfer"].includes(method)) {

        showMessage(
            depositMessage,
            "Select a valid payment method.",
            "error"
        );

        return;
    }

    /*
       Bank transfer is blocked until a verified bank-transfer
       process is implemented. Never credit an unverified transfer.
    */

    if (method === "bank_transfer") {

        showMessage(
            depositMessage,
            "Bank transfer deposits are not enabled yet. Use Cash or Mobile Money.",
            "error"
        );

        return;
    }

    if (method === "mobile_money") {

        if (!["mtn", "telecel", "at"].includes(network)) {

            showMessage(
                depositMessage,
                "Select MTN MoMo, Telecel Cash or AT Money.",
                "error"
            );

            return;
        }

        if (!phone) {

            showMessage(
                depositMessage,
                "Enter the Mobile Money phone number.",
                "error"
            );

            return;
        }

    }

    const memberName = selectedMember.full_name;
    const memberId = selectedMember.member_id;

    const paymentLabel = method === "cash"
        ? "Cash"
        : `${network.toUpperCase()} Mobile Money`;

    const confirmationMessage = method === "cash"

        ? (
            "CONFIRM CASH DEPOSIT\n\n" +
            `Member: ${memberName}\n` +
            `Member ID: ${memberId}\n` +
            `Amount: ${formatMoney(amount)}\n\n` +
            "Confirm only if you have physically received the cash.\n\n" +
            "The member's wallet will be credited after confirmation."
        )

        : (
            "CONFIRM MOBILE MONEY PAYMENT\n\n" +
            `Member: ${memberName}\n` +
            `Member ID: ${memberId}\n` +
            `Amount: ${formatMoney(amount)}\n` +
            `Network: ${paymentLabel}\n` +
            `Phone: ${phone}\n\n` +
            "The member's wallet will NOT be credited at this stage.\n" +
            "The payment must first be verified by the payment server.\n\n" +
            "Continue to Paystack?"
        );

    if (!window.confirm(confirmationMessage)) return;

    depositInProgress = true;

    setButtonLoading(
        recordDepositButton,
        true,
        "Record Deposit"
    );

    try {

        // Check the teller's status again before processing.
        await verifyTellerActive();

        if (!isActiveTellerSession()) {
            throw new Error("Your teller account is no longer active.");
        }

        /* -------------------------------------------------
           CASH DEPOSIT
        ------------------------------------------------- */

        if (method === "cash") {

            const { data, error } = await tellerSupabase.rpc(
                "record_teller_deposit",
                {
                    p_member_id: memberId,
                    p_amount: amount,
                    p_payment_method: "cash",
                    p_payment_phone: null
                }
            );

            if (error) throw error;

            if (!data || data.success !== true) {

                throw new Error(
                    data?.message || "The cash deposit could not be recorded."
                );

            }

            depositForm.reset();

            updateDepositPaymentFields();

            depositReceipt?.classList.remove("hidden");

            if (receiptMessage) {
                receiptMessage.textContent =
                    `${data.member_name || memberName}'s wallet has been credited successfully.`;
            }

            if (receiptReference) {
                receiptReference.textContent = data.reference || "—";
            }

            if (receiptAmount) {
                receiptAmount.textContent = formatMoney(data.amount ?? amount);
            }

            showMessage(
                depositMessage,
                "Cash deposit completed successfully.",
                "success"
            );

            await loadTellerHistory();

            return;
        }


        /* -------------------------------------------------
           MOBILE MONEY - PAYSTACK INITIALIZATION
        ------------------------------------------------- */

        if (method === "mobile_money") {

            const { data, error } =
                await tellerSupabase.functions.invoke(
                    "nexus-teller-deposit",
                    {
                        body: {
                            member_id: memberId,
                            amount: amount,
                            payment_method: network,
                            payment_phone: phone
                        }
                    }
                );

            if (error) {

                throw new Error(
                    error.message ||
                    "Could not initialize the Mobile Money payment."
                );

            }

            if (
                !data ||
                data.success !== true ||
                !data.authorization_url
            ) {

                throw new Error(
                    data?.message ||
                    "The payment server did not return a valid Paystack checkout link."
                );

            }

            /*
               This is only payment initialization.

               Do not display a successful deposit receipt.
               Do not call record_teller_deposit.
               Do not credit the member's wallet here.

               The backend must verify the Paystack transaction
               and credit the wallet only after verification.
            */

            showMessage(
                depositMessage,
                "Payment initialized. Redirecting to secure Paystack checkout. The member's wallet has not yet been credited.",
                "info"
            );

            if (recordDepositButton) {
                recordDepositButton.disabled = true;
                recordDepositButton.textContent = "Redirecting...";
            }

            window.location.assign(data.authorization_url);

            return;
        }

    } catch (error) {

        console.error("Deposit recording error:", error);

        showMessage(
            depositMessage,
            getErrorMessage(error, "Deposit processing failed."),
            "error"
        );

    } finally {

        depositInProgress = false;

        if (recordDepositButton) {

            recordDepositButton.disabled = !selectedMember;

            recordDepositButton.textContent = "Record Deposit";

        }

    }

});


/* =========================================================
   13. START ANOTHER LIVE DEPOSIT
========================================================= */

newDepositButton?.addEventListener("click", function () {

    if (!isActiveTellerSession()) return;

    selectedMember = null;
    searchedMembers = [];

    if (memberSearchInput) {
        memberSearchInput.value = "";
    }

    depositForm?.reset();

    updateDepositPaymentFields();

    selectedMemberCard?.classList.add("hidden");
    memberResults?.classList.add("hidden");
    depositReceipt?.classList.add("hidden");

    if (recordDepositButton) {
        recordDepositButton.disabled = true;
    }

    hideMessage(depositMessage);
    hideMessage(memberSearchMessage);

    memberSearchInput?.focus();

});


/* =========================================================
   14. LOAD LIVE TELLER DEPOSIT HISTORY
========================================================= */

async function loadTellerHistory() {

    if (!isActiveTellerSession()) return;

    if (!historyTableBody) return;

    historyTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="empty-state">
                Loading transactions...
            </td>
        </tr>
    `;

    hideMessage(historyMessage);

    try {

        const { data, error } = await tellerSupabase.rpc(
            "list_my_teller_deposits",
            { p_limit: 50 }
        );

        if (error) throw error;

        const transactions = Array.isArray(data) ? data : [];

        if (transactions.length === 0) {

            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        You have not recorded any deposits yet.
                    </td>
                </tr>
            `;

            return;
        }

        historyTableBody.innerHTML = transactions.map(transaction => {

            const method = String(transaction.payment_method || "")
                .replace(/^teller_/, "")
                .replaceAll("_", " ");

            return `
                <tr>
                    <td>${escapeHTML(formatDate(transaction.created_at))}</td>

                    <td>
                        <strong>${escapeHTML(transaction.full_name)}</strong><br>
                        <small>${escapeHTML(transaction.member_id)}</small>
                    </td>

                    <td>${escapeHTML(transaction.reference)}</td>

                    <td>${escapeHTML(method)}</td>

                    <td>
                        <strong>${escapeHTML(formatMoney(transaction.amount))}</strong>
                    </td>
                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("Teller history error:", error);

        historyTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    Could not load transaction history.
                </td>
            </tr>
        `;

        showMessage(
            historyMessage,
            getErrorMessage(error, "Unable to load transaction history."),
            "error"
        );

    }

}


refreshHistoryButton?.addEventListener(
    "click",
    loadTellerHistory
);


/* =========================================================
   15. TEST WITHDRAWAL MEMBER SEARCH
========================================================= */

testMemberSearchForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(testMemberSearchMessage);

    if (!isActiveTellerSession()) return;

    testMemberResults?.classList.add("hidden");
    selectedTestMemberCard?.classList.add("hidden");

    selectedTestMember = null;
    testSearchedMembers = [];

    if (recordTestWithdrawalButton) {
        recordTestWithdrawalButton.disabled = true;
    }

    testWithdrawalReceipt?.classList.add("hidden");

    const searchValue = testMemberSearchInput?.value.trim();

    if (!searchValue) {

        showMessage(
            testMemberSearchMessage,
            "Enter a member ID or phone number.",
            "error"
        );

        return;
    }

    setButtonLoading(testSearchMemberButton, true, "Search");

    try {

        const { data, error } = await tellerSupabase.rpc(
            "lookup_teller_member",
            { p_search: searchValue }
        );

        if (error) throw error;

        testSearchedMembers = Array.isArray(data) ? data : [];

        if (testSearchedMembers.length === 0) {

            showMessage(
                testMemberSearchMessage,
                "No matching member was found. Check the member ID or phone number.",
                "error"
            );

            return;
        }

        renderTestMemberResults();

    } catch (error) {

        console.error("Test member search error:", error);

        showMessage(
            testMemberSearchMessage,
            getErrorMessage(error, "Member search failed."),
            "error"
        );

    } finally {

        setButtonLoading(testSearchMemberButton, false, "Search");

    }

});


/* =========================================================
   16. DISPLAY TEST WITHDRAWAL MEMBER RESULTS
========================================================= */

function renderTestMemberResults() {

    if (!testMemberResults) return;

    testMemberResults.innerHTML = "";

    testSearchedMembers.forEach((member, index) => {

        const item = document.createElement("div");

        item.className = "member-result";

        item.innerHTML = `
            <div>
                <strong>${escapeHTML(member.full_name)}</strong>

                <span>
                    ID: ${escapeHTML(member.member_id)}
                    · Phone: ${escapeHTML(member.phone || "Not provided")}
                    · Status: ${escapeHTML(member.status || "Unknown")}
                </span>
            </div>

            <button
                type="button"
                class="primary-button select-test-member-button"
                data-index="${index}"
            >
                Select Member
            </button>
        `;

        testMemberResults.appendChild(item);

    });

    testMemberResults.classList.remove("hidden");

    testMemberResults
        .querySelectorAll(".select-test-member-button")
        .forEach(button => {

            button.addEventListener("click", function () {

                if (!isActiveTellerSession()) return;

                const index = Number(this.dataset.index);
                const member = testSearchedMembers[index];

                if (member) selectTestMember(member);

            });

        });

}


/* =========================================================
   17. SELECT TEST WITHDRAWAL MEMBER
========================================================= */

function selectTestMember(member) {

    if (!isActiveTellerSession()) return;

    selectedTestMember = member;

    if (testMemberName) {
        testMemberName.textContent = member.full_name || "—";
    }

    if (testMemberId) {
        testMemberId.textContent = member.member_id || "—";
    }

    if (testMemberPhone) {
        testMemberPhone.textContent = member.phone || "Not provided";
    }

    if (testMemberStatus) {
        testMemberStatus.textContent = member.status || "Not specified";
    }

    selectedTestMemberCard?.classList.remove("hidden");
    testMemberResults?.classList.add("hidden");

    if (recordTestWithdrawalButton) {
        recordTestWithdrawalButton.disabled = false;
    }

    testWithdrawalReceipt?.classList.add("hidden");

    hideMessage(testWithdrawalMessage);
    hideMessage(testMemberSearchMessage);

}


changeTestMemberButton?.addEventListener("click", function () {

    if (!isActiveTellerSession()) return;

    selectedTestMember = null;

    selectedTestMemberCard?.classList.add("hidden");

    if (recordTestWithdrawalButton) {
        recordTestWithdrawalButton.disabled = true;
    }

    testMemberSearchInput?.focus();

});


/* =========================================================
   18. RECORD TEST WITHDRAWAL SIMULATION
========================================================= */

testWithdrawalForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(testWithdrawalMessage);

    testWithdrawalReceipt?.classList.add("hidden");

    if (!isActiveTellerSession()) {

        showMessage(
            testWithdrawalMessage,
            "Your teller session is unavailable. Please sign in again.",
            "error"
        );

        return;
    }

    if (!selectedTestMember) {

        showMessage(
            testWithdrawalMessage,
            "Search for and select a member first.",
            "error"
        );

        return;
    }

    if (testWithdrawalInProgress) return;

    const amountText = testWithdrawalAmount?.value.trim() || "";
    const amount = Number(amountText);

    const method = testWithdrawalMethod?.value || "";
    const details = testPaymentDetails?.value.trim() || "";

    if (
        !amountText ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !/^\d+(\.\d{1,2})?$/.test(amountText)
    ) {

        showMessage(
            testWithdrawalMessage,
            "Enter a valid amount greater than zero, using no more than two decimal places.",
            "error"
        );

        return;
    }

    const allowedMethods = [
        "mtn_momo",
        "telecel_cash",
        "at_money",
        "bank"
    ];

    if (!allowedMethods.includes(method)) {

        showMessage(
            testWithdrawalMessage,
            "Select a valid test withdrawal method.",
            "error"
        );

        return;
    }

    if (details.length < 5) {

        showMessage(
            testWithdrawalMessage,
            "Enter at least five characters of dummy test payment details.",
            "error"
        );

        return;
    }

    const methodLabel = {
        mtn_momo: "MTN MoMo",
        telecel_cash: "Telecel Cash",
        at_money: "AT Money",
        bank: "Bank"
    }[method];

    const confirmed = window.confirm(

        "TEST WITHDRAWAL SIMULATION ONLY\n\n" +

        `Member: ${selectedTestMember.full_name}\n` +
        `Member ID: ${selectedTestMember.member_id}\n` +
        `Amount: ${formatMoney(amount)}\n` +
        `Method: ${methodLabel}\n\n` +

        "IMPORTANT:\n" +
        "NO MONEY WILL BE TRANSFERRED.\n" +
        "NO WALLET BALANCE WILL BE DEDUCTED.\n" +
        "NO PHYSICAL CASH WILL BE PAID.\n\n" +

        "Do you want to record this test simulation?"
    );

    if (!confirmed) return;

    testWithdrawalInProgress = true;

    setButtonLoading(
        recordTestWithdrawalButton,
        true,
        "Record Test Withdrawal"
    );

    try {

        const { data, error } = await tellerSupabase.rpc(
            "record_teller_test_withdrawal",
            {
                p_member_id: selectedTestMember.member_id,
                p_amount: amount,
                p_withdrawal_method: method,
                p_payment_details: details
            }
        );

        if (error) throw error;

        if (!data || data.success !== true) {

            throw new Error(
                data?.message ||
                "The test withdrawal could not be recorded."
            );

        }

        testWithdrawalReceipt?.classList.remove("hidden");

        if (testReceiptMessage) {
            testReceiptMessage.textContent =
                "TEST SIMULATION RECORDED — NO MONEY WAS TRANSFERRED.";
        }

        if (testReceiptReference) {
            testReceiptReference.textContent =
                data.test_reference || "—";
        }

        if (testReceiptAmount) {
            testReceiptAmount.textContent =
                formatMoney(data.amount);
        }

        showMessage(
            testWithdrawalMessage,
            "Test withdrawal simulation recorded successfully. No real money was moved.",
            "success"
        );

        testWithdrawalForm.reset();

        await loadTestWithdrawalHistory();

    } catch (error) {

        console.error("Test withdrawal recording error:", error);

        showMessage(
            testWithdrawalMessage,
            getErrorMessage(error, "Test withdrawal simulation failed."),
            "error"
        );

    } finally {

        testWithdrawalInProgress = false;

        if (recordTestWithdrawalButton) {

            recordTestWithdrawalButton.disabled =
                !selectedTestMember;

            recordTestWithdrawalButton.textContent =
                "Record Test Withdrawal";

        }

    }

});


/* =========================================================
   19. START ANOTHER TEST WITHDRAWAL
========================================================= */

newTestWithdrawalButton?.addEventListener("click", function () {

    if (!isActiveTellerSession()) return;

    selectedTestMember = null;
    testSearchedMembers = [];

    if (testMemberSearchInput) {
        testMemberSearchInput.value = "";
    }

    testWithdrawalForm?.reset();

    selectedTestMemberCard?.classList.add("hidden");
    testMemberResults?.classList.add("hidden");
    testWithdrawalReceipt?.classList.add("hidden");

    if (recordTestWithdrawalButton) {
        recordTestWithdrawalButton.disabled = true;
    }

    hideMessage(testWithdrawalMessage);
    hideMessage(testMemberSearchMessage);

    testMemberSearchInput?.focus();

});


/* =========================================================
   20. LOAD TEST WITHDRAWAL HISTORY
========================================================= */

async function loadTestWithdrawalHistory() {

    if (!isActiveTellerSession()) return;

    if (!testWithdrawalHistoryBody) return;

    testWithdrawalHistoryBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                Loading test withdrawal records...
            </td>
        </tr>
    `;

    hideMessage(testWithdrawalHistoryMessage);

    try {

        const { data, error } = await tellerSupabase.rpc(
            "list_my_teller_test_withdrawals",
            { p_limit: 50 }
        );

        if (error) throw error;

        const withdrawals = Array.isArray(data) ? data : [];

        if (withdrawals.length === 0) {

            testWithdrawalHistoryBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        You have not recorded any test withdrawals yet.
                    </td>
                </tr>
            `;

            return;
        }

        const methodLabels = {
            mtn_momo: "MTN MoMo",
            telecel_cash: "Telecel Cash",
            at_money: "AT Money",
            bank: "Bank"
        };

        testWithdrawalHistoryBody.innerHTML =
            withdrawals.map(withdrawal => {

                const method =
                    methodLabels[withdrawal.withdrawal_method] ||
                    withdrawal.withdrawal_method ||
                    "—";

                const status =
                    String(withdrawal.status || "simulated").toLowerCase();

                const cancelButton =
                    status === "simulated"
                        ? `
                            <button
                                type="button"
                                class="danger-button cancel-test-withdrawal-button"
                                data-reference="${escapeHTML(withdrawal.test_reference)}"
                            >
                                Cancel
                            </button>
                        `
                        : "—";

                return `
                    <tr>
                        <td>${escapeHTML(formatDate(withdrawal.created_at))}</td>

                        <td>
                            <strong>${escapeHTML(withdrawal.full_name)}</strong>
                            <br>
                            <small>${escapeHTML(withdrawal.member_id)}</small>
                        </td>

                        <td>${escapeHTML(withdrawal.test_reference)}</td>

                        <td>${escapeHTML(method)}</td>

                        <td>
                            <strong>${escapeHTML(formatMoney(withdrawal.amount))}</strong>
                        </td>

                        <td>${escapeHTML(status.toUpperCase())}</td>

                        <td>${cancelButton}</td>
                    </tr>
                `;

            }).join("");

    } catch (error) {

        console.error("Test withdrawal history error:", error);

        testWithdrawalHistoryBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Could not load test withdrawal history.
                </td>
            </tr>
        `;

        showMessage(
            testWithdrawalHistoryMessage,
            getErrorMessage(error, "Unable to load test withdrawal history."),
            "error"
        );

    }

}


/* =========================================================
   20.1 CANCEL TEST WITHDRAWAL
========================================================= */

testWithdrawalHistoryBody?.addEventListener(
    "click",
    async function (event) {

        const button = event.target.closest(
            ".cancel-test-withdrawal-button"
        );

        if (!button) return;

        if (!isActiveTellerSession()) {
            alert("Your teller session is unavailable. Please sign in again.");
            return;
        }

        const reference = button.dataset.reference;

        if (!reference) {
            alert("Test withdrawal reference is missing.");
            return;
        }

        const confirmed = window.confirm(
            "CANCEL TEST WITHDRAWAL?\n\n" +
            `Reference: ${reference}\n\n` +
            "This will change the test transaction status to CANCELLED.\n\n" +
            "No real money will be transferred or refunded.\n\n" +
            "Do you want to continue?"
        );

        if (!confirmed) return;

        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = "Cancelling...";

        try {

            const { data, error } = await tellerSupabase.rpc(
                "cancel_teller_test_withdrawal",
                { p_test_reference: reference }
            );

            if (error) throw error;

            if (!data || data.success !== true) {

                throw new Error(
                    data?.message ||
                    "The test withdrawal could not be cancelled."
                );

            }

            showMessage(
                testWithdrawalHistoryMessage,
                "Test withdrawal cancelled successfully. No real money was affected.",
                "success"
            );

            await loadTestWithdrawalHistory();

        } catch (error) {

            console.error("Test withdrawal cancellation error:", error);

            alert(
                getErrorMessage(error, "Unable to cancel the test withdrawal.")
            );

            button.disabled = false;
            button.textContent = originalText;

        }

    }
);


/* =========================================================
   20.2 REFRESH TEST WITHDRAWAL HISTORY
========================================================= */

refreshTestWithdrawalHistoryButton?.addEventListener(
    "click",
    loadTestWithdrawalHistory
);


/* =========================================================
   21. CUSTOMER SUPPORT HELPERS
========================================================= */

function formatSupportStatus(status) {

    const labels = {
        open: "Open",
        in_progress: "In Progress",
        resolved: "Resolved",
        closed: "Closed"
    };

    return labels[String(status || "").toLowerCase()] || status;

}


function showTellerSupportMessage(message, type = "info") {

    showMessage(tellerSupportMessage, message, type);

}


function updateSupportReplyAvailability() {

    const isClosed =
        String(currentSupportTicket?.status || "").toLowerCase() === "closed";

    tellerSupportReplyForm?.classList.toggle("hidden", isClosed);
    tellerSupportClosedNotice?.classList.toggle("hidden", !isClosed);

    if (tellerSupportReplyButton) {
        tellerSupportReplyButton.disabled =
            isClosed || supportReplyInProgress;
    }

}


/* =========================================================
   22. LOAD ALL CUSTOMER REPORTS
========================================================= */

async function loadTellerSupportTickets() {

    if (!isActiveTellerSession()) return;

    if (!tellerSupportTicketList) return;

    tellerSupportTicketList.innerHTML = `
        <p class="empty-state">
            Loading customer reports...
        </p>
    `;

    hideMessage(tellerSupportMessage);

    try {

        const { data, error } = await tellerSupabase.rpc(
            "nexus_list_support_tickets",
            { p_limit: 100 }
        );

        if (error) throw error;

        tellerSupportTickets = Array.isArray(data) ? data : [];

        renderTellerSupportTickets();

    } catch (error) {

        console.error("Customer support ticket loading error:", error);

        tellerSupportTicketList.innerHTML = `
            <p class="empty-state">
                Could not load customer reports.
            </p>
        `;

        showTellerSupportMessage(
            getErrorMessage(error, "Unable to load customer reports."),
            "error"
        );

    }

}


/* =========================================================
   23. DISPLAY CUSTOMER REPORTS
========================================================= */

function renderTellerSupportTickets() {

    if (!tellerSupportTicketList) return;

    const searchTerm =
        (supportTicketSearch?.value || "").trim().toLowerCase();

    const filteredTickets = tellerSupportTickets.filter(ticket => {

        const searchableText = [
            ticket.customer_name,
            ticket.member_id,
            ticket.subject,
            ticket.category,
            ticket.status
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);

    });

    if (filteredTickets.length === 0) {

        tellerSupportTicketList.innerHTML = `
            <p class="empty-state">
                ${
                    searchTerm
                        ? "No reports match your search."
                        : "There are currently no customer reports."
                }
            </p>
        `;

        return;
    }

    tellerSupportTicketList.innerHTML =
        filteredTickets.map(ticket => {

            const status = String(ticket.status || "open").toLowerCase();

            const isSelected =
                currentSupportTicket &&
                currentSupportTicket.ticket_id === ticket.ticket_id;

            return `
                <div
                    class="support-ticket-item ${isSelected ? "active" : ""}"
                    data-ticket-id="${escapeHTML(ticket.ticket_id)}"
                    role="button"
                    tabindex="0"
                >

                    <div class="support-ticket-heading">

                        <strong>${escapeHTML(ticket.subject)}</strong>

                        <span class="support-status-badge status-${escapeHTML(status)}">
                            ${escapeHTML(formatSupportStatus(status))}
                        </span>

                    </div>

                    <p>
                        ${escapeHTML(ticket.customer_name || "Customer")}
                        · ${escapeHTML(ticket.member_id || "No Member ID")}
                    </p>

                    <p>${escapeHTML(ticket.category)}</p>

                    <small>
                        Last activity:
                        ${escapeHTML(formatDate(ticket.last_message_at))}
                    </small>

                </div>
            `;

        }).join("");

}


/* =========================================================
   24. OPEN A CUSTOMER REPORT
========================================================= */

async function openTellerSupportTicket(ticketId) {

    if (!isActiveTellerSession()) return;

    const ticket = tellerSupportTickets.find(
        item => String(item.ticket_id) === String(ticketId)
    );

    if (!ticket) {

        showTellerSupportMessage(
            "The selected customer report could not be found.",
            "error"
        );

        return;
    }

    currentSupportTicket = ticket;

    if (tellerSupportSubject) {
        tellerSupportSubject.textContent = ticket.subject || "Customer Report";
    }

    if (tellerSupportCustomer) {
        tellerSupportCustomer.textContent = ticket.customer_name || "Customer";
    }

    if (tellerSupportCategory) {
        tellerSupportCategory.textContent = ticket.category || "—";
    }

    if (tellerSupportMemberId) {
        tellerSupportMemberId.textContent = ticket.member_id || "—";
    }

    if (tellerSupportStatus) {
        tellerSupportStatus.textContent = formatSupportStatus(ticket.status);
    }

    if (tellerSupportDate) {
        tellerSupportDate.textContent = formatDate(ticket.created_at);
    }

    if (tellerSupportStatusSelect) {
        tellerSupportStatusSelect.value = ticket.status || "open";
    }

    tellerSupportConversation?.classList.remove("hidden");

    updateSupportReplyAvailability();

    renderTellerSupportTickets();

    await loadTellerSupportMessages(ticket.ticket_id);

    tellerSupportConversation?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   25. LOAD CONVERSATION MESSAGES
========================================================= */

async function loadTellerSupportMessages(ticketId) {

    if (
        !ticketId ||
        !isActiveTellerSession() ||
        !tellerSupportMessageList
    ) {
        return;
    }

    tellerSupportMessageList.innerHTML = `
        <p class="empty-state">
            Loading conversation...
        </p>
    `;

    try {

        const { data, error } = await tellerSupabase.rpc(
            "nexus_list_support_messages",
            { p_ticket_id: ticketId }
        );

        if (error) throw error;

        const messages = Array.isArray(data) ? data : [];

        if (messages.length === 0) {

            tellerSupportMessageList.innerHTML = `
                <p class="empty-state">
                    No messages found for this report.
                </p>
            `;

            return;
        }

        tellerSupportMessageList.innerHTML =
            messages.map(message => {

                const role = String(message.sender_role || "customer")
                    .toLowerCase();

                const senderLabel = {
                    customer: "Customer",
                    teller: "Teller",
                    admin: "Administrator"
                }[role] || "User";

                const isStaff =
                    role === "teller" || role === "admin";

                return `
                    <div class="support-message ${isStaff ? "staff-message" : "customer-message"}">

                        <div class="support-message-header">

                            <strong>
                                ${escapeHTML(message.sender_name || senderLabel)}
                            </strong>

                            <span>${escapeHTML(senderLabel)}</span>

                        </div>

                        <p style="white-space: pre-wrap;">${escapeHTML(message.message)}</p>

                        <small>${escapeHTML(formatDate(message.created_at))}</small>

                    </div>
                `;

            }).join("");

        tellerSupportMessageList.scrollTop =
            tellerSupportMessageList.scrollHeight;

    } catch (error) {

        console.error("Customer support messages error:", error);

        tellerSupportMessageList.innerHTML = `
            <p class="empty-state">
                Could not load this conversation.
            </p>
        `;

        showTellerSupportMessage(
            getErrorMessage(error, "Unable to load conversation messages."),
            "error"
        );

    }

}


/* =========================================================
   26. CLICK A REPORT TO OPEN IT
========================================================= */

tellerSupportTicketList?.addEventListener(
    "click",
    async function (event) {

        if (!isActiveTellerSession()) return;

        const ticketElement = event.target.closest("[data-ticket-id]");

        if (!ticketElement) return;

        await openTellerSupportTicket(
            ticketElement.dataset.ticketId
        );

    }
);


tellerSupportTicketList?.addEventListener(
    "keydown",
    async function (event) {

        if (!isActiveTellerSession()) return;

        if (event.key !== "Enter" && event.key !== " ") return;

        const ticketElement = event.target.closest("[data-ticket-id]");

        if (!ticketElement) return;

        event.preventDefault();

        await openTellerSupportTicket(
            ticketElement.dataset.ticketId
        );

    }
);


/* =========================================================
   27. SEARCH CUSTOMER REPORTS
========================================================= */

supportTicketSearch?.addEventListener(
    "input",
    renderTellerSupportTickets
);


/* =========================================================
   28. REFRESH CUSTOMER REPORTS
========================================================= */

refreshSupportTicketsButton?.addEventListener(
    "click",
    loadTellerSupportTickets
);


/* =========================================================
   29. RETURN TO REPORT INBOX
========================================================= */

closeTellerSupportConversation?.addEventListener(
    "click",
    function () {

        if (!isActiveTellerSession()) return;

        tellerSupportConversation?.classList.add("hidden");

        currentSupportTicket = null;

        renderTellerSupportTickets();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   30. REPLY TO CUSTOMER REPORT
========================================================= */

tellerSupportReplyForm?.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideMessage(tellerSupportMessage);

        if (!isActiveTellerSession()) {

            showTellerSupportMessage(
                "Your teller session is unavailable. Please sign in again.",
                "error"
            );

            return;
        }

        if (!currentSupportTicket) {

            showTellerSupportMessage(
                "Open a customer report before replying.",
                "error"
            );

            return;
        }

        if (
            String(currentSupportTicket.status).toLowerCase() === "closed"
        ) {

            showTellerSupportMessage(
                "This report is closed. Reopen it before sending a reply.",
                "error"
            );

            return;
        }

        if (supportReplyInProgress) return;

        const message = tellerSupportReply?.value.trim() || "";

        if (!message) {

            showTellerSupportMessage(
                "Enter a reply before submitting.",
                "error"
            );

            return;
        }

        if (message.length > 5000) {

            showTellerSupportMessage(
                "Your reply cannot exceed 5,000 characters.",
                "error"
            );

            return;
        }

        supportReplyInProgress = true;

        if (tellerSupportReplyButton) {
            tellerSupportReplyButton.disabled = true;
            tellerSupportReplyButton.textContent = "Sending...";
        }

        try {

            const { data, error } = await tellerSupabase.rpc(
                "nexus_reply_support_ticket",
                {
                    p_ticket_id: currentSupportTicket.ticket_id,
                    p_message: message
                }
            );

            if (error) throw error;

            if (data && data.success === false) {

                throw new Error(
                    data.message || "Your reply could not be sent."
                );

            }

            if (tellerSupportReply) {
                tellerSupportReply.value = "";
            }

            showTellerSupportMessage(
                "Your reply has been sent successfully.",
                "success"
            );

            await loadTellerSupportMessages(
                currentSupportTicket.ticket_id
            );

            await loadTellerSupportTickets();

        } catch (error) {

            console.error("Customer support reply error:", error);

            showTellerSupportMessage(
                getErrorMessage(error, "Could not send your reply."),
                "error"
            );

        } finally {

            supportReplyInProgress = false;

            if (tellerSupportReplyButton) {
                tellerSupportReplyButton.textContent = "Send Reply";
            }

            updateSupportReplyAvailability();

        }

    }
);


/* =========================================================
   31. UPDATE CUSTOMER REPORT STATUS
========================================================= */

updateTellerSupportStatusButton?.addEventListener(
    "click",
    async function () {

        hideMessage(tellerSupportMessage);

        if (!isActiveTellerSession()) {

            showTellerSupportMessage(
                "Your teller session is unavailable. Please sign in again.",
                "error"
            );

            return;
        }

        if (!currentSupportTicket) {

            showTellerSupportMessage(
                "Select a customer report first.",
                "error"
            );

            return;
        }

        if (supportStatusInProgress) return;

        const newStatus = tellerSupportStatusSelect?.value;

        const allowedStatuses = [
            "open",
            "in_progress",
            "resolved",
            "closed"
        ];

        if (!allowedStatuses.includes(newStatus)) {

            showTellerSupportMessage(
                "Select a valid report status.",
                "error"
            );

            return;
        }

        if (newStatus === currentSupportTicket.status) {

            showTellerSupportMessage(
                "The report already has this status.",
                "info"
            );

            return;
        }

        supportStatusInProgress = true;

        updateTellerSupportStatusButton.disabled = true;
        updateTellerSupportStatusButton.textContent = "Updating...";

        try {

            const { data, error } = await tellerSupabase.rpc(
                "nexus_update_support_status",
                {
                    p_ticket_id: currentSupportTicket.ticket_id,
                    p_status: newStatus
                }
            );

            if (error) throw error;

            if (data && data.success === false) {

                throw new Error(
                    data.message || "The report status could not be updated."
                );

            }

            currentSupportTicket.status = newStatus;

            if (tellerSupportStatus) {
                tellerSupportStatus.textContent =
                    formatSupportStatus(newStatus);
            }

            if (tellerSupportStatusSelect) {
                tellerSupportStatusSelect.value = newStatus;
            }

            updateSupportReplyAvailability();

            showTellerSupportMessage(
                `Report status updated to ${formatSupportStatus(newStatus)}.`,
                "success"
            );

            await loadTellerSupportTickets();

        } catch (error) {

            console.error("Customer support status update error:", error);

            showTellerSupportMessage(
                getErrorMessage(error, "Could not update report status."),
                "error"
            );

        } finally {

            supportStatusInProgress = false;

            updateTellerSupportStatusButton.disabled = false;
            updateTellerSupportStatusButton.textContent = "Update Status";

        }

    }
);


/* =========================================================
   32. INITIALIZE CUSTOMER SUPPORT
========================================================= */

async function initializeTellerSupport() {

    if (!isActiveTellerSession()) return;

    currentSupportTicket = null;

    tellerSupportConversation?.classList.add("hidden");

    await loadTellerSupportTickets();

}


/* =========================================================
   33. TELLER MEMBER REGISTRATION AND MEMBER LIST
========================================================= */

/*
   These two functions are intentionally not connected to
   guessed RPC names.

   Your supplied JavaScript contains the registration and
   registered-member HTML references, but does not contain
   the original registration RPC implementation or the
   registered-members loading implementation.

   Do not invent database function names for financial
   member-registration operations.

   The registration and registered-member features should
   be reconnected after their actual RPC names and arguments
   are confirmed.
*/

async function loadMyRegisteredMembers() {

    if (!isActiveTellerSession()) return;

    showMessage(
        myRegisteredMembersMessage,
        "The registered-members database function has not yet been connected.",
        "info"
    );

}


/* =========================================================
   34. AUTH SESSION MONITORING
========================================================= */

tellerSupabase.auth.onAuthStateChange((event) => {

    if (event === "SIGNED_OUT") {

        stopTellerStatusMonitoring();

        showLogin();

        setConnectionStatus("Signed out");

    }

});


/* =========================================================
   35. INITIAL PAGE LOAD
========================================================= */

async function startTellerPortal() {

    const currentYearElement =
        document.getElementById("currentYear");

    if (currentYearElement) {
        currentYearElement.textContent =
            new Date().getFullYear();
    }

    try {

        setConnectionStatus("Connecting...");

        const { data, error } =
            await tellerSupabase.auth.getSession();

        if (error) throw error;

        if (data.session?.user) {

            await initializeTeller(data.session.user);

        } else {

            showLogin();

            setConnectionStatus(
                "Ready to sign in",
                "online"
            );

        }

    } catch (error) {

        console.error("Portal startup error:", error);

        showLogin();

        setConnectionStatus(
            "Connection failed",
            "offline"
        );

        showMessage(
            loginMessage,
            getErrorMessage(error, "Could not connect to the secure service."),
            "error"
        );

    }

}


startTellerPortal();

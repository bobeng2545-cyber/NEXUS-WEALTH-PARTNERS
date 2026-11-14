
/* =========================================================
   NEXUS WEALTH PARTNERS
   TELLER PORTAL
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


/* =========================================================
   3. APPLICATION STATE
========================================================= */

let currentTeller = null;
let currentUser = null;

// Existing live deposit state

let searchedMembers = [];
let selectedMember = null;
let depositInProgress = false;

// Separate test withdrawal state

let testSearchedMembers = [];
let selectedTestMember = null;
let testWithdrawalInProgress = false;


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

    connectionStatus.textContent = message;
    connectionStatus.className = `connection-status ${state}`;

}


function showLogin() {

    loginSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
    logoutButton.classList.add("hidden");

    currentTeller = null;
    currentUser = null;

    // Clear live deposit selection

    selectedMember = null;
    searchedMembers = [];

    if (selectedMemberCard) {
        selectedMemberCard.classList.add("hidden");
    }

    if (memberResults) {
        memberResults.classList.add("hidden");
    }

    if (recordDepositButton) {
        recordDepositButton.disabled = true;
    }

    // Clear test withdrawal selection

    selectedTestMember = null;
    testSearchedMembers = [];

    if (selectedTestMemberCard) {
        selectedTestMemberCard.classList.add("hidden");
    }

    if (testMemberResults) {
        testMemberResults.classList.add("hidden");
    }

    if (recordTestWithdrawalButton) {
        recordTestWithdrawalButton.disabled = true;
    }

}


function showDashboard() {

    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    logoutButton.classList.remove("hidden");

}


function setButtonLoading(button, loading, normalText) {

    if (!button) return;

    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : normalText;

}


/* =========================================================
   5. TELLER AUTHENTICATION AND VERIFICATION
========================================================= */

async function initializeTeller(user) {

    try {

        if (!user || !user.id) {

            showLogin();

            return;
        }

        setConnectionStatus("Verifying teller account...");

        /*
           Read only the authenticated user's teller record.
           Your existing RLS policy allows this.
        */

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

        if (error) {
            throw error;
        }

        if (!data) {

            await tellerSupabase.auth.signOut();

            showLogin();

            showMessage(
                loginMessage,
                "This account is not registered as a Nexus teller. Contact the administrator.",
                "error"
            );

            setConnectionStatus("Access denied", "offline");

            return;
        }

        if (String(data.status).toLowerCase() !== "active") {

            await tellerSupabase.auth.signOut();

            showLogin();

            showMessage(
                loginMessage,
                `Your teller account is ${data.status}. Please contact the administrator.`,
                "error"
            );

            setConnectionStatus("Account inactive", "offline");

            return;
        }

        currentTeller = data;
        currentUser = user;

        renderTellerProfile();

        showDashboard();

        setConnectionStatus("Secure connection active", "online");

        await loadTellerHistory();

    } catch (error) {

        console.error("Teller verification error:", error);

        showLogin();

        showMessage(
            loginMessage,
            error.message || "Could not verify your teller account.",
            "error"
        );

        setConnectionStatus("Connection error", "offline");
    }

}


/* =========================================================
   6. LOGIN
========================================================= */

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(loginMessage);

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

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

        if (error) {
            throw error;
        }

        if (!data.user) {
            throw new Error("Login could not be completed.");
        }

        await initializeTeller(data.user);

    } catch (error) {

        console.error("Teller login error:", error);

        showMessage(
            loginMessage,
            error.message || "Login failed. Check your credentials.",
            "error"
        );

    } finally {

        setButtonLoading(loginButton, false, "Sign In");
    }

});


/* =========================================================
   7. LOGOUT
========================================================= */

logoutButton.addEventListener("click", async function () {

    logoutButton.disabled = true;

    try {

        const { error } = await tellerSupabase.auth.signOut();

        if (error) {
            throw error;
        }

        showLogin();

        loginPassword.value = "";

        hideMessage(loginMessage);

        setConnectionStatus("Signed out");

    } catch (error) {

        console.error("Logout error:", error);

        alert(error.message || "Could not log out.");

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

    const phone =
        currentTeller.phone || "—";

    tellerName.textContent = name;
    tellerCode.textContent = currentTeller.teller_code;
    tellerStatus.textContent = currentTeller.status;

    profileName.textContent = name;
    profileEmail.textContent = email;
    profilePhone.textContent = phone;
    profileCode.textContent = currentTeller.teller_code;
    profileStatus.textContent = currentTeller.status;

}


/* =========================================================
   9. DASHBOARD NAVIGATION
========================================================= */

document.querySelectorAll(".nav-button").forEach(button => {

    button.addEventListener("click", async function () {

        const targetPanel = this.dataset.panel;

        document.querySelectorAll(".nav-button").forEach(item => {
            item.classList.remove("active");
        });

        document.querySelectorAll(".dashboard-panel").forEach(panel => {
            panel.classList.add("hidden");
        });

        this.classList.add("active");

        const targetElement = document.getElementById(targetPanel);

        if (!targetElement) {
            console.error("Dashboard panel not found:", targetPanel);
            return;
        }

        targetElement.classList.remove("hidden");

        if (targetPanel === "historyPanel") {
            await loadTellerHistory();
        }

        if (targetPanel === "testWithdrawalPanel") {
            await loadTestWithdrawalHistory();
        }

    });

});


/* =========================================================
   10. LIVE DEPOSIT MEMBER SEARCH
========================================================= */

memberSearchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(memberSearchMessage);

    memberResults.classList.add("hidden");
    selectedMemberCard.classList.add("hidden");

    selectedMember = null;
    searchedMembers = [];

    recordDepositButton.disabled = true;

    const searchValue = memberSearchInput.value.trim();

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
            {
                p_search: searchValue
            }
        );

        if (error) {
            throw error;
        }

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
            error.message || "Member search failed.",
            "error"
        );

    } finally {

        setButtonLoading(searchMemberButton, false, "Search");
    }

});


function renderMemberResults() {

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

            const index = Number(this.dataset.index);

            const member = searchedMembers[index];

            if (member) {
                selectMember(member);
            }

        });

    });

}


function selectMember(member) {

    selectedMember = member;

    selectedMemberName.textContent = member.full_name;
    selectedMemberId.textContent = member.member_id;
    selectedMemberPhone.textContent = member.phone || "Not provided";
    selectedMemberStatus.textContent = member.status || "Not specified";

    selectedMemberCard.classList.remove("hidden");
    memberResults.classList.add("hidden");

    recordDepositButton.disabled = false;

    hideMessage(depositMessage);

    depositReceipt.classList.add("hidden");

}


changeMemberButton.addEventListener("click", function () {

    selectedMember = null;

    selectedMemberCard.classList.add("hidden");

    recordDepositButton.disabled = true;

    memberSearchInput.focus();

});


/* =========================================================
   11. DEPOSIT PAYMENT METHOD FIELD
========================================================= */

depositMethod.addEventListener("change", function () {

    if (this.value === "mobile_money") {

        paymentPhoneGroup.classList.remove("hidden");

        paymentPhone.required = true;

    } else {

        paymentPhoneGroup.classList.add("hidden");

        paymentPhone.required = false;

        paymentPhone.value = "";
    }

});


/* =========================================================
   12. RECORD LIVE TELLER DEPOSIT
========================================================= */

depositForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(depositMessage);

    if (!currentTeller || !currentUser) {

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

    const amount = Number(depositAmount.value);

    const method = depositMethod.value;

    const phone = paymentPhone.value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {

        showMessage(
            depositMessage,
            "Enter a valid deposit amount greater than zero.",
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

    if (method === "mobile_money" && !phone) {

        showMessage(
            depositMessage,
            "Enter the Mobile Money phone number.",
            "error"
        );

        return;
    }

    const confirmed = window.confirm(
        `Confirm this deposit?\n\n` +
        `Member: ${selectedMember.full_name}\n` +
        `Member ID: ${selectedMember.member_id}\n` +
        `Amount: ${formatMoney(amount)}\n` +
        `Payment Method: ${method.replace("_", " ")}\n\n` +
        `The member's wallet will be credited immediately.`
    );

    if (!confirmed) return;

    depositInProgress = true;

    setButtonLoading(
        recordDepositButton,
        true,
        "Record Deposit"
    );

    try {

        const { data, error } = await tellerSupabase.rpc(
            "record_teller_deposit",
            {
                p_member_id: selectedMember.member_id,
                p_amount: amount,
                p_payment_method: method,
                p_payment_phone: method === "mobile_money" ? phone : null
            }
        );

        if (error) {
            throw error;
        }

        if (!data || data.success !== true) {

            throw new Error(
                data?.message || "The deposit could not be recorded."
            );
        }

        depositForm.reset();

        paymentPhoneGroup.classList.add("hidden");

        depositReceipt.classList.remove("hidden");

        receiptMessage.textContent =
            `${data.member_name}'s wallet has been credited successfully.`;

        receiptReference.textContent = data.reference;

        receiptAmount.textContent = formatMoney(data.amount);

        showMessage(
            depositMessage,
            "Deposit completed successfully.",
            "success"
        );

        await loadTellerHistory();

    } catch (error) {

        console.error("Deposit recording error:", error);

        showMessage(
            depositMessage,
            error.message || "Deposit recording failed.",
            "error"
        );

    } finally {

        depositInProgress = false;

        recordDepositButton.disabled = !selectedMember;

        recordDepositButton.textContent = "Record Deposit";
    }

});


/* =========================================================
   13. START ANOTHER LIVE DEPOSIT
========================================================= */

newDepositButton.addEventListener("click", function () {

    selectedMember = null;

    searchedMembers = [];

    memberSearchInput.value = "";

    depositForm.reset();

    paymentPhoneGroup.classList.add("hidden");

    selectedMemberCard.classList.add("hidden");

    memberResults.classList.add("hidden");

    depositReceipt.classList.add("hidden");

    recordDepositButton.disabled = true;

    hideMessage(depositMessage);

    hideMessage(memberSearchMessage);

    memberSearchInput.focus();

});


/* =========================================================
   14. LOAD LIVE TELLER DEPOSIT HISTORY
========================================================= */

async function loadTellerHistory() {

    if (!currentTeller) return;

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
            {
                p_limit: 50
            }
        );

        if (error) {
            throw error;
        }

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
                    <td><strong>${escapeHTML(formatMoney(transaction.amount))}</strong></td>
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
            error.message || "Unable to load transaction history.",
            "error"
        );

    }

}


refreshHistoryButton.addEventListener("click", loadTellerHistory);


/* =========================================================
   15. TEST WITHDRAWAL MEMBER SEARCH
========================================================= */

testMemberSearchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(testMemberSearchMessage);

    testMemberResults.classList.add("hidden");
    selectedTestMemberCard.classList.add("hidden");

    selectedTestMember = null;
    testSearchedMembers = [];

    recordTestWithdrawalButton.disabled = true;

    testWithdrawalReceipt.classList.add("hidden");

    const searchValue = testMemberSearchInput.value.trim();

    if (!searchValue) {

        showMessage(
            testMemberSearchMessage,
            "Enter a member ID or phone number.",
            "error"
        );

        return;
    }

    if (!currentTeller || !currentUser) {

        showMessage(
            testMemberSearchMessage,
            "Your teller session is unavailable. Please sign in again.",
            "error"
        );

        return;
    }

    setButtonLoading(
        testSearchMemberButton,
        true,
        "Search"
    );

    try {

        /*
           This uses the same secure member lookup RPC
           as the live deposit workflow.

           It does not expose member wallet balances.
        */

        const { data, error } = await tellerSupabase.rpc(
            "lookup_teller_member",
            {
                p_search: searchValue
            }
        );

        if (error) {
            throw error;
        }

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
            error.message || "Member search failed.",
            "error"
        );

    } finally {

        setButtonLoading(
            testSearchMemberButton,
            false,
            "Search"
        );
    }

});


/* =========================================================
   16. DISPLAY TEST WITHDRAWAL MEMBER RESULTS
========================================================= */

function renderTestMemberResults() {

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

                const index = Number(this.dataset.index);

                const member = testSearchedMembers[index];

                if (member) {
                    selectTestMember(member);
                }

            });

        });

}


/* =========================================================
   17. SELECT TEST WITHDRAWAL MEMBER
========================================================= */

function selectTestMember(member) {

    selectedTestMember = member;

    testMemberName.textContent = member.full_name;
    testMemberId.textContent = member.member_id;
    testMemberPhone.textContent = member.phone || "Not provided";
    testMemberStatus.textContent = member.status || "Not specified";

    selectedTestMemberCard.classList.remove("hidden");

    testMemberResults.classList.add("hidden");

    recordTestWithdrawalButton.disabled = false;

    testWithdrawalReceipt.classList.add("hidden");

    hideMessage(testWithdrawalMessage);
    hideMessage(testMemberSearchMessage);

}


changeTestMemberButton.addEventListener("click", function () {

    selectedTestMember = null;

    selectedTestMemberCard.classList.add("hidden");

    recordTestWithdrawalButton.disabled = true;

    testMemberSearchInput.focus();

});


/* =========================================================
   18. RECORD TEST WITHDRAWAL SIMULATION
========================================================= */

testWithdrawalForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage(testWithdrawalMessage);

    testWithdrawalReceipt.classList.add("hidden");

    if (!currentTeller || !currentUser) {

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

    const amountText = testWithdrawalAmount.value.trim();

    const amount = Number(amountText);

    const method = testWithdrawalMethod.value;

    const details = testPaymentDetails.value.trim();


    // Validate the amount

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


    // Validate the payment method

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


    // Validate the test payment details

    if (details.length < 5) {

        showMessage(
            testWithdrawalMessage,
            "Enter at least five characters of dummy test payment details.",
            "error"
        );

        return;
    }


    /*
       IMPORTANT:

       Use fictional payment details only.

       Do not enter real bank account numbers,
       real mobile money numbers or private
       financial information into this simulation.
    */


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

        /*
           This RPC inserts a record only into:

           nexus_teller_test_withdrawals

           It does not call:
           - record_teller_deposit
           - submit_withdrawal_request
           - complete_withdrawal
           - Paystack

           It does not modify a member's wallet.
        */

        const { data, error } = await tellerSupabase.rpc(
            "record_teller_test_withdrawal",
            {
                p_member_id: selectedTestMember.member_id,
                p_amount: amount,
                p_withdrawal_method: method,
                p_payment_details: details
            }
        );


        if (error) {
            throw error;
        }


        if (!data || data.success !== true) {

            throw new Error(
                data?.message ||
                "The test withdrawal could not be recorded."
            );
        }


        // Display the simulation receipt

        testWithdrawalReceipt.classList.remove("hidden");

        testReceiptMessage.textContent =
            "TEST SIMULATION RECORDED — NO MONEY WAS TRANSFERRED.";

        testReceiptReference.textContent =
            data.test_reference || "—";

        testReceiptAmount.textContent =
            formatMoney(data.amount);


        showMessage(
            testWithdrawalMessage,
            "Test withdrawal simulation recorded successfully. No real money was moved.",
            "success"
        );


        // Clear the form but retain the selected member

        testWithdrawalForm.reset();


        // Refresh the separate test withdrawal history

        await loadTestWithdrawalHistory();


    } catch (error) {

        console.error(
            "Test withdrawal recording error:",
            error
        );

        showMessage(
            testWithdrawalMessage,
            error.message ||
            "Test withdrawal simulation failed.",
            "error"
        );

    } finally {

        testWithdrawalInProgress = false;

        recordTestWithdrawalButton.disabled =
            !selectedTestMember;

        recordTestWithdrawalButton.textContent =
            "Record Test Withdrawal";
    }

});


/* =========================================================
   19. START ANOTHER TEST WITHDRAWAL
========================================================= */

newTestWithdrawalButton.addEventListener("click", function () {

    selectedTestMember = null;

    testSearchedMembers = [];

    testMemberSearchInput.value = "";

    testWithdrawalForm.reset();

    selectedTestMemberCard.classList.add("hidden");

    testMemberResults.classList.add("hidden");

    testWithdrawalReceipt.classList.add("hidden");

    recordTestWithdrawalButton.disabled = true;

    hideMessage(testWithdrawalMessage);

    hideMessage(testMemberSearchMessage);

    testMemberSearchInput.focus();

});



/* =========================================================
   20. LOAD TEST WITHDRAWAL HISTORY
========================================================= */

async function loadTestWithdrawalHistory() {

    if (!currentTeller || !currentUser) return;

    testWithdrawalHistoryBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                Loading test withdrawal records...
            </td>
        </tr>
    `;

    hideMessage(testWithdrawalHistoryMessage);

    try {

        const { data, error } = await tellerSupabase.rpc(
            "list_my_teller_test_withdrawals",
            {
                p_limit: 50
            }
        );

        if (error) {
            throw error;
        }

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
                    String(withdrawal.status || "simulated")
                        .toLowerCase();

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
                        <td>
                            ${escapeHTML(formatDate(withdrawal.created_at))}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(withdrawal.full_name)}
                            </strong>
                            <br>
                            <small>
                                ${escapeHTML(withdrawal.member_id)}
                            </small>
                        </td>

                        <td>
                            ${escapeHTML(withdrawal.test_reference)}
                        </td>

                        <td>
                            ${escapeHTML(method)}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(formatMoney(withdrawal.amount))}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(status.toUpperCase())}
                        </td>

                        <td>
                            ${cancelButton}
                        </td>
                    </tr>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Test withdrawal history error:",
            error
        );

        testWithdrawalHistoryBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Could not load test withdrawal history.
                </td>
            </tr>
        `;

        showMessage(
            testWithdrawalHistoryMessage,
            error.message ||
            "Unable to load test withdrawal history.",
            "error"
        );

    }

}


/* =========================================================
   20.1 CANCEL TEST WITHDRAWAL
========================================================= */

testWithdrawalHistoryBody.addEventListener(
    "click",
    async function (event) {

        const button = event.target.closest(
            ".cancel-test-withdrawal-button"
        );

        if (!button) return;

        const reference = button.dataset.reference;

        if (!reference) {
            alert("Test withdrawal reference is missing.");
            return;
        }

        if (!currentTeller || !currentUser) {
            alert("Your teller session is unavailable. Please sign in again.");
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
                {
                    p_test_reference: reference
                }
            );

            if (error) {
                throw error;
            }

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

            console.error(
                "Test withdrawal cancellation error:",
                error
            );

            alert(
                error.message ||
                "Unable to cancel the test withdrawal."
            );

            button.disabled = false;
            button.textContent = originalText;

        }

    }
);


/* =========================================================
   20.2 REFRESH TEST WITHDRAWAL HISTORY
========================================================= */

refreshTestWithdrawalHistoryButton.addEventListener(
    "click",
    loadTestWithdrawalHistory
);



/* =========================================================
   21. AUTH SESSION MONITORING
========================================================= */

tellerSupabase.auth.onAuthStateChange((event) => {

    if (event === "SIGNED_OUT") {

        showLogin();

        setConnectionStatus("Signed out");
    }

});


/* =========================================================
   22. INITIAL PAGE LOAD
========================================================= */

async function startTellerPortal() {

    document.getElementById("currentYear").textContent =
        new Date().getFullYear();

    try {

        setConnectionStatus("Connecting...");

        const { data, error } =
            await tellerSupabase.auth.getSession();

        if (error) {
            throw error;
        }

        if (data.session?.user) {

            await initializeTeller(data.session.user);

        } else {

            showLogin();

            setConnectionStatus("Ready to sign in", "online");
        }

    } catch (error) {

        console.error("Portal startup error:", error);

        showLogin();

        setConnectionStatus("Connection failed", "offline");

        showMessage(
            loginMessage,
            error.message || "Could not connect to the secure service.",
            "error"
        );
    }

}


startTellerPortal();

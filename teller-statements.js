
/* =========================================================
   NEXUS WEALTH PARTNERS
   TELLER PORTAL — MEMBER STATEMENTS
   READ-ONLY STATEMENT MODULE
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. REUSE EXISTING TELLER SUPABASE CONNECTION
    ===================================================== */

    const statementSupabase = window.tellerSupabase;

    if (!statementSupabase) {

        console.error(
            "Member Statements: Existing teller Supabase connection is unavailable."
        );

        return;
    }


    /* =====================================================
       2. ELEMENT REFERENCES
    ===================================================== */

    const searchForm =
        document.getElementById("statementSearchForm");

    const searchInput =
        document.getElementById("statementSearchInput");

    const searchButton =
        document.getElementById("statementSearchButton");

    const searchMessage =
        document.getElementById("statementSearchMessage");

    const memberResults =
        document.getElementById("statementMemberResults");


    const memberDetails =
        document.getElementById("statementMemberDetails");

    const accountStatus =
        document.getElementById("statementAccountStatus");

    const memberName =
        document.getElementById("statementMemberName");

    const memberId =
        document.getElementById("statementMemberId");

    const memberEmail =
        document.getElementById("statementMemberEmail");

    const memberPhone =
        document.getElementById("statementMemberPhone");

    const memberSince =
        document.getElementById("statementMemberSince");


    const filters =
        document.getElementById("statementFilters");

    const startDateInput =
        document.getElementById("statementStartDate");

    const endDateInput =
        document.getElementById("statementEndDate");

    const typeFilter =
        document.getElementById("statementTypeFilter");

    const statusFilter =
        document.getElementById("statementStatusFilter");

    const applyFiltersButton =
        document.getElementById("statementApplyFiltersButton");

    const resetFiltersButton =
        document.getElementById("statementResetFiltersButton");


    const summary =
        document.getElementById("statementSummary");

    const totalTransactions =
        document.getElementById("statementTotalTransactions");

    const totalDeposits =
        document.getElementById("statementTotalDeposits");

    const totalWithdrawals =
        document.getElementById("statementTotalWithdrawals");


    const exportActions =
        document.getElementById("statementExportActions");

    const pdfButton =
        document.getElementById("statementDownloadPdfButton");

    const excelButton =
        document.getElementById("statementDownloadExcelButton");


    const transactionsSection =
        document.getElementById("statementTransactionsSection");

    const recordCount =
        document.getElementById("statementRecordCount");

    const statementMessage =
        document.getElementById("statementMessage");

    const tableBody =
        document.getElementById("statementTableBody");


    /* =====================================================
       3. VALIDATE REQUIRED HTML ELEMENTS
    ===================================================== */

    const requiredElements = [

        searchForm,
        searchInput,
        searchButton,
        searchMessage,
        memberResults,

        memberDetails,
        accountStatus,
        memberName,
        memberId,
        memberEmail,
        memberPhone,
        memberSince,

        filters,
        startDateInput,
        endDateInput,
        typeFilter,
        statusFilter,
        applyFiltersButton,
        resetFiltersButton,

        summary,
        totalTransactions,
        totalDeposits,
        totalWithdrawals,

        exportActions,
        pdfButton,
        excelButton,

        transactionsSection,
        recordCount,
        statementMessage,
        tableBody

    ];

    if (requiredElements.some(element => !element)) {

        console.error(
            "Member Statements: Required HTML elements are missing. Check teller.html."
        );

        return;
    }


    /* =====================================================
       4. MODULE STATE
    ===================================================== */

    let currentStatementTeller = null;

    let selectedStatementMember = null;

    let statementTransactions = [];

    let filteredStatementTransactions = [];

    let statementSearchInProgress = false;

    let statementLoadInProgress = false;

    let statementLoadVersion = 0;


    /* =====================================================
       5. GENERAL HELPERS
    ===================================================== */

    function showStatementMessage(
        element,
        message,
        type = "info"
    ) {

        if (!element) return;

        element.textContent = message;

        element.className = `message ${type}`;

    }


    function hideStatementMessage(element) {

        if (!element) return;

        element.textContent = "";

        element.className = "message hidden";

    }


    function formatStatementMoney(amount) {

        const value = Number(amount);

        return new Intl.NumberFormat("en-GH", {

            style: "currency",

            currency: "GHS",

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }).format(Number.isFinite(value) ? value : 0);

    }


    function formatStatementDate(value) {

        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString("en-GH", {

            dateStyle: "medium",

            timeStyle: "short",

            timeZone: "Africa/Accra"

        });

    }


    function formatDateOnly(value) {

        if (!value) {
            return "All available dates";
        }

        const date = new Date(`${value}T12:00:00`);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-GH", {

            dateStyle: "medium"

        });

    }


    function normaliseStatus(status) {

        return String(status || "unknown")
            .trim()
            .toLowerCase();

    }


    function displayStatus(status) {

        return String(status || "Unknown")
            .replaceAll("_", " ")
            .replace(/\b\w/g, character =>
                character.toUpperCase()
            );

    }


    function setStatementButtonLoading(
        button,
        loading,
        normalText
    ) {

        if (!button) return;

        button.disabled = loading;

        button.textContent = loading
            ? "Please wait..."
            : normalText;

    }


    function getSafeFileName(value) {

        return String(value || "Member")
            .replace(/[^a-zA-Z0-9_-]/g, "_");

    }


    function resetStatementDisplay() {

        statementLoadVersion++;

        selectedStatementMember = null;

        statementTransactions = [];

        filteredStatementTransactions = [];

        memberDetails.classList.add("hidden");

        filters.classList.add("hidden");

        summary.classList.add("hidden");

        exportActions.classList.add("hidden");

        transactionsSection.classList.add("hidden");

        memberResults.classList.add("hidden");

        memberResults.innerHTML = "";

        tableBody.innerHTML = "";

        recordCount.textContent = "0 records";

        startDateInput.value = "";

        endDateInput.value = "";

        typeFilter.value = "all";

        statusFilter.value = "all";

        hideStatementMessage(searchMessage);

        hideStatementMessage(statementMessage);

    }


    /* =====================================================
       6. CHECK AUTHENTICATED TELLER
    ===================================================== */

    async function verifyStatementTeller() {

        const {
            data: sessionData,
            error: sessionError
        } = await statementSupabase.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        const user = sessionData.session?.user;

        if (!user) {

            currentStatementTeller = null;

            return false;
        }


        const {
            data,
            error
        } = await statementSupabase

            .from("nexus_tellers")

            .select("user_id, status, teller_code")

            .eq("user_id", user.id)

            .maybeSingle();


        if (error) {
            throw error;
        }


        if (
            !data ||
            normaliseStatus(data.status) !== "active"
        ) {

            currentStatementTeller = null;

            return false;
        }


        currentStatementTeller = data;

        return true;

    }


    /* =====================================================
       7. SEARCH FOR ANY MEMBER
    ===================================================== */

    searchForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (statementSearchInProgress) return;


        resetStatementDisplay();

        const searchValue = searchInput.value.trim();


        if (searchValue.length < 2) {

            showStatementMessage(

                searchMessage,

                "Enter at least two characters to search for a member.",

                "error"

            );

            return;
        }


        statementSearchInProgress = true;


        setStatementButtonLoading(

            searchButton,

            true,

            "Search Member"

        );


        try {

            const isAuthorized =
                await verifyStatementTeller();


            if (!isAuthorized) {

                throw new Error(
                    "Your active teller session could not be verified. Please sign in again."
                );

            }


            const {
                data,
                error
            } = await statementSupabase.rpc(

                "teller_lookup_statement_member",

                {
                    p_search: searchValue
                }

            );


            if (error) {
                throw error;
            }


            const members = Array.isArray(data)
                ? data
                : [];


            if (members.length === 0) {

                showStatementMessage(

                    searchMessage,

                    "No matching member was found. Check the name, Member ID or phone number.",

                    "error"

                );

                return;
            }


            renderStatementMemberResults(members);


        } catch (error) {

            console.error(
                "Statement member search error:",
                error
            );


            showStatementMessage(

                searchMessage,

                error.message ||
                    "Could not search for this member.",

                "error"

            );


        } finally {

            statementSearchInProgress = false;


            setStatementButtonLoading(

                searchButton,

                false,

                "Search Member"

            );

        }

    });


    /* =====================================================
       8. DISPLAY MEMBER SEARCH RESULTS
    ===================================================== */

    function renderStatementMemberResults(members) {

        memberResults.innerHTML = "";


        members.forEach(member => {

            const item = document.createElement("div");

            item.className = "member-result";


            const details = document.createElement("div");


            const name = document.createElement("strong");

            name.textContent =
                member.full_name || "Unnamed member";


            const information = document.createElement("span");

            information.textContent =
                `ID: ${member.member_id || "—"} · Phone: ${member.phone || "Not provided"}`;


            details.appendChild(name);

            details.appendChild(information);


            const button = document.createElement("button");

            button.type = "button";

            button.className = "primary-button";

            button.textContent = "View Statement";


            button.addEventListener("click", async function () {

                await selectStatementMember(member);

            });


            item.appendChild(details);

            item.appendChild(button);

            memberResults.appendChild(item);

        });


        memberResults.classList.remove("hidden");


        showStatementMessage(

            searchMessage,

            `${members.length} matching member(s) found. Select a member to view their statement.`,

            "success"

        );

    }


    /* =====================================================
       9. SELECT MEMBER
    ===================================================== */

    async function selectStatementMember(member) {

        if (!member || !member.member_id) {
            return;
        }


        if (statementLoadInProgress) {
            return;
        }


        selectedStatementMember = member;

        statementTransactions = [];

        filteredStatementTransactions = [];


        memberName.textContent =
            member.full_name || "—";


        memberId.textContent =
            member.member_id || "—";


        memberEmail.textContent =
            member.email || "Not provided";


        memberPhone.textContent =
            member.phone || "Not provided";


        memberSince.textContent =
            member.member_since
                ? formatStatementDate(member.member_since)
                : "—";


        accountStatus.textContent =
            displayStatus(member.account_status);


        memberDetails.classList.remove("hidden");

        memberResults.classList.add("hidden");

        filters.classList.remove("hidden");


        await loadMemberStatement();

    }


    /* =====================================================
       10. LOAD MEMBER TRANSACTIONS
    ===================================================== */

    async function loadMemberStatement() {

        if (
            !selectedStatementMember ||
            statementLoadInProgress
        ) {
            return;
        }


        statementLoadInProgress = true;

        const loadVersion = ++statementLoadVersion;


        setStatementButtonLoading(

            applyFiltersButton,

            true,

            "Apply Filters"

        );


        transactionsSection.classList.remove("hidden");

        summary.classList.add("hidden");

        exportActions.classList.add("hidden");


        tableBody.innerHTML = `

            <tr>
                <td colspan="5" class="empty-state">
                    Loading member transactions...
                </td>
            </tr>

        `;


        hideStatementMessage(statementMessage);


        try {

            const isAuthorized =
                await verifyStatementTeller();


            if (!isAuthorized) {

                throw new Error(
                    "Your teller session is no longer active. Please sign in again."
                );

            }


            const startDate =
                startDateInput.value || null;


            const endDate =
                endDateInput.value || null;


            if (
                startDate &&
                endDate &&
                startDate > endDate
            ) {

                throw new Error(
                    "The start date cannot be later than the end date."
                );

            }


            const {
                data,
                error
            } = await statementSupabase.rpc(

                "teller_get_member_statement",

                {

                    p_member_id:
                        selectedStatementMember.member_id,

                    p_start_date: startDate,

                    p_end_date: endDate,

                    p_limit: 5000

                }

            );


            if (error) {
                throw error;
            }


            if (loadVersion !== statementLoadVersion) {
                return;
            }


            statementTransactions =
                Array.isArray(data) ? data : [];


            applyStatementFilters();


            if (statementTransactions.length === 0) {

                showStatementMessage(

                    statementMessage,

                    "No transactions were returned for this member within the selected date range.",

                    "info"

                );

            }


        } catch (error) {

            if (loadVersion !== statementLoadVersion) {
                return;
            }


            console.error(
                "Member statement loading error:",
                error
            );


            statementTransactions = [];

            filteredStatementTransactions = [];


            tableBody.innerHTML = `

                <tr>
                    <td colspan="5" class="empty-state">
                        Could not load this member's statement.
                    </td>
                </tr>

            `;


            showStatementMessage(

                statementMessage,

                error.message ||
                    "Unable to load the member statement.",

                "error"

            );


            summary.classList.add("hidden");

            exportActions.classList.add("hidden");


        } finally {

            if (loadVersion === statementLoadVersion) {

                statementLoadInProgress = false;


                setStatementButtonLoading(

                    applyFiltersButton,

                    false,

                    "Apply Filters"

                );

            }

        }

    }


    /* =====================================================
       11. FILTER STATEMENT TRANSACTIONS
    ===================================================== */

    function applyStatementFilters() {

        const type = typeFilter.value;

        const status = statusFilter.value;


        filteredStatementTransactions =

            statementTransactions.filter(transaction => {

                const transactionType =
                    normaliseStatus(
                        transaction.transaction_type
                    );


                const transactionStatus =
                    normaliseStatus(
                        transaction.transaction_status
                    );


                const typeMatches =

                    type === "all" ||
                    transactionType === type;


                const statusMatches =

                    status === "all" ||
                    transactionStatus === status;


                return typeMatches && statusMatches;

            });


        renderStatementTransactions();

        updateStatementSummary();

    }


    applyFiltersButton.addEventListener(
        "click",
        loadMemberStatement
    );


    /* =====================================================
       12. RESET STATEMENT FILTERS
    ===================================================== */

    resetFiltersButton.addEventListener(
        "click",
        function () {

            if (statementLoadInProgress) return;


            startDateInput.value = "";

            endDateInput.value = "";

            typeFilter.value = "all";

            statusFilter.value = "all";


            loadMemberStatement();

        }
    );


    /* =====================================================
       13. DISPLAY STATEMENT TRANSACTIONS
    ===================================================== */

    function renderStatementTransactions() {

        tableBody.innerHTML = "";


        recordCount.textContent =

            `${filteredStatementTransactions.length.toLocaleString("en-GH")} record(s)`;


        if (filteredStatementTransactions.length === 0) {

            tableBody.innerHTML = `

                <tr>
                    <td colspan="5" class="empty-state">
                        No transactions match the selected filters.
                    </td>
                </tr>

            `;


            exportActions.classList.add("hidden");

            return;
        }


        filteredStatementTransactions.forEach(transaction => {

            const row = document.createElement("tr");


            const type = normaliseStatus(
                transaction.transaction_type
            );


            const typeLabel =

                type === "deposit"
                    ? "Deposit"

                    : type === "withdrawal"
                        ? "Withdrawal"

                        : displayStatus(type);


            const method = String(
                transaction.payment_method || "—"
            )

                .replace(/^teller_/, "")

                .replaceAll("_", " ");


            const status = displayStatus(
                transaction.transaction_status
            );


            const values = [

                formatStatementDate(
                    transaction.transaction_date
                ),

                typeLabel,

                method,

                formatStatementMoney(
                    transaction.amount
                ),

                status

            ];


            values.forEach((value, index) => {

                const cell = document.createElement("td");

                cell.textContent = value;


                if (index === 3) {

                    cell.style.fontWeight = "700";

                }


                if (index === 4) {

                    cell.className =
                        "transaction-status status-" +
                        normaliseStatus(
                            transaction.transaction_status
                        ).replace(/[^a-z0-9_-]/g, "");

                }


                row.appendChild(cell);

            });


            tableBody.appendChild(row);

        });


        exportActions.classList.remove("hidden");

    }


    /* =====================================================
       14. UPDATE SUMMARY COUNTS
    ===================================================== */

    function updateStatementSummary() {

        const deposits =
            filteredStatementTransactions.filter(

                transaction =>

                    normaliseStatus(
                        transaction.transaction_type
                    ) === "deposit"

            );


        const withdrawals =
            filteredStatementTransactions.filter(

                transaction =>

                    normaliseStatus(
                        transaction.transaction_type
                    ) === "withdrawal"

            );


        totalTransactions.textContent =

            filteredStatementTransactions.length
                .toLocaleString("en-GH");


        totalDeposits.textContent =

            deposits.length.toLocaleString("en-GH");


        totalWithdrawals.textContent =

            withdrawals.length.toLocaleString("en-GH");


        summary.classList.remove("hidden");

    }


    /* =====================================================
       15. EXPORT DATA PREPARATION
    ===================================================== */

    function getStatementExportData() {

        if (!selectedStatementMember) {

            throw new Error(
                "Select a member first."
            );

        }


        if (filteredStatementTransactions.length === 0) {

            throw new Error(
                "There are no transactions to export."
            );

        }


        return filteredStatementTransactions.map(transaction => ({

            Date: formatStatementDate(
                transaction.transaction_date
            ),

            Type: displayStatus(
                transaction.transaction_type
            ),

            "Payment Method": String(
                transaction.payment_method || "—"
            )

                .replace(/^teller_/, "")

                .replaceAll("_", " "),

            Amount: Number(transaction.amount || 0),

            Status: displayStatus(
                transaction.transaction_status
            )

        }));

    }


    function getStatementPeriod() {

        return (

            `${formatDateOnly(startDateInput.value)} to ` +

            `${formatDateOnly(endDateInput.value)}`

        );

    }


    
/* =====================================================
   16. PROFESSIONAL EXCEL STATEMENT EXPORT
===================================================== */

excelButton.addEventListener("click", function () {

    try {

        if (!window.XLSX) {
            throw new Error(
                "Excel export library is unavailable. Refresh the page and try again."
            );
        }

        const rows = getStatementExportData();

        const XLSX = window.XLSX;

        const workbook = XLSX.utils.book_new();

        const member = selectedStatementMember;

        const generatedOn = formatStatementDate(new Date());

        const statementPeriod = getStatementPeriod();

        const sheetData = [

            ["NEXUS WEALTH PARTNERS"],

            ["OFFICIAL MEMBER ACCOUNT STATEMENT"],

            [],

            ["MEMBER INFORMATION"],

            [
                "Member Name",
                member.full_name || "—",
                "",
                "Member ID",
                member.member_id || "—"
            ],

            [
                "Email Address",
                member.email || "—",
                "",
                "Phone Number",
                member.phone || "—"
            ],

            [
                "Account Status",
                displayStatus(member.account_status),
                "",
                "Statement Period",
                statementPeriod
            ],

            [
                "Generated On",
                generatedOn,
                "",
                "Number of Records",
                rows.length
            ],

            [],

            ["TRANSACTION DETAILS"],

            [
                "Date",
                "Transaction Type",
                "Payment Method",
                "Amount (GHS)",
                "Status"
            ]

        ];


        /* Add transaction records */

        rows.forEach(row => {

            sheetData.push([

                row.Date,

                row.Type,

                row["Payment Method"],

                Number(row.Amount),

                row.Status

            ]);

        });


        /* Add professional footer */

        const footerRow = sheetData.length;

        sheetData.push([]);

        sheetData.push([
            "This statement is generated electronically by NEXUS WEALTH PARTNERS."
        ]);

        sheetData.push([
            "Please contact the organisation if you require assistance with this statement."
        ]);


        const worksheet =
            XLSX.utils.aoa_to_sheet(sheetData);


        /* =================================================
           COLUMN WIDTHS
        ================================================= */

        worksheet["!cols"] = [

            { wch: 24 },

            { wch: 23 },

            { wch: 25 },

            { wch: 20 },

            { wch: 20 }

        ];


        /* =================================================
           MERGED CELLS
        ================================================= */

        worksheet["!merges"] = [

            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },

            { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },

            { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },

            { s: { r: 9, c: 0 }, e: { r: 9, c: 4 } },

            { s: { r: footerRow + 1, c: 0 }, e: { r: footerRow + 1, c: 4 } },

            { s: { r: footerRow + 2, c: 0 }, e: { r: footerRow + 2, c: 4 } }

        ];


        /* =================================================
           ROW HEIGHTS
        ================================================= */

        worksheet["!rows"] = [

            { hpt: 34 },

            { hpt: 24 },

            { hpt: 12 },

            { hpt: 25 },

            { hpt: 25 },

            { hpt: 25 },

            { hpt: 25 },

            { hpt: 25 },

            { hpt: 12 },

            { hpt: 27 },

            { hpt: 30 }

        ];


        /* =================================================
           PROFESSIONAL COLOUR PALETTE
        ================================================= */

        const navy = "102B46";

        const blue = "1D4E75";

        const lightBlue = "EAF1F7";

        const lighterBlue = "F5F8FC";

        const borderColour = "D6E0EA";

        const darkText = "263747";

        const mutedText = "64748B";

        const white = "FFFFFF";


        /* =================================================
           STYLE HELPER
        ================================================= */

        function styleCell(
            cellAddress,
            style
        ) {

            if (!worksheet[cellAddress]) return;

            worksheet[cellAddress].s = style;

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


        /* =================================================
           COMPANY HEADING
        ================================================= */

        styleCell("A1", {

            font: {
                name: "Arial",
                sz: 19,
                bold: true,
                color: {
                    rgb: white
                }
            },

            fill: {
                fgColor: {
                    rgb: navy
                }
            },

            alignment: {
                horizontal: "center",
                vertical: "center"
            }

        });


        styleCell("A2", {

            font: {
                name: "Arial",
                sz: 11,
                bold: true,
                color: {
                    rgb: blue
                }
            },

            alignment: {
                horizontal: "center",
                vertical: "center"
            }

        });


        /* =================================================
           SECTION HEADINGS
        ================================================= */

        ["A4", "A10"].forEach(address => {

            styleCell(address, {

                font: {
                    name: "Arial",
                    sz: 11,
                    bold: true,
                    color: {
                        rgb: white
                    }
                },

                fill: {
                    fgColor: {
                        rgb: navy
                    }
                },

                alignment: {
                    horizontal: "left",
                    vertical: "center",
                    indent: 1
                }

            });

        });


        /* =================================================
           MEMBER INFORMATION
        ================================================= */

        const informationRows = [5, 6, 7, 8];

        informationRows.forEach(rowNumber => {

            const rowIndex = rowNumber - 1;

            const labelCells = [

                `A${rowNumber}`,
                `D${rowNumber}`

            ];

            const valueCells = [

                `B${rowNumber}`,
                `E${rowNumber}`

            ];


            labelCells.forEach(address => {

                styleCell(address, {

                    font: {
                        name: "Arial",
                        sz: 9,
                        bold: true,
                        color: {
                            rgb: navy
                        }
                    },

                    fill: {
                        fgColor: {
                            rgb: lightBlue
                        }
                    },

                    alignment: {
                        vertical: "center",
                        wrapText: true
                    },

                    border: thinBorder

                });

            });


            valueCells.forEach(address => {

                styleCell(address, {

                    font: {
                        name: "Arial",
                        sz: 9,
                        color: {
                            rgb: darkText
                        }
                    },

                    alignment: {
                        vertical: "center",
                        wrapText: true
                    },

                    border: thinBorder

                });

            });

        });


        /* =================================================
           TRANSACTION TABLE HEADER
        ================================================= */

        const headerRow = 11;

        const headerCells = [

            "A11",
            "B11",
            "C11",
            "D11",
            "E11"

        ];


        headerCells.forEach(address => {

            styleCell(address, {

                font: {
                    name: "Arial",
                    sz: 10,
                    bold: true,
                    color: {
                        rgb: white
                    }
                },

                fill: {
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

        });


        /* =================================================
           TRANSACTION DATA FORMATTING
        ================================================= */

        const firstDataRow = headerRow + 1;

        const lastDataRow = firstDataRow + rows.length - 1;


        for (
            let rowNumber = firstDataRow;
            rowNumber <= lastDataRow;
            rowNumber++
        ) {

            const excelRow = rowNumber;

            const rowIndex = rowNumber - 1;

            const alternate =
                (rowNumber - firstDataRow) % 2 === 1;


            for (
                let column = 0;
                column < 5;
                column++
            ) {

                const address = XLSX.utils.encode_cell({

                    r: rowIndex,

                    c: column

                });


                const cell = worksheet[address];

                if (!cell) continue;


                cell.s = {

                    font: {

                        name: "Arial",

                        sz: 9,

                        color: {
                            rgb: darkText
                        },

                        bold: column === 3

                    },

                    fill: {

                        fgColor: {

                            rgb: alternate
                                ? lighterBlue
                                : white

                        }

                    },

                    alignment: {

                        vertical: "center",

                        horizontal:
                            column === 3
                                ? "right"
                                : column === 0
                                    ? "center"
                                    : "left",

                        wrapText: true

                    },

                    border: thinBorder

                };


                /* Format amount as Ghana cedis */

                if (column === 3) {

                    cell.t = "n";

                    cell.z = '"GH₵" #,##0.00;[Red]-"GH₵" #,##0.00';

                }

            }


            worksheet["!rows"][rowIndex] = {
                hpt: 23
            };

        }


        /* =================================================
           FOOTER FORMATTING
        ================================================= */

        const footerTitleAddress =
            `A${footerRow + 2}`;

        const footerTextAddress =
            `A${footerRow + 3}`;


        styleCell(footerTitleAddress, {

            font: {
                name: "Arial",
                sz: 9,
                italic: true,
                color: {
                    rgb: mutedText
                }
            },

            alignment: {
                horizontal: "center",
                vertical: "center"
            }

        });


        styleCell(footerTextAddress, {

            font: {
                name: "Arial",
                sz: 9,
                italic: true,
                color: {
                    rgb: mutedText
                }
            },

            alignment: {
                horizontal: "center",
                vertical: "center",
                wrapText: true
            }

        });


        /* =================================================
           EXCEL TABLE FILTER
        ================================================= */

        if (rows.length > 0) {

            worksheet["!autofilter"] = {

                ref: `A11:E${lastDataRow}`

            };

        }


        /* =================================================
           PAGE AND PRINT SETTINGS
        ================================================= */

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


        /* =================================================
           WORKBOOK PROPERTIES
        ================================================= */

        workbook.Props = {

            Title: "NEXUS WEALTH PARTNERS Member Statement",

            Subject: "Official Member Account Transaction Statement",

            Author: "NEXUS WEALTH PARTNERS",

            Company: "NEXUS WEALTH PARTNERS",

            Category: "Member Financial Statements"

        };


        /* =================================================
           ADD WORKSHEET
        ================================================= */

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "Member Statement"

        );


        /* =================================================
           DOWNLOAD FILE
        ================================================= */

        const safeMemberId = getSafeFileName(
            member.member_id
        );


        XLSX.writeFile(

            workbook,

            `NEXUS_Member_Statement_${safeMemberId}.xlsx`,

            {
                bookType: "xlsx",
                cellStyles: true
            }

        );


    } catch (error) {

        console.error(
            "Excel statement export error:",
            error
        );


        showStatementMessage(

            statementMessage,

            error.message ||
                "Could not export the Excel statement.",

            "error"

        );

    }

});



    /* =====================================================
       17. DOWNLOAD PDF STATEMENT
    ===================================================== */

    pdfButton.addEventListener(
        "click",
        function () {

            try {

                if (!window.jspdf?.jsPDF) {

                    throw new Error(
                        "PDF export library is unavailable. Refresh the page and try again."
                    );

                }


                const rows = getStatementExportData();


                const { jsPDF } = window.jspdf;


                const pdf = new jsPDF({

                    orientation: "landscape",

                    unit: "mm",

                    format: "a4"

                });


                pdf.setFont("helvetica", "bold");

                pdf.setFontSize(19);


                pdf.text(

                    "NEXUS WEALTH PARTNERS",

                    14,

                    17

                );


                pdf.setFontSize(12);


                pdf.text(

                    "MEMBER ACCOUNT STATEMENT",

                    14,

                    25

                );


                pdf.setFont("helvetica", "normal");

                pdf.setFontSize(9);


                pdf.text(

                    `Member Name: ${selectedStatementMember.full_name || "—"}`,

                    14,

                    34

                );


                pdf.text(

                    `Member ID: ${selectedStatementMember.member_id || "—"}`,

                    14,

                    40

                );


                pdf.text(

                    `Email: ${selectedStatementMember.email || "—"}`,

                    14,

                    46

                );


                pdf.text(

                    `Phone: ${selectedStatementMember.phone || "—"}`,

                    14,

                    52

                );


                pdf.text(

                    `Account Status: ${selectedStatementMember.account_status || "—"}`,

                    14,

                    58

                );


                pdf.text(

                    `Statement Period: ${getStatementPeriod()}`,

                    150,

                    34

                );


                pdf.text(

                    `Generated: ${formatStatementDate(new Date())}`,

                    150,

                    40

                );


                pdf.text(

                    `Transactions: ${rows.length}`,

                    150,

                    46

                );


                if (typeof pdf.autoTable !== "function") {

                    throw new Error(
                        "PDF table support is unavailable. Refresh the page and try again."
                    );

                }


                pdf.autoTable({

                    startY: 66,

                    head: [[

                        "Date",

                        "Type",

                        "Payment Method",

                        "Amount (GHS)",

                        "Status"

                    ]],


                    body: rows.map(row => [

                        row.Date,

                        row.Type,

                        row["Payment Method"],

                        Number(row.Amount).toFixed(2),

                        row.Status

                    ]),


                    theme: "grid",


                    styles: {

                        font: "helvetica",

                        fontSize: 8,

                        cellPadding: 3

                    },


                    headStyles: {

                        fillColor: [16, 43, 70],

                        textColor: [255, 255, 255],

                        fontStyle: "bold"

                    },


                    alternateRowStyles: {

                        fillColor: [245, 248, 252]

                    },


                    margin: {

                        left: 14,

                        right: 14

                    }

                });


                const safeMemberId =
                    getSafeFileName(
                        selectedStatementMember.member_id
                    );


                pdf.save(

                    `NEXUS_Statement_${safeMemberId}.pdf`

                );


            } catch (error) {

                console.error(
                    "PDF statement export error:",
                    error
                );


                showStatementMessage(

                    statementMessage,

                    error.message ||
                        "Could not export the PDF statement.",

                    "error"

                );

            }

        }
    );


    /* =====================================================
       18. NAVIGATION SUPPORT
    ===================================================== */

    document.querySelectorAll(".nav-button").forEach(button => {

        button.addEventListener(
            "click",
            async function () {

                if (
                    this.dataset.panel !==
                    "memberStatementsPanel"
                ) {

                    return;

                }


                const authorized =
                    await verifyStatementTeller().catch(error => {

                        console.error(
                            "Statement authorization error:",
                            error
                        );

                        return false;

                    });


                if (!authorized) {

                    resetStatementDisplay();


                    showStatementMessage(

                        searchMessage,

                        "Please sign in with an active teller account to access member statements.",

                        "error"

                    );

                }

            }
        );

    });


    /* =====================================================
       19. AUTH SESSION MONITORING
    ===================================================== */

    statementSupabase.auth.onAuthStateChange(
        event => {

            if (event === "SIGNED_OUT") {

                currentStatementTeller = null;

                resetStatementDisplay();

            }

        }
    );


    /* =====================================================
       20. INITIAL STATE
    ===================================================== */

    resetStatementDisplay();


    console.log(
        "NEXUS Member Statements module initialized using the existing teller Supabase client."
    );


})();

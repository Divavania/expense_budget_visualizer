// ========================================
// EXPENSE & BUDGET VISUALIZER
// Local Storage + Monthly Data
// ========================================


// ========================================
// GLOBAL DATA
// ========================================

let currentMonth = "";

let currentData = {
    budget: 0,
    categories: [],
    expenses: []
};


// ========================================
// CHARTS
// ========================================

let expenseCategoryChart = null;
let budgetComparisonChart = null;


// ========================================
// ELEMENTS
// ========================================

const monthInput =
    document.getElementById("month");

const budgetInput =
    document.getElementById("budget");

const saveBudgetButton =
    document.getElementById("saveBudget");

const totalBudgetElement =
    document.getElementById("totalBudget");

const totalExpenseElement =
    document.getElementById("totalExpense");

const remainingBudgetElement =
    document.getElementById("remainingBudget");

const totalAllocatedElement =
    document.getElementById("totalAllocated");

const unallocatedBudgetElement =
    document.getElementById("unallocatedBudget");

const categoryNameInput =
    document.getElementById("categoryName");

const categoryAmountInput =
    document.getElementById("categoryAmount");

const addCategoryButton =
    document.getElementById("addCategory");

const allocationList =
    document.getElementById("allocationList");

const expenseCategorySelect =
    document.getElementById("expenseCategory");

const expenseForm =
    document.getElementById("expenseForm");

const expenseList =
    document.getElementById("expenseList");



// ========================================
// THEME
// ========================================

const themeToggle =
    document.getElementById("themeToggle");

const THEME_KEY =
    "expenseBudgetTheme";


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );

    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        themeToggle.textContent = "☀️";

    } else {

        themeToggle.textContent = "🌙";

    }

}


function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark-mode"
        );

    if (isDark) {

        localStorage.setItem(
            THEME_KEY,
            "dark"
        );

        themeToggle.textContent = "☀️";

    } else {

        localStorage.setItem(
            THEME_KEY,
            "light"
        );

        themeToggle.textContent = "🌙";

    }

}


themeToggle.addEventListener(
    "click",
    toggleTheme
);

loadTheme();


// ========================================
// LOCAL STORAGE
// ========================================

const STORAGE_KEY =
    "expenseBudgetVisualizer";


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(amount) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(amount);

}


// ========================================
// GET ALL DATA
// ========================================

function getAllData() {

    const savedData =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!savedData) {
        return {};
    }

    try {

        return JSON.parse(savedData);

    } catch (error) {

        console.error(
            "Local Storage error:",
            error
        );

        return {};
    }

}


// ========================================
// SAVE ALL DATA
// ========================================

function saveAllData(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


// ========================================
// LOAD MONTH DATA
// ========================================

function loadMonthData(month) {

    currentMonth = month;

    const allData =
        getAllData();

    if (allData[month]) {

        currentData =
            allData[month];

    } else {

        currentData = {
            budget: 0,
            categories: [],
            expenses: []
        };

    }


    budgetInput.value =
        currentData.budget > 0
            ? currentData.budget
            : "";


    renderCategories();

    updateCategorySelect();

    renderExpenses();

    updateSummary();

}


// ========================================
// SAVE CURRENT MONTH
// ========================================

function saveCurrentMonthData() {

    if (!currentMonth) {
        return;
    }

    const allData =
        getAllData();

    allData[currentMonth] =
        currentData;

    saveAllData(allData);

}


// ========================================
// DEFAULT MONTH
// ========================================

function setDefaultMonth() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const defaultMonth =
        `${year}-${month}`;

    monthInput.value =
        defaultMonth;

    loadMonthData(
        defaultMonth
    );

}

setDefaultMonth();


// ========================================
// CHANGE MONTH
// ========================================

monthInput.addEventListener(
    "change",
    function () {

        if (!monthInput.value) {
            return;
        }

        loadMonthData(
            monthInput.value
        );

    }
);


// ========================================
// SAVE BUDGET
// ========================================

saveBudgetButton.addEventListener(
    "click",
    function () {

        const value =
            Number(
                budgetInput.value
            );


        if (value <= 0) {

            alert(
                "Masukkan budget terlebih dahulu."
            );

            return;
        }


        const totalAllocation =
            getTotalAllocation();


        if (totalAllocation > value) {

            alert(
                "Budget tidak boleh lebih kecil dari total alokasi."
            );

            return;
        }


        currentData.budget =
            value;


        saveCurrentMonthData();

        updateSummary();


        alert(
            "Budget berhasil disimpan."
        );

    }
);


// ========================================
// ADD CATEGORY
// ========================================

addCategoryButton.addEventListener(
    "click",
    function () {

        const name =
            categoryNameInput.value.trim();

        const amount =
            Number(
                categoryAmountInput.value
            );


        if (!name) {

            alert(
                "Masukkan nama kategori."
            );

            return;
        }


        if (amount <= 0) {

            alert(
                "Masukkan nominal kategori."
            );

            return;
        }


        const totalAllocation =
            getTotalAllocation();


        if (
            currentData.budget > 0 &&
            totalAllocation + amount >
            currentData.budget
        ) {

            alert(
                "Total alokasi melebihi budget."
            );

            return;
        }


        const category = {

            id: Date.now(),

            name: name,

            amount: amount

        };


        currentData.categories.push(
            category
        );


        saveCurrentMonthData();


        categoryNameInput.value =
            "";

        categoryAmountInput.value =
            "";


        renderCategories();

        updateCategorySelect();

        updateAllocationSummary();

    }
);


// ========================================
// GET TOTAL ALLOCATION
// ========================================

function getTotalAllocation() {

    return currentData.categories.reduce(
        function (total, category) {

            return total + category.amount;

        },
        0
    );

}


// ========================================
// GET CATEGORY EXPENSE
// ========================================

function getCategoryExpense(
    categoryId
) {

    return currentData.expenses.reduce(
        function (total, expense) {

            if (
                expense.categoryId ===
                categoryId
            ) {

                return total +
                    expense.amount;

            }

            return total;

        },
        0
    );

}


// ========================================
// RENDER CATEGORIES
// ========================================

function renderCategories() {

    allocationList.innerHTML =
        "";


    if (
        currentData.categories.length ===
        0
    ) {

        allocationList.innerHTML = `
            <p class="empty-state">
                Belum ada kategori budget.
            </p>
        `;

        updateAllocationSummary();

        return;
    }


    currentData.categories.forEach(
        function (category) {

            const spent =
                getCategoryExpense(
                    category.id
                );


            const remaining =
                category.amount -
                spent;


            let percentage =
                0;


            if (category.amount > 0) {

                percentage =
                    (
                        spent /
                        category.amount
                    ) * 100;

            }


            percentage =
                Math.min(
                    percentage,
                    100
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "allocation-item";


            item.innerHTML = `

                <div class="allocation-info">

                    <strong>
                        ${escapeHTML(
                            category.name
                        )}
                    </strong>

                    <span>
                        Budget:
                        ${formatRupiah(
                            category.amount
                        )}
                    </span>


                    <div class="allocation-progress">

                        <div class="progress-info">

                            <span>
                                Terpakai:
                                ${formatRupiah(
                                    spent
                                )}
                            </span>

                            <span>
                                ${percentage.toFixed(0)}%
                            </span>

                        </div>


                        <div class="progress-bar">

                            <div
                                class="progress-fill"
                                style="width: ${percentage}%"
                            ></div>

                        </div>


                        <div class="category-remaining">

                            Sisa:
                            ${formatRupiah(
                                Math.max(
                                    remaining,
                                    0
                                )
                            )}

                        </div>

                    </div>

                </div>


                <button
                    class="delete-button"
                    onclick="deleteCategory(
                        ${category.id}
                    )"
                >
                    Hapus
                </button>

            `;


            allocationList.appendChild(
                item
            );

        }
    );


    updateAllocationSummary();

}


// ========================================
// DELETE CATEGORY
// ========================================

function deleteCategory(id) {

    const hasExpense =
        currentData.expenses.some(
            function (expense) {

                return (
                    expense.categoryId ===
                    id
                );

            }
        );


    if (hasExpense) {

        const confirmed =
            confirm(
                "Kategori ini sudah memiliki pengeluaran. Tetap hapus kategori?"
            );

        if (!confirmed) {
            return;
        }

    }


    currentData.categories =
        currentData.categories.filter(
            function (category) {

                return (
                    category.id !== id
                );

            }
        );


    saveCurrentMonthData();

    renderCategories();

    updateCategorySelect();

    updateSummary();

}

window.deleteCategory =
    deleteCategory;


// ========================================
// UPDATE CATEGORY SELECT
// ========================================

function updateCategorySelect() {

    expenseCategorySelect.innerHTML = `
        <option value="">
            Pilih kategori
        </option>
    `;


    currentData.categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name;


            expenseCategorySelect.appendChild(
                option
            );

        }
    );

}


// ========================================
// ADD EXPENSE
// ========================================

expenseForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const date =
            document.getElementById(
                "expenseDate"
            ).value;


        const categoryId =
            Number(
                expenseCategorySelect.value
            );


        const amount =
            Number(
                document.getElementById(
                    "expenseAmount"
                ).value
            );


        const note =
            document.getElementById(
                "expenseNote"
            ).value.trim();


        if (!date) {

            alert(
                "Pilih tanggal pengeluaran."
            );

            return;
        }


        if (!categoryId) {

            alert(
                "Pilih kategori pengeluaran."
            );

            return;
        }


        if (amount <= 0) {

            alert(
                "Masukkan nominal pengeluaran."
            );

            return;
        }


        const expense = {

            id: Date.now(),

            date: date,

            categoryId:
                categoryId,

            amount:
                amount,

            note:
                note

        };


        currentData.expenses.push(
            expense
        );


        saveCurrentMonthData();


        expenseForm.reset();


        renderExpenses();

        renderCategories();

        updateSummary();

    }
);


// ========================================
// RENDER EXPENSES
// ========================================

function renderExpenses() {

    expenseList.innerHTML =
        "";


    if (
        currentData.expenses.length ===
        0
    ) {

        expenseList.innerHTML = `
            <p class="empty-state">
                Belum ada pengeluaran.
            </p>
        `;

        return;
    }


    const sortedExpenses =
        [...currentData.expenses]
            .sort(
                function (a, b) {

                    return (
                        new Date(b.date) -
                        new Date(a.date)
                    );

                }
            );


    sortedExpenses.forEach(
        function (expense) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "expense-item";


            const category =
                currentData.categories.find(
                    function (category) {

                        return (
                            category.id ===
                            expense.categoryId
                        );

                    }
                );


            const categoryName =
                category
                    ? category.name
                    : "Kategori dihapus";


            item.innerHTML = `

                <div class="expense-date">

                    ${formatDate(
                        expense.date
                    )}

                </div>


                <div class="expense-info">

                    <strong>
                        ${escapeHTML(
                            categoryName
                        )}
                    </strong>

                    <span>
                        ${
                            expense.note
                                ? escapeHTML(
                                    expense.note
                                )
                                : "Tidak ada catatan"
                        }
                    </span>

                </div>


                <div class="expense-amount">

                    ${formatRupiah(
                        expense.amount
                    )}

                </div>


                <button
                    class="delete-button"
                    onclick="deleteExpense(
                        ${expense.id}
                    )"
                >
                    Hapus
                </button>

            `;


            expenseList.appendChild(
                item
            );

        }
    );

}


// ========================================
// DELETE EXPENSE
// ========================================

function deleteExpense(id) {

    const confirmed =
        confirm(
            "Hapus pengeluaran ini?"
        );


    if (!confirmed) {
        return;
    }


    currentData.expenses =
        currentData.expenses.filter(
            function (expense) {

                return (
                    expense.id !== id
                );

            }
        );


    saveCurrentMonthData();


    renderExpenses();

    renderCategories();

    updateSummary();

}

window.deleteExpense =
    deleteExpense;


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary() {

    const totalExpense =
        currentData.expenses.reduce(
            function (total, expense) {

                return (
                    total +
                    expense.amount
                );

            },
            0
        );


    const remaining =
        currentData.budget -
        totalExpense;


    totalBudgetElement.textContent =
        formatRupiah(
            currentData.budget
        );


    totalExpenseElement.textContent =
        formatRupiah(
            totalExpense
        );


    remainingBudgetElement.textContent =
        formatRupiah(
            remaining
        );


    updateAllocationSummary();

    updateCharts();
}


// ========================================
// UPDATE ALLOCATION SUMMARY
// ========================================

function updateAllocationSummary() {

    if (
        !totalAllocatedElement ||
        !unallocatedBudgetElement
    ) {
        return;
    }


    const totalAllocated =
        getTotalAllocation();


    const unallocated =
        currentData.budget -
        totalAllocated;


    totalAllocatedElement.textContent =
        formatRupiah(
            totalAllocated
        );


    unallocatedBudgetElement.textContent =
        formatRupiah(
            Math.max(
                unallocated,
                0
            )
        );

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ========================================
// UPDATE CHARTS
// ========================================

function updateCharts() {

    if (
        typeof Chart === "undefined"
    ) {
        return;
    }

    updateExpenseCategoryChart();

    updateBudgetComparisonChart();

}


// ========================================
// EXPENSE CATEGORY CHART
// ========================================

function updateExpenseCategoryChart() {

    const canvas =
        document.getElementById(
            "expenseCategoryChart"
        );

    if (!canvas) {
        return;
    }


    const labels = [];

    const values = [];


    currentData.categories.forEach(
        function (category) {

            const spent =
                getCategoryExpense(
                    category.id
                );


            if (spent > 0) {

                labels.push(
                    category.name
                );

                values.push(
                    spent
                );

            }

        }
    );


    if (expenseCategoryChart) {

        expenseCategoryChart.destroy();

    }


    expenseCategoryChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            data: values
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " " +
                                            formatRupiah(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// ========================================
// BUDGET VS EXPENSE CHART
// ========================================

function updateBudgetComparisonChart() {

    const canvas =
        document.getElementById(
            "budgetComparisonChart"
        );

    if (!canvas) {
        return;
    }


    const labels = [];

    const budgets = [];

    const expenses = [];


    currentData.categories.forEach(
        function (category) {

            labels.push(
                category.name
            );

            budgets.push(
                category.amount
            );

            expenses.push(
                getCategoryExpense(
                    category.id
                )
            );

        }
    );


    if (budgetComparisonChart) {

        budgetComparisonChart.destroy();

    }


    budgetComparisonChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label: "Budget",

                            data: budgets
                        },

                        {
                            label:
                                "Pengeluaran",

                            data: expenses
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    function (
                                        value
                                    ) {

                                        return formatRupiah(
                                            value
                                        );

                                    }

                            }

                        }

                    },

                    plugins: {

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " " +
                                            formatRupiah(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}
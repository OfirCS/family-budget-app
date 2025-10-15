/**
 * Analytics Engine
 * Provides insights and reports on family spending
 */

function generateMonthlyReport(state, month) {
  const monthExpenses = state.expenses.filter(e => e.date.startsWith(month));
  const monthBudgets = state.budgets.filter(b => b.month === month);

  // Build report by category
  const categories = {};
  const userStats = {};

  for (const expense of monthExpenses) {
    const user = state.users.find(u => u.id === expense.userId);
    const userName = user ? user.name : 'Unknown';

    // Category stats
    if (!categories[expense.category]) {
      categories[expense.category] = {
        spent: 0,
        count: 0,
        budget: monthBudgets.find(b => b.category === expense.category)?.limit || 0,
      };
    }
    categories[expense.category].spent += expense.amount;
    categories[expense.category].count += 1;

    // User stats
    if (!userStats[userName]) {
      userStats[userName] = { spent: 0, count: 0 };
    }
    userStats[userName].spent += expense.amount;
    userStats[userName].count += 1;
  }

  return { categories, userStats, monthExpenses };
}

function generateDetailedReport(state, month) {
  const report = generateMonthlyReport(state, month);
  const { categories, userStats } = report;

  let text = `📊 DETAILED REPORT - ${month}\n\n`;

  // Total summary
  const totalSpent = Object.values(categories).reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = Object.values(categories).reduce((sum, c) => sum + c.budget, 0);

  text += `💰 TOTAL SPENDING\n`;
  text += `   Spent: $${totalSpent.toFixed(2)}\n`;
  text += `   Budget: $${totalBudget.toFixed(2)}\n`;
  text += `   Balance: $${(totalBudget - totalSpent).toFixed(2)}\n\n`;

  // Category breakdown
  text += `📂 BY CATEGORY\n`;
  for (const [cat, data] of Object.entries(categories).sort()) {
    const percentage = data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : 0;
    const status = data.spent > data.budget ? '🔴' : data.spent > data.budget * 0.8 ? '🟡' : '🟢';

    text += `\n${status} ${cat}\n`;
    text += `   Spent: $${data.spent.toFixed(2)} / $${data.budget.toFixed(2)}\n`;
    text += `   Progress: ${percentage}%\n`;
    text += `   Transactions: ${data.count}\n`;
  }

  // Family breakdown
  text += `\n👥 BY FAMILY MEMBER\n`;
  for (const [name, data] of Object.entries(userStats).sort()) {
    text += `   ${name}: $${data.spent.toFixed(2)} (${data.count} transactions)\n`;
  }

  return text;
}

function generateQuickStats(state, month) {
  const report = generateMonthlyReport(state, month);
  const { categories, userStats } = report;

  const totalSpent = Object.values(categories).reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = Object.values(categories).reduce((sum, c) => sum + c.budget, 0);
  const percentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    totalSpent: totalSpent.toFixed(2),
    totalBudget: totalBudget.toFixed(2),
    remaining: (totalBudget - totalSpent).toFixed(2),
    percentUsed,
    categories,
    userStats,
  };
}

function getAlerts(state, month) {
  const report = generateMonthlyReport(state, month);
  const alerts = [];

  for (const [cat, data] of Object.entries(report.categories)) {
    if (data.budget > 0) {
      const percentage = (data.spent / data.budget) * 100;

      if (percentage > 100) {
        alerts.push(`🔴 ${cat} is over budget by $${(data.spent - data.budget).toFixed(2)}!`);
      } else if (percentage > 80) {
        alerts.push(`🟡 ${cat} is at ${Math.round(percentage)}% of budget`);
      }
    }
  }

  return alerts;
}

function getTopCategories(state, month, limit = 3) {
  const report = generateMonthlyReport(state, month);
  const categories = Object.entries(report.categories)
    .sort((a, b) => b[1].spent - a[1].spent)
    .slice(0, limit);

  return categories;
}

function getTopSpenders(state, month, limit = 3) {
  const report = generateMonthlyReport(state, month);
  const spenders = Object.entries(report.userStats)
    .sort((a, b) => b[1].spent - a[1].spent)
    .slice(0, limit);

  return spenders;
}

module.exports = {
  generateMonthlyReport,
  generateDetailedReport,
  generateQuickStats,
  getAlerts,
  getTopCategories,
  getTopSpenders,
};

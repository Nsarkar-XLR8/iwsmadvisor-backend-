// src/entities/adminDashboard/adminDashboard.service.js
import Contact from '../contact/contact.model.js';
import ServicePage from '../servicePage/servicePage.model.js';

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const getServiceOptions = async () => {
  const titles = await ServicePage.distinct('title', { title: { $exists: true, $ne: '' } });
  return titles.map((t) => String(t).trim()).filter((t) => t.length > 0);
};

// Returns contact counts per month for the chosen range, grouped by year.
// Defaults to last 24 months. You can filter by:
// - year: specific calendar year
// - from/to: date range (ISO or parseable date strings)
export const getContactMonthlyStatsService = async ({ year, from, to } = {}) => {
  const now = new Date();
  const targetYear = Number.isFinite(Number(year)) ? Number(year) : null;

  let startDate;
  let endDate;

  if (targetYear !== null) {
    startDate = new Date(targetYear, 0, 1);
    endDate = new Date(targetYear + 1, 0, 1);
  } else if (from || to) {
    startDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 23, 1);
    endDate = to ? new Date(to) : now;
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth() - 23, 1);
    endDate = now;
  }

  // Ensure endDate is at end of day for inclusive filtering when provided
  endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);

  const aggregated = await Contact.aggregate([
    { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const statsByYear = {};

  // Initialize months in range to 0
  const monthsToInit = (() => {
    // Calculate months between startDate (inclusive) and endDate (exclusive)
    return Math.max(
      1,
      (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
    );
  })();

  for (let i = 0; i < monthsToInit; i += 1) {
    const current = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const yearVal = current.getFullYear();
    const monthKey = MONTH_KEYS[current.getMonth()];
    if (!statsByYear[yearVal]) statsByYear[yearVal] = {};
    statsByYear[yearVal][monthKey] = 0;
  }

  aggregated.forEach(({ _id, count }) => {
    const year = _id.year;
    const monthKey = MONTH_KEYS[_id.month - 1];
    if (!statsByYear[year]) statsByYear[year] = {};
    statsByYear[year][monthKey] = count;
  });

  return { data: statsByYear };
};

// Returns per-service counts and percentages per month for the chosen range.
// Defaults to last 24 months. Supports year OR from/to.
export const getContactServiceStatsService = async ({ year, from, to } = {}) => {
  const now = new Date();
  const targetYear = Number.isFinite(Number(year)) ? Number(year) : null;

  let startDate;
  let endDate;

  if (targetYear !== null) {
    startDate = new Date(targetYear, 0, 1);
    endDate = new Date(targetYear + 1, 0, 1);
  } else if (from || to) {
    startDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 23, 1);
    endDate = to ? new Date(to) : now;
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth() - 23, 1);
    endDate = now;
  }

  endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);

  const aggregated = await Contact.aggregate([
    { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          service: '$service',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const statsByYear = {};
  const baseServices = await getServiceOptions();
  const serviceSet = new Set(baseServices);

  const monthsToInit = Math.max(
    1,
    (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
  );

  // Initialize structure with zeros for all known services
  for (let i = 0; i < monthsToInit; i += 1) {
    const current = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const yearVal = current.getFullYear();
    const monthKey = MONTH_KEYS[current.getMonth()];
    if (!statsByYear[yearVal]) statsByYear[yearVal] = {};
    if (!statsByYear[yearVal][monthKey]) {
      statsByYear[yearVal][monthKey] = {
        counts: {},
        percentages: {},
        total: 0,
      };
    }
    baseServices.forEach((svc) => {
      statsByYear[yearVal][monthKey].counts[svc] = 0;
      statsByYear[yearVal][monthKey].percentages[svc] = 0;
    });
  }

  // Fill counts
  aggregated.forEach(({ _id, count }) => {
    const yearVal = _id.year;
    const monthKey = MONTH_KEYS[_id.month - 1];
    const service = _id.service;
    if (!statsByYear[yearVal]) statsByYear[yearVal] = {};
    if (!statsByYear[yearVal][monthKey]) {
      statsByYear[yearVal][monthKey] = { counts: {}, percentages: {}, total: 0 };
    }
    if (!serviceSet.has(service)) {
      serviceSet.add(service);
      statsByYear[yearVal][monthKey].counts[service] = 0;
      statsByYear[yearVal][monthKey].percentages[service] = 0;
    }
    statsByYear[yearVal][monthKey].counts[service] = count;
  });

  // Compute totals and percentages
  Object.keys(statsByYear).forEach((yearKey) => {
    const months = statsByYear[yearKey];
    Object.keys(months).forEach((monthKey) => {
      const monthEntry = months[monthKey];
      const servicesForMonth = Object.keys(monthEntry.counts);
      const total = servicesForMonth.reduce((sum, svc) => sum + (monthEntry.counts[svc] || 0), 0);
      monthEntry.total = total;
      servicesForMonth.forEach((svc) => {
        const pct = total > 0 ? (monthEntry.counts[svc] / total) * 100 : 0;
        monthEntry.percentages[svc] = Number(pct.toFixed(2));
      });
    });
  });

  return { data: statsByYear };
};

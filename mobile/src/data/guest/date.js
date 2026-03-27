export const nowIso = () => new Date().toISOString();

export const startOfMonthIso = (year, month) => {
    const date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    return date.toISOString();
};

export const endOfMonthIso = (year, month) => {
    const date = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return date.toISOString();
};

export const getYearMonthParts = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(value);
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
    };
};

export const buildPeriod = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

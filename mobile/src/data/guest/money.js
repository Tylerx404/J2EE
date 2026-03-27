const normalizeMoneyInput = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    return String(value).replace(/,/g, '').trim();
};

const splitDecimal = (value) => {
    const normalized = normalizeMoneyInput(value);
    const negative = normalized.startsWith('-');
    const unsigned = negative ? normalized.slice(1) : normalized;
    const [wholeRaw = '0', decimalRaw = ''] = unsigned.split('.');
    const whole = wholeRaw.replace(/\D/g, '') || '0';
    const decimal = `${decimalRaw.replace(/\D/g, '')}00`.slice(0, 2);
    const absoluteCents = BigInt(whole) * 100n + BigInt(decimal);
    return {
        negative,
        cents: negative ? -absoluteCents : absoluteCents,
    };
};

const centsToMoneyString = (cents) => {
    const negative = cents < 0n;
    const absolute = negative ? -cents : cents;
    const whole = absolute / 100n;
    const decimal = absolute % 100n;
    const suffix = decimal === 0n ? '' : `.${decimal.toString().padStart(2, '0')}`;
    return `${negative ? '-' : ''}${whole.toString()}${suffix}`;
};

export const moneyToNumber = (value) => Number(normalizeMoneyInput(value));

export const addMoney = (left, right) => {
    const result = splitDecimal(left).cents + splitDecimal(right).cents;
    return centsToMoneyString(result);
};

export const subtractMoney = (left, right) => {
    const result = splitDecimal(left).cents - splitDecimal(right).cents;
    return centsToMoneyString(result);
};

export const compareMoney = (left, right) => {
    const result = splitDecimal(left).cents - splitDecimal(right).cents;
    if (result === 0n) return 0;
    return result > 0n ? 1 : -1;
};

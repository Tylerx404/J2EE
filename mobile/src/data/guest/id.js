export const createLocalId = (prefix) => {
    const stamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${stamp}_${random}`;
};

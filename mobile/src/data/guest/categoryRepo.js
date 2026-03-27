import { initGuestDb, runInDbTransaction } from './guestDb';
import { createLocalId } from './id';
import { nowIso } from './date';
import { mapCategoryRowToResponse } from './mappers';
import { assertCategoryDeletionAllowed } from './rules';

const CATEGORY_SELECT = `
SELECT
    local_id,
    name,
    type,
    icon,
    is_default,
    created_at,
    updated_at
FROM categories
`;

export const listCategoriesLocal = async (type) => {
    const db = await initGuestDb();
    const rows = type
        ? await db.getAllAsync(`${CATEGORY_SELECT} WHERE type = ? ORDER BY is_default DESC, name ASC`, type)
        : await db.getAllAsync(`${CATEGORY_SELECT} ORDER BY is_default DESC, name ASC`);
    return rows.map(mapCategoryRowToResponse);
};

export const getCategoryByIdLocal = async (id) => {
    const db = await initGuestDb();
    const row = await db.getFirstAsync(`${CATEGORY_SELECT} WHERE local_id = ?`, id);
    if (!row) {
        throw new Error('Category khong ton tai.');
    }
    return mapCategoryRowToResponse(row);
};

export const createCategoryLocal = async ({ name, type, icon }) => {
    const localId = createLocalId('category');
    const timestamp = nowIso();

    await runInDbTransaction(async (db) => {
        await db.runAsync(
            `
            INSERT INTO categories (
                local_id,
                name,
                type,
                icon,
                is_default,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, 0, ?, ?)
            `,
            localId,
            name,
            type,
            icon,
            timestamp,
            timestamp
        );
    });

    return getCategoryByIdLocal(localId);
};

export const deleteCategoryLocal = async (id) => {
    await runInDbTransaction(async (db) => {
        const category = await db.getFirstAsync(`${CATEGORY_SELECT} WHERE local_id = ?`, id);
        if (!category) {
            throw new Error('Category khong ton tai.');
        }
        assertCategoryDeletionAllowed({ isDefault: Boolean(category.is_default) });
        await db.runAsync('DELETE FROM categories WHERE local_id = ?', id);
    });
};

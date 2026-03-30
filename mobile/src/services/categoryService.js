import {
  createCategoryOnApi,
  deleteCategoryOnApi,
  getCategoriesFromApi,
  getCategoryByIdFromApi,
} from '../data/api/categoryApi';
import {
  createCategoryLocal,
  deleteCategoryLocal,
  getCategoryByIdLocal,
  listCategoriesLocal,
} from '../data/guest/categoryRepo';
import { getSessionMode, SESSION_MODES } from './sessionService';

const useGuestCategories = async () => (await getSessionMode()) === SESSION_MODES.GUEST;

export const getCategories = async (type) => (
  await useGuestCategories() ? listCategoriesLocal(type) : getCategoriesFromApi(type)
);

export const getCategoryById = async (id) => (
  await useGuestCategories() ? getCategoryByIdLocal(id) : getCategoryByIdFromApi(id)
);

export const createCategory = async ({ name, type, icon }) => (
  await useGuestCategories()
    ? createCategoryLocal({ name, type, icon })
    : createCategoryOnApi({ name, type, icon })
);

export const deleteCategory = async (id) => (
  await useGuestCategories() ? deleteCategoryLocal(id) : deleteCategoryOnApi(id)
);

export const getCategoriesFromBackend = getCategories;
export const getCategoryByIdFromBackend = getCategoryById;
export const createCategoryOnBackend = createCategory;
export const deleteCategoryOnBackend = deleteCategory;

export const API_ENDPOINT = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        CHANGE_PASSWORD: "/api/auth/reset"
    },
    ADDRESS: {
        ADD: "/api/address/add",
        GET_ALL: "/api/address",
        GET_ONE: (id) => `/api/address/${id}`,
        UPDATE: (id) => `/api/address/${id}`
    },
    MERCHANT: {
        ADD: "/api/merchant/add",
    },
    BRAND: {
        ADD: "/api/brand/add",
        LIST: '/api/brand/list',
        GET_ALL: '/api/brand',
        LIST_SELECT: '/api/brand/list/select',
        UPDATE: (id) => `/api/brand/${id}`
    },
    CATEGORY: {
        ADD: '/api/category/add',
        GET_ALL: '/api/category',
        GET_BY_ID: (id) => `/api/category/${id}`,
        UPDATE: (id) => `/api/category${id}`,
    },
    PRODUCT: {
        ADD: '/api/product/add',
        GET_ALL: '/api/product', 
        GET_BY_ID: (id) => `/api/product/${id}`,
        UPDATE: (id) => `/api/product/${id}`,
        ITEM: (slug) => `/api/product/item/${slug}`,
        STORE_LIST: '/api/product/list',
        SELECT: '/api/product/list/select',
    },
    CART: {
        ADD: "/api/cart/add",
        ADD_PRODUCT: (cartId) => `/api/cart/add/${cartId}`
    }
}
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
    }
}
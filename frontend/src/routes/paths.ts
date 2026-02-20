export const ROUTE_ACCESS: any = {
    PUBLIC: "public",
    PRIVATE: "private",
    PUBLIC_REDIRECT_IF_AUTH:"public-redirect-if-auth"
}


export const ROUTE_PATHS = {
    DEFAULT: "/",
    LOGIN : '/login',
    REGISTER: "/register",
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    DASHBOARD: "/main/dashboard",
    PROFILE: "/main/profile",
    USER_PROFILE: "/main/user",
    BOARD_PROFILE: "/main/board",
    POST_DETAIL: "/main/post",
    SETTINGS: "/main/settings",
    ABOUT: "/main/about",
    DUMMY_EXAMPLE : "/main/dummy-example",
    CREATE_POST: "/main/create-post",
    HOME: "/main/home",
    EYE_MASKING: "/main/eye-masking",


    // AdminRoutes
    ADMIN_USERS: "/admin/users",
    ADMIN_USER_DETAIL: "/admin/users",
    ADMIN_POSTS: "/admin/posts",
    ADMIN_COMMENTS: "/admin/comments",
    ADMIN_BOARDS: "/admin/boards",
    ADMIN_BOARD_CATEGORIES: "/admin/board-categories",
    ADMIN_EYE_MASKING: "/admin/eye-masking",
    ADMIN_REPORTS: "/admin/reports",
    ADMIN_BLOCKS: "/admin/blocks",
    ADMIN_MEMBERSHIPS: "/admin/memberships"
}
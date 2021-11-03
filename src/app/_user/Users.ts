export interface User {
        userID: string;
        fullname: string;
        email: string;
        username: string;
        badge: string;
        token?: string;

        isLoggedIn?: boolean;

        role: UserRole;
    }


export enum UserRole {
    User = 'User',
    Admin = 'Admin'
}
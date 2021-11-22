export interface User {
        userID: string;
        fullname: string;
        email: string;
        username: string;
        badge: string;
        token?: string;

        isLoggedIn?: boolean;

        ruolo: UserRole;
    }


export enum UserRole {
    //User = 'User',
    //Admin = 'Admin',
    
    Alunno = 1,
    Genitore = 2,
    Docente = 3,
    Segreteria=4,

    Admin = 9

}
import bcrypt from "bcrypt";

export const Crypt = {
    crypt_password: (password: string) =>
        bcrypt
            .genSalt(15)
            .then((salt) => bcrypt.hash(password, salt))
            .then((hash) => hash),

    compare_password: (password: string, hashPassword: string) =>
        bcrypt.compare(password, hashPassword).then((resp) => resp),
};

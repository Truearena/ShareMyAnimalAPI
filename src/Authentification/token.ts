import jsonwebtoken from "jsonwebtoken";
import { IUser } from "./models";

export const Token = {
    generate_access_token: async (user: IUser) => {
        console.log(process.env.ACCESS_TOKEN_SECRET);
        return await jsonwebtoken.sign(
            { _id: user._id!.toString() },
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "1800s",
            }
        );
    },
    generate_refresh_token: async (user: IUser) => {
        return await jsonwebtoken.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "5 days",
            }
        );
    },
    // decode_token: async (token: string, key: string) => {
    //     if (token == undefined) {
    //         throw new GraphQLError(CustomErrorMessage.NO_AUTHORIZATION, {
    //             extensions: {
    //                 status: StatusCodes.FORBIDDEN,
    //                 error: ReasonPhrases.FORBIDDEN,
    //                 field: "Authorization",
    //             },
    //         });
    //     }
    //     const token_section = token.split(" ");
    //     if (token_section.length != 2 || token_section[0] != "Bearer") {
    //         throw new GraphQLError(CustomErrorMessage.INVALID_TOKEN, {
    //             extensions: {
    //                 status: StatusCodes.FORBIDDEN,
    //                 error: ReasonPhrases.FORBIDDEN,
    //                 field: "Authorization",
    //             },
    //         });
    //     } else {
    //         if (jsonwebtoken.verify(token_section[1], key as string)) {
    //             const decodedToken = jsonwebtoken.decode(token_section[1], {
    //                 complete: true,
    //             });
    //             return decodedToken;
    //         } else {
    //             throw new GraphQLError(CustomErrorMessage.INVALID_TOKEN, {
    //                 extensions: {
    //                     status: StatusCodes.FORBIDDEN,
    //                     error: ReasonPhrases.FORBIDDEN,
    //                     field: "Authorization",
    //                 },
    //             });
    //         }
    //     }
    // },
};
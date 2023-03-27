import FacebookProvider from 'next-auth/providers/facebook';
import NextAuth from "next-auth/next";

export const authOptions = {
    providers: [
        FacebookProvider({
            clientId: process.env.FACEBOOK_ID,
            clientSecret: process.env.FACEBOOK_SECRET
        }),
    ],
    pages: {
        signIn: "/auth/signin"
    }
}

export default NextAuth(authOptions)

//export default (req, res) => NextAuth(req, res, options)
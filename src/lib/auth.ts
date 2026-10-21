import NextAuth, {CredentialsSignin} from "next-auth";
import {JWT} from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import {loginSchema} from "@/types/schemas/auth.schema";
import {googleLogin, login, refreshSessionTokens} from "@/services/auth.service";
import {LoginData, SwitchOrgData} from "@/types/auth.types";
import {Role} from "@/types/common.type";
import Google from "@auth/core/providers/google";


export class AccountDeactivatedError extends CredentialsSignin {
  code = "AccountDeactivated";
}

declare module "next-auth" {
   interface Session {
    user: {
      userId: string;
      fullName: string;
      avatar: string;
      email: string;
      role: Role;
      province: string;
      accessToken: string;
      refreshToken: string;
      orgId: string | null;
      orgName: string | null;
      logo: string | null;
    };
  }

  export interface User {
    userId: string;
    fullName: string;
    avatar: string | null;
    email: string;
    role: Role;
    province: string;
    accessToken: string;
    refreshToken: string;
    orgId: string | null;
    orgName: string | null;
    logo: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    fullName: string;
    avatar: string | null;
    email: string;
    role: Role;
    province: string;
    accessToken: string;
    refreshToken: string;
    orgId: string | null;
    orgName: string | null;
    logo: string | null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function isSwitchOrgData(
  data: LoginData | SwitchOrgData,
): data is SwitchOrgData {
  return "orgName" in data;
}

function applyTokenData(token: JWT, data: LoginData | SwitchOrgData): JWT {
  if (isSwitchOrgData(data)) {
    return {
      ...token,
      accessToken: data.token,
      refreshToken: data.refreshToken,
      orgId: data.orgId,
      orgName: data.orgName,
      logo: data.logo ?? null,
    };
  }

  return {
    ...token,
    userId: data.userId,
    fullName: (data as LoginData).fullName ?? "",
    avatar: (data as LoginData).avatar ?? null,
    email: data.email ?? "",
    role: data.role,
    province: data.province,
    accessToken: data.token,
    refreshToken: data.refreshToken,
    orgId: data.orgId ?? null,
    orgName: null,
    logo: null,
  };
}

const googleSignInBridge = new Map<string, LoginData>();
const refreshInProgress = new Map<string, Promise<JWT | null>>();

async function doTokenRefresh(token: JWT): Promise<JWT | null> {
  const refreshed = await refreshSessionTokens(token.refreshToken);
  if (!refreshed) return null;

  return {
    ...token,
    accessToken: refreshed.token,
    refreshToken: refreshed.refreshToken,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {

          return null;
        }

        try {
          const response = await login(parsed.data);


          if (!response.data) {

            return null;
          }

          const data: LoginData = response.data;
          return {
            id: data.userId,
            userId: data.userId,
            fullName: data.fullName ?? "",
            avatar: data.avatar ?? null,
            email: data.email ?? "",
            role: data.role,
            province: data.province,
            accessToken: data.token,
            refreshToken: data.refreshToken,
            orgId: null,
            orgName: null,
            logo: null,
          };
        } catch (err) {
          if (err instanceof Response && err.status === 410) {
            throw new AccountDeactivatedError();
          }
          console.error("[authorize] Backend call failed:", err);
          return null;
        }
      },
    }),

    Google({
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET!,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.type === "credentials") return true;

      if (account?.provider === "google" && account.id_token) {
        try {
          const response = await googleLogin({ idToken: account.id_token });

          if (!response.data) {

            return false;
          }


          if (user.id) {
            googleSignInBridge.set(user.id, response.data);
          }
          return true;
        } catch (err) {
          console.error("[signIn] googleLogin threw:", err); // ← add err param
          return false;
        }
      }
      return false;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (user && account?.type === "credentials") {
        return applyTokenData(token, {
          token: user.accessToken,
          refreshToken: user.refreshToken,
          userId: user.userId,
          fullName: user.fullName,
          avatar: user.avatar,
          email: user.email,
          role: user.role,
          province: user.province,
        } as LoginData);
      }

      if (account?.provider === "google" && user.id) {
        const springData = googleSignInBridge.get(user.id);
        if (springData) {
          googleSignInBridge.delete(user.id);
          return applyTokenData(token, springData);
        }
        return token;
      }

      if (trigger === "update" && session?.user) {
        return {
          ...token,
          accessToken: session.user.accessToken as string,
          refreshToken:
            (session.user.refreshToken as string) ?? token.refreshToken,
          orgId: (session.user.orgId as string | null) ?? null,
          orgName: (session.user.orgName as string | null) ?? null,
          logo: (session.user.logo as string | null) ?? null,
        };
      }
      if (token.accessToken && isTokenExpired(token.accessToken)) {


        const key = token.refreshToken as string;

        if (refreshInProgress.has(key)) {
          return refreshInProgress.get(key)!;
        }

        const refreshPromise = doTokenRefresh(token).finally(() => {
          refreshInProgress.delete(key);
        });

        refreshInProgress.set(key, refreshPromise);

        return refreshPromise;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          userId: token.userId,
          fullName: token.fullName,
          avatar: token.avatar as string,
          email: token.email,
          role: token.role,
          province: token.province,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          orgId: token.orgId ?? null,
          orgName: token.orgName ?? null,
          logo: token.logo ?? null,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

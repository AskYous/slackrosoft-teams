import type { Account, Session } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import AzureProvider from "next-auth/providers/azure-ad";

const { AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID } = process.env;

if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET)
  throw Error("Missing auth env vars");

const scope = "openid profile email User.Read Chat.ReadWrite Presence.Read.All";

export const authOptions = {
  providers: [
    AzureProvider({
      clientId: AZURE_CLIENT_ID,
      clientSecret: AZURE_CLIENT_SECRET,
      tenantId: AZURE_TENANT_ID,
      authorization: {
        params: {
          scope,
        },
      },
    }),
  ],
  callbacks: {
    // Note: Ensure the JWT type is augmented elsewhere (e.g., next-auth.d.ts)
    // to include the 'accessToken' property for type safety.
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        if (!account.access_token)
          throw new Error("No access token found");
        token.accessToken = account.access_token;
      }
      return token;
    },
    // Note: Ensure the Session type is augmented elsewhere (e.g., next-auth.d.ts)
    // to include the 'accessToken' property for type safety.
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client, such as an access_token from a provider.
      // The type assertion acknowledges the intention to add accessToken,
      // assuming the Session type will be augmented appropriately elsewhere.
      session.accessToken = String(token.accessToken);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

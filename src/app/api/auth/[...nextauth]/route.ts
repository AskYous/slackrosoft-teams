import NextAuth from "next-auth";
import AzureProvider from "next-auth/providers/azure-ad";

const { AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID } = process.env;
if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET)
  throw Error("Missing auth env vars");

const handler = NextAuth({
  providers: [
    AzureProvider({
      clientId: AZURE_CLIENT_ID,
      clientSecret: AZURE_CLIENT_SECRET,
      tenantId: AZURE_TENANT_ID,
    }),
    // ...add more providers here
  ],
});

export { handler as GET, handler as POST };

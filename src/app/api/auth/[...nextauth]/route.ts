import { login } from "@/services/authService";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        senha: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        try {
          const data = await login(credentials.email, credentials.senha);
          console.log("Dados do Backend:", data);

          if (data && data.token) {
            return {
              id: data.id.toString(),
              name: data.nome,
              email: data.email,
              role: data.role,
              accessToken: data.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Erro no authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                nome: user.name,
                googleId: user.id,
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();

            (user as any).accessToken = data.token;
            (user as any).role = data.role;
            (user as any).id = data.id;
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      }
      return true;
    },

    // Passa o token do backend para a sessão do Next.js
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
      }
      return token;
    },

    // Torna o token acessível no lado do cliente (useSession)
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Onde está seu formulário customizado
  },
  session: {
    strategy: "jwt", // Uso de cookies criptografados
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      phone: string
      role: string
    }
  }

  interface User {
    phone: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    phone: string
    role: string
  }
}

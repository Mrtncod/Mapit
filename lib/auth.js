import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db/pool";
import { sendEmail } from "./email";
import { APIError } from "better-auth/api";
import { query } from "./db";

async function safeSend(options) {
  try {
    await sendEmail(options);
    console.info("Email sent successfully.");
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err;
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: pool,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }) => {
      await safeSend({
        to: user.email,
        subject: "Reset your Mapit password",
        text: `Hi ${user.name},\n\nReset your password here:\n${url}\n\nIf you didn't ask for this, ignore this email.`,
      });
    },
  },

  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const rows = await query(`SELECT "isAdmin" FROM "user" WHERE id = $1`, [
          user.id,
        ]);

        if (rows[0]?.isAdmin) {
          throw new APIError("BAD_REQUEST", {
            message: "Admin accounts can't be deleted here.",
          });
        }
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      await safeSend({
        to: user.email,
        subject: "Verify your Mapit email",
        text: `Hi ${user.name},\n\nConfirm your email here:\n${url}\n\nIf you didn't sign up, ignore this email.`,
      });
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 3600, max: 5 },
      "/request-password-reset": { window: 3600, max: 5 },
      "/delete-user": { window: 3600, max: 5 },
    },
  },

  plugins: [nextCookies()], // must stay last
});

// import { betterAuth } from "better-auth";
// import { nextCookies } from "better-auth/next-js";
// import { pool } from "./db/pool";
// import { sendEmail } from "./email";

// export const auth = betterAuth({
//   database: pool,
//   emailAndPassword: {
//     enabled: true,
//     requireEmailVerification: true,
//     sendResetPassword: async ({ user, url }) => {
//       void sendEmail({ ... }).catch((err) => console.error("Email failed:", err));
//       // void sendEmail({
//       //   to: user.email,
//       //   subject: "Reset your Mapit password",
//       //   text: `Hi ${user.name},\n\nReset your password here:\n${url}\n\nIf you didn't ask for this, ignore this email.`,
//       // });
//     },
//   },
//   emailVerification: {
//     sendOnSignUp: true,
//     autoSignInAfterVerification: true,
//     sendVerificationEmail: async ({ user, url }) => {
//       void sendEmail({ ... }).catch((err) => console.error("Email failed:", err));
//       // void sendEmail({
//       //   to: user.email,
//       //   subject: "Verify your Mapit email",
//       //   text: `Hi ${user.name},\n\nConfirm your email here:\n${url}\n\nIf you didn't sign up, ignore this email.`,
//       // });
//     },
//   },
//   rateLimit: {
//     enabled: true,
//     storage: "database",
//     window: 60,
//     max: 100,
//     customRules: {
//       "/sign-in/email": { window: 60, max: 5 },
//       "/sign-up/email": { window: 3600, max: 5 },
//       "/request-password-reset": { window: 3600, max: 5 }, // new
//     },
//   },
//   plugins: [nextCookies()], // must stay last
// });

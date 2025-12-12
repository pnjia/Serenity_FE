import "dotenv/config";

const requiredEnv = ["JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
  }
});

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || "changeme",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  tokenExpiresIn: "2h",
};

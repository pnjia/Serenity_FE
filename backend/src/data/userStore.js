import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "users.json");

const readUsers = async () => {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_PATH, "[]", "utf-8");
      return [];
    }
    console.error("Failed to read users file", error);
    throw error;
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2));
};

export const UserStore = {
  async getAll() {
    return readUsers();
  },
  async findByEmail(email) {
    const users = await readUsers();
    return users.find((user) => user.email === email) || null;
  },
  async create(user) {
    const users = await readUsers();
    users.push(user);
    await writeUsers(users);
    return user;
  },
  async update(user) {
    const users = await readUsers();
    const idx = users.findIndex((entry) => entry.id === user.id);
    if (idx === -1) {
      throw new Error("Pengguna tidak ditemukan untuk pembaruan");
    }
    users[idx] = user;
    await writeUsers(users);
    return user;
  },
};

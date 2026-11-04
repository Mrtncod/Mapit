import "server-only";
import { pool } from "./pool";

export { pool };

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}

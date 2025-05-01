// actions.ts
"use server";

import { conn } from "./libs/mysql";

/**
 * Busca un RUC en la base de datos
 * @param ruc - El número de RUC a buscar (corresponde al campo 'login' en la tabla)
 */
export async function searchRuc(ruc: string) {
  try {
    // Usamos la conexión importada (conn) en lugar de crear un nuevo pool
    const [rows] = await conn.execute(
      "SELECT id, login, name FROM `sec_genusers` WHERE login = ?",
      [ruc]
    );

    // Convertir el resultado a un array
    const results = rows as Array<{ id: number; login: string; name: string }>;

    // Si encontramos resultados, devolvemos la información
    if (results.length > 0) {
      return {
        exists: true,
        name: results[0].name,
      };
    }

    // Si no hay resultados, indicamos que no existe
    return { exists: false };
  } catch (error) {
    console.error("Error al buscar el RUC:", error);
    throw new Error("Error al buscar el RUC en la base de datos");
  }
}

/**
 * Agrega un nuevo RUC a la base de datos
 * @param ruc - El número de RUC a agregar (campo 'login')
 * @param companyName - El nombre de la empresa (campo 'name')
 */
export async function addRuc(ruc: string, companyName: string) {
  try {
    // Usamos la conexión importada
    await conn.execute(
      "INSERT INTO `sec_genusers` (login, name, pswd, active) VALUES (?, ?, ?, ?)",
      [ruc, companyName, "befaab6f41b37290d260c6587052edb3", "Y"]
    );

    return { success: true };
  } catch (error) {
    console.error("Error al agregar el RUC:", error);
    throw new Error("Error al agregar el RUC a la base de datos");
  }
}

/**
 * Obtiene todos los RUCs de la base de datos
 * Esta función puede ser útil para administración o depuración
 */
export async function getAllRucs() {
  try {
    const [rows] = await conn.execute(
      "SELECT id, login, name FROM `sec_genusers`"
    );
    return rows as Array<{ id: number; login: string; name: string }>;
  } catch (error) {
    console.error("Error al obtener todos los RUCs:", error);
    throw new Error("Error al obtener los datos de la base de datos");
  }
}

/**
 * Reinicia la contraseña de un usuario por su RUC
 * @param ruc - El número de RUC del usuario
 */
export async function resetPassword(ruc: string) {
  try {
    const defaultHashedPassword = "befaab6f41b37290d260c6587052edb3";

    await conn.execute("UPDATE `sec_genusers` SET pswd = ? WHERE login = ?", [
      defaultHashedPassword,
      ruc,
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error al reiniciar la contraseña:", error);
    throw new Error("Error al reiniciar la contraseña");
  }
}

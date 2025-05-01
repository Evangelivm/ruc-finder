import { z } from "zod";

export const rucSchema = z
  .string()
  .min(11, "El RUC debe tener 11 dígitos")
  .max(11, "El RUC debe tener 11 dígitos")
  .regex(/^\d+$/, "El RUC debe contener solo números")
  .refine((val) => !isNaN(Number(val)), "El RUC debe ser un número válido");

export const companyNameSchema = z
  .string()
  .min(3, "El nombre de la empresa debe tener al menos 3 caracteres")
  .max(100, "El nombre de la empresa no puede exceder los 100 caracteres")
  .refine(
    (val) => /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\.]+$/.test(val),
    "El nombre solo debe contener letras, espacios y puntos"
  );

export const addRucSchema = z.object({
  ruc: rucSchema,
  companyName: companyNameSchema,
});

export const resetPasswordSchema = z.object({
  ruc: rucSchema,
});

import { z } from 'zod';

export const commonValidations = {
  email: z.string()
    .trim()
    .min(1, "Email adresa je obavezna")
    .email("Unesite ispravnu email adresu"),
  
  password: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova"),
  
  required: (fieldName: string) => 
    z.string().min(1, `${fieldName} je obavezno`),
  
  oib: z.string()
    .length(11, "OIB mora imati točno 11 znamenki")
    .regex(/^\d+$/, "OIB mora sadržavati samo brojeve"),
  
  phone: z.string()
    .regex(/^(\+385|0)\d{8,9}$/, "Unesite ispravan telefonski broj")
    .optional()
    .or(z.literal('')),
};

export const errorMessages = {
  required: "Ovo polje je obavezno",
  email: "Unesite ispravnu email adresu",
  password: "Lozinka mora imati najmanje 8 znakova",
  oib: "OIB mora imati točno 11 znamenki",
  phone: "Unesite ispravan telefonski broj",
};

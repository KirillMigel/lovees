import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен"),
})

export const onboardingSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  birthdate: z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18
    }
    return age >= 18
  }, "Вам должно быть минимум 18 лет"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  city: z.string().min(2, "Город обязателен"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  interests: z.array(z.string()).min(1, "Выберите минимум один интерес"),
})

export const profileUpdateSchema = z.object({
  bio: z.string().max(500, "Био не должно превышать 500 символов").optional(),
  city: z.string().min(2, "Город обязателен").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  interests: z.array(z.string()).optional(),
})
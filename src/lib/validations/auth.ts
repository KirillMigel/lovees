import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
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
  interests: z.array(z.string()).min(1, "Выберите минимум один интерес"),
  city: z.string().min(2, "Введите город"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>

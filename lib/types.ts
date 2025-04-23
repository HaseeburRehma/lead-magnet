export interface SocialPost {
  id: number
  content: string
  category: string
  image: string
}

export interface FormData {
  firstName: string
  lastName: string
  email: string
  company: string
  recaptchaToken: string
}

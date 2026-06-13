import { createClient } from '@supabase/supabase-js'

// Client สำหรับอ่านข้อมูล public อย่างเดียว (ไม่แตะ session/cookies)
// ใช้ได้ทั้งฝั่ง server และ client
// ถ้าโปรเจกต์มี anon client อยู่แล้ว จะใช้ตัวเดิมแทนก็ได้
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

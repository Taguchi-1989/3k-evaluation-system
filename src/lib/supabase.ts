import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'

// 環境変数が設定されていない場合は無効なクライアントを作成
export const supabase = (supabaseUrl.includes('[YOUR_PROJECT_ID]') || supabaseUrl === 'https://localhost:54321') 
  ? null 
  : createClient(supabaseUrl, supabaseKey)

// ファイルアップロード用ヘルパー
export async function uploadFile(
  file: File,
  bucket: string = 'uploads',
  path?: string
): Promise<{ path: string; url: string }> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const filePath = path || `${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    throw error
  }
  
  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return {
    path: filePath,
    url: publicData.publicUrl,
  }
}

// ファイル削除用ヘルパー
export async function deleteFile(path: string, bucket: string = 'uploads'): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    throw error
  }
  
  return true
}
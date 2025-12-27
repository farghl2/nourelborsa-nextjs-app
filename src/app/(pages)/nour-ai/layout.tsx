import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
  'Nour AI - المحلل الذكي للأسهم',
  'استخدم الذكاء الاصطناعي لتحليل الأسهم والحصول على توصيات استثمارية دقيقة. تحليل فني شامل يشمل المؤشرات والمتوسطات المتحركة.',
  '/nour-ai'
)

export default function NourAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

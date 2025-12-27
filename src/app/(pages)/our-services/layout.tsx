import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
  'خدماتنا - نور البورصة',
  'اكتشف خدمات نور البورصة الشاملة: تحليل الأسهم الشرعية، حساب نسب التطهير، التوصيات الاستثمارية، وأدوات الذكاء الاصطناعي للمستثمرين.',
  '/our-services'
)

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

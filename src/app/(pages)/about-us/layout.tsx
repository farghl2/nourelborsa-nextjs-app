import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
  'من نحن - نور البورصة',
  'تعرف على نور البورصة، منصتك الموثوقة لتحليل الأسهم المتوافقة مع الشريعة الإسلامية. نساعدك في اتخاذ قرارات استثمارية حلال ومدروسة.',
  '/about-us'
)

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

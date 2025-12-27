import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
  'اتصل بنا - نور البورصة',
  'تواصل مع فريق نور البورصة. نحن هنا للإجابة على استفساراتك ومساعدتك في رحلتك الاستثمارية الحلال.',
  '/contact-us'
)

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

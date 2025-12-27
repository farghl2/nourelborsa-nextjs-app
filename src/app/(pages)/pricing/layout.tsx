import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata(
  'خطط الاشتراكات - نور البورصة',
  'اختر الخطة المناسبة لاحتياجاتك وابدأ رحلتك في التداول الشرعي بثقة. احصل على تحليلات الأسهم الحلال، نسب التطهير، والتوصيات الاستثمارية.',
  '/pricing'
)

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nourelborsa.com'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'نور البورصة - تحليل الأسهم الشرعية والاستثمار الحلال',
    template: '%s | نور البورصة',
  },
  description:
    'منصة نور البورصة لتحليل الأسهم المتوافقة مع الشريعة الإسلامية. احصل على تحليلات دقيقة، نسب التطهير، والتوصيات الاستثمارية للأسهم الحلال.',
  keywords: [
    'أسهم حلال',
    'استثمار إسلامي',
    'تحليل الأسهم',
    'نسبة التطهير',
    'أسهم شرعية',
    'البورصة الإسلامية',
    'تحليل مالي',
    'استثمار متوافق مع الشريعة',
  ],
  authors: [{ name: 'نور البورصة' }],
  creator: 'نور البورصة',
  publisher: 'نور البورصة',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: baseUrl,
    siteName: 'نور البورصة',
    title: 'نور البورصة - تحليل الأسهم الشرعية والاستثمار الحلال',
    description:
      'منصة نور البورصة لتحليل الأسهم المتوافقة مع الشريعة الإسلامية. احصل على تحليلات دقيقة، نسب التطهير، والتوصيات الاستثمارية للأسهم الحلال.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'نور البورصة',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نور البورصة - تحليل الأسهم الشرعية والاستثمار الحلال',
    description:
      'منصة نور البورصة لتحليل الأسهم المتوافقة مع الشريعة الإسلامية.',
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Helper function to generate metadata for stock pages
export function generateStockMetadata(stock: {
  name: string
  symbol: string
  description?: string | null
  prohibitedRevenuePercentage?: string | null
  recommendation?: boolean
}): Metadata {
  const title = `${stock.name} (${stock.symbol}) - تحليل السهم`
  const description =
    stock.description ||
    `تحليل شامل لسهم ${stock.name} (${stock.symbol}). اطلع على نسبة الإيرادات المحرمة، نسبة التطهير، والتوصيات الاستثمارية.`

  return {
    title,
    description,
    keywords: [
      stock.name,
      stock.symbol,
      'تحليل سهم',
      'أسهم حلال',
      'نسبة التطهير',
      'استثمار إسلامي',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/stocks/${stock.symbol}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// Helper function for page metadata
export function generatePageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

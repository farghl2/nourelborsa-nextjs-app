// JSON-LD Structured Data Helpers for SEO

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nourelborsa.com'

// Organization Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'نور البورصة',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'منصة نور البورصة لتحليل الأسهم المتوافقة مع الشريعة الإسلامية',
    sameAs: [
      // Add social media links here when available
      // 'https://twitter.com/nourelborsa',
      // 'https://facebook.com/nourelborsa',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Arabic'],
    },
  }
}

// WebSite Schema with Search Action
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'نور البورصة',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/stocks?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

// Product Schema for Subscription Plans
export function generateProductSchema(plan: {
  name: string
  description: string
  price: number
  durationDays: number
  features: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plan.name,
    description: plan.description,
    offers: {
      '@type': 'Offer',
      price: plan.price,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '1',
    },
  }
}

// FinancialProduct Schema for Stocks
export function generateStockSchema(stock: {
  name: string
  symbol: string
  description?: string | null
  price?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${stock.name} (${stock.symbol})`,
    description: stock.description || `تحليل سهم ${stock.name}`,
    category: 'Stock',
    provider: {
      '@type': 'Organization',
      name: 'نور البورصة',
    },
  }
}

// Article Schema (for blog posts if needed)
export function generateArticleSchema(article: {
  title: string
  description: string
  publishedDate: string
  modifiedDate?: string
  author?: string
  imageUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    author: {
      '@type': 'Person',
      name: article.author || 'نور البورصة',
    },
    publisher: {
      '@type': 'Organization',
      name: 'نور البورصة',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    image: article.imageUrl || `${baseUrl}/og-image.png`,
  }
}

// Helper to inject JSON-LD into page
export function generateJsonLd(schema: object) {
  return {
    __html: JSON.stringify(schema),
  }
}

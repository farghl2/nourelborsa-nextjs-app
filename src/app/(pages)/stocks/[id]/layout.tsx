import { Metadata } from 'next'
import { getStockBy } from '@/lib/services/stocks'
import { generateStockMetadata } from '@/lib/seo/metadata'

type Props = {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params

  try {
    const stock = await getStockBy(id)

    if (!stock) {
      return {
        title: 'السهم غير موجود',
        description: 'لم يتم العثور على السهم المطلوب',
      }
    }

    return generateStockMetadata({
      name: stock.name || '',
      symbol: stock.symbol || '',
      description: stock.description,
      prohibitedRevenuePercentage: stock.prohibitedRevenuePercentage,
      recommendation: stock.recommendation,
    })
  } catch (error) {
    return {
      title: 'خطأ في تحميل السهم',
      description: 'حدث خطأ أثناء تحميل بيانات السهم',
    }
  }
}

export default function StockLayout({ children }: Props) {
  return <>{children}</>
}

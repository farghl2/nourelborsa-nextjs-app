/**
 * Stock Analysis Constants
 * Contains Egyptian stock data and configuration
 */

import { EgyptianStock, Timeframe, TimeframeConfig } from './types';

/**
 * EGX30 and popular Egyptian stocks
 * Each stock includes:
 * - Yahoo Finance symbol (ending in .CA for Cairo Exchange)
 * - English and Arabic names
 * - Keywords for fuzzy search matching
 */
export const EGX30_STOCKS: EgyptianStock[] = [
  // Banking Sector
  {
    symbol: 'COMI.CA',
    name: 'Commercial International Bank',
    nameAr: 'البنك التجاري الدولي',
    keywords: ['cib', 'commercial', 'international', 'bank', 'تجاري', 'دولي', 'بنك']
  },
  {
    symbol: 'QNBA.CA',
    name: 'Qatar National Bank Alahli',
    nameAr: 'بنك قطر الوطني الأهلي',
    keywords: ['qnb', 'qatar', 'national', 'ahli', 'قطر', 'وطني', 'أهلي']
  },
  {
    symbol: 'ADIB.CA',
    name: 'Abu Dhabi Islamic Bank Egypt',
    nameAr: 'مصرف أبوظبي الإسلامي مصر',
    keywords: ['adib', 'abu dhabi', 'islamic', 'أبوظبي', 'إسلامي']
  },
  {
    symbol: 'CIEB.CA',
    name: 'Credit Agricole Egypt',
    nameAr: 'كريدي أجريكول مصر',
    keywords: ['credit', 'agricole', 'كريدي']
  },
  {
    symbol: 'HDBK.CA',
    name: 'Housing and Development Bank',
    nameAr: 'بنك التعمير والإسكان',
    keywords: ['hdb', 'housing', 'development', 'تعمير', 'إسكان']
  },
  {
    symbol: 'SAUD.CA',
    name: 'Faisal Islamic Bank of Egypt',
    nameAr: 'بنك فيصل الإسلامي المصري',
    keywords: ['faisal', 'islamic', 'فيصل', 'إسلامي']
  },
  {
    symbol: 'CANA.CA',
    name: 'Suez Canal Bank',
    nameAr: 'بنك قناة السويس',
    keywords: ['suez', 'canal', 'قناة', 'سويس']
  },
  {
    symbol: 'EXPA.CA',
    name: 'Export Development Bank of Egypt',
    nameAr: 'البنك المصري لتنمية الصادرات',
    keywords: ['export', 'development', 'صادرات', 'تنمية']
  },

  // Telecommunications & Technology
  {
    symbol: 'ETEL.CA',
    name: 'Telecom Egypt',
    nameAr: 'المصرية للاتصالات',
    keywords: ['telecom', 'egypt', 'te', 'اتصالات', 'مصرية', 'وي', 'we']
  },
  {
    symbol: 'FWRY.CA',
    name: 'Fawry',
    nameAr: 'فوري',
    keywords: ['fawry', 'فوري', 'fintech', 'دفع']
  },
  {
    symbol: 'EFIH.CA',
    name: 'e-Finance',
    nameAr: 'إي فاينانس',
    keywords: ['efinance', 'e-finance', 'اي فاينانس', 'مالية']
  },
  {
    symbol: 'RAYA.CA',
    name: 'Raya Holding',
    nameAr: 'راية القابضة',
    keywords: ['raya', 'راية']
  },

  // Real Estate
  {
    symbol: 'TMGH.CA',
    name: 'Talaat Moustafa Group',
    nameAr: 'مجموعة طلعت مصطفى',
    keywords: ['tmg', 'talaat', 'moustafa', 'طلعت', 'مصطفى', 'مدينتي']
  },
  {
    symbol: 'PHDC.CA',
    name: 'Palm Hills Development',
    nameAr: 'بالم هيلز للتعمير',
    keywords: ['palm', 'hills', 'بالم', 'هيلز']
  },
  {
    symbol: 'MNHD.CA',
    name: 'Madinet Nasr Housing',
    nameAr: 'مدينة نصر للإسكان',
    keywords: ['madinet', 'nasr', 'housing', 'مدينة', 'نصر', 'إسكان']
  },
  {
    symbol: 'OCDI.CA',
    name: 'Orascom Development',
    nameAr: 'أوراسكوم للتنمية',
    keywords: ['orascom', 'development', 'أوراسكوم', 'تنمية', 'الجونة']
  },
  {
    symbol: 'SODIC.CA',
    name: 'SODIC',
    nameAr: 'سوديك',
    keywords: ['sodic', 'سوديك']
  },
  {
    symbol: 'HELI.CA',
    name: 'Heliopolis Company for Housing',
    nameAr: 'هليوبوليس للإسكان',
    keywords: ['heliopolis', 'هليوبوليس']
  },
  {
    symbol: 'EMFD.CA',
    name: 'Emaar Misr',
    nameAr: 'إعمار مصر',
    keywords: ['emaar', 'misr', 'إعمار']
  },
  {
    symbol: 'HRHO.CA',
    name: 'EFG Hermes',
    nameAr: 'المجموعة المالية هيرميس',
    keywords: ['hermes', 'efg', 'هيرميس', 'مجموعة مالية']
  },
  {
    symbol: 'UNIT.CA',
    name: 'United Housing & Development',
    nameAr: 'المتحدة للإسكان والتعمير',
    keywords: ['united', 'housing', 'متحدة', 'إسكان']
  },
  {
    symbol: 'ZMID.CA',
    name: 'Zahraa Maadi Investment',
    nameAr: 'زهراء المعادي للاستثمار',
    keywords: ['zahraa', 'maadi', 'زهراء', 'معادي']
  },
  {
    symbol: 'ELKA.CA',
    name: 'El Kahera Housing',
    nameAr: 'القاهرة للإسكان',
    keywords: ['kahera', 'cairo', 'housing', 'قاهرة', 'إسكان']
  },

  // Food & Beverages
  {
    symbol: 'EAST.CA',
    name: 'Eastern Company',
    nameAr: 'الشرقية للدخان',
    keywords: ['eastern', 'tobacco', 'شرقية', 'دخان', 'سجائر']
  },
  {
    symbol: 'JUFO.CA',
    name: 'Juhayna Food Industries',
    nameAr: 'جهينة للصناعات الغذائية',
    keywords: ['juhayna', 'food', 'جهينة', 'ألبان']
  },
  {
    symbol: 'DCRC.CA',
    name: 'Delta Sugar Company',
    nameAr: 'دلتا للسكر',
    keywords: ['delta', 'sugar', 'دلتا', 'سكر']
  },
  {
    symbol: 'DOMTY.CA',
    name: 'Arabian Food Industries (Domty)',
    nameAr: 'دومتي',
    keywords: ['domty', 'arabian', 'food', 'دومتي', 'جبنة']
  },
  {
    symbol: 'EFID.CA',
    name: 'Edita Food Industries',
    nameAr: 'إيديتا للصناعات الغذائية',
    keywords: ['edita', 'food', 'molto', 'إيديتا', 'مولتو']
  },
  {
    symbol: 'OLFI.CA',
    name: 'Obour Land',
    nameAr: 'عبور لاند',
    keywords: ['obour', 'land', 'cheese', 'عبور', 'لاند']
  },
  {
    symbol: 'ISMA.CA',
    name: 'Ismailia Misr Poultry',
    nameAr: 'الإسماعيلية مصر للدواجن',
    keywords: ['ismailia', 'poultry', 'إسماعيلية', 'دواجن']
  },

  // Industrial & Materials
  {
    symbol: 'ESRS.CA',
    name: 'Ezz Steel',
    nameAr: 'حديد عز',
    keywords: ['ezz', 'steel', 'عز', 'حديد']
  },
  {
    symbol: 'SWDY.CA',
    name: 'Elsewedy Electric',
    nameAr: 'السويدي إلكتريك',
    keywords: ['elsewedy', 'sewedy', 'electric', 'سويدي', 'كابلات']
  },
  {
    symbol: 'ABUK.CA',
    name: 'Abu Qir Fertilizers',
    nameAr: 'أبو قير للأسمدة',
    keywords: ['abu', 'kir', 'fertilizers', 'أبو قير', 'أسمدة']
  },
  {
    symbol: 'MOPCO.CA',
    name: 'Misr Fertilizers Production',
    nameAr: 'موبكو',
    keywords: ['mopco', 'fertilizers', 'موبكو', 'أسمدة']
  },
  {
    symbol: 'SKPC.CA',
    name: 'Sidi Kerir Petrochemicals',
    nameAr: 'سيدي كرير للبتروكيماويات',
    keywords: ['sidpec', 'sidi', 'kerir', 'سيدي', 'كرير', 'بتروكيماويات']
  },
  {
    symbol: 'KIMA.CA',
    name: 'Kima',
    nameAr: 'كيما',
    keywords: ['kima', 'chemical', 'كيما', 'أسمدة']
  },
  {
    symbol: 'AMOC.CA',
    name: 'Alexandria Mineral Oils',
    nameAr: 'أموك',
    keywords: ['amoc', 'alexandria', 'mineral', 'oils', 'أموك', 'زيوت']
  },
  {
    symbol: 'EGAL.CA',
    name: 'Egypt Aluminum',
    nameAr: 'مصر للألومنيوم',
    keywords: ['egypt', 'aluminum', 'egyptalum', 'ألومنيوم', 'ايجيبت ألومنيوم']
  },
  {
    symbol: 'EGCH.CA',
    name: 'Chemical Industries Development',
    nameAr: 'تنمية الصناعات الكيماوية',
    keywords: ['cid', 'chemical', 'كيماوية']
  },
  {
    symbol: 'MCQE.CA',
    name: 'Misr Cement Qena',
    nameAr: 'مصر للأسمنت قنا',
    keywords: ['cement', 'qena', 'أسمنت', 'قنا']
  },
  {
    symbol: 'ARCC.CA',
    name: 'Arabian Cement',
    nameAr: 'الأسمنت العربية',
    keywords: ['arabian', 'cement', 'أسمنت', 'عربية']
  },

  // Healthcare & Pharma
  {
    symbol: 'ISPH.CA',
    name: 'Integrated Diagnostics Holdings',
    nameAr: 'المتكاملة للتشخيصات',
    keywords: ['idh', 'diagnostics', 'البرج', 'معامل', 'تحاليل']
  },
  {
    symbol: 'CLHO.CA',
    name: 'Cleopatra Hospital',
    nameAr: 'مستشفى كليوباترا',
    keywords: ['cleopatra', 'hospital', 'كليوباترا', 'مستشفى']
  },
  {
    symbol: 'PHAR.CA',
    name: 'EIPICO',
    nameAr: 'إيبيكو',
    keywords: ['eipico', 'pharma', 'إيبيكو', 'أدوية']
  },
  {
    symbol: 'RMDA.CA',
    name: 'Rameda',
    nameAr: 'راميدا',
    keywords: ['rameda', 'pharma', 'راميدا', 'أدوية']
  },

  // Financial Services (Non-Banking)
  {
    symbol: 'CCAP.CA',
    name: 'Qalaa Holdings',
    nameAr: 'القلعة للاستشارات المالية',
    keywords: ['qalaa', 'citadel', 'قلعة']
  },
  {
    symbol: 'BTFH.CA',
    name: 'Beltone Financial',
    nameAr: 'بلتون المالية',
    keywords: ['beltone', 'بلتون']
  },
  {
    symbol: 'CICH.CA',
    name: 'CI Capital',
    nameAr: 'سي أي كابيتال',
    keywords: ['ci', 'capital', 'سي', 'أيس']
  },
  {
    symbol: 'PRDC.CA',
    name: 'Pioneers Properties',
    nameAr: 'بايونيرز بروبرتيز',
    keywords: ['pioneers', 'properties', 'بايونيرز']
  },
  {
    symbol: 'ASPI.CA',
    name: 'Aspire Capital',
    nameAr: 'أسباير كابيتال',
    keywords: ['aspire', 'capital', 'أسباير', 'رواد']
  },
  {
    symbol: 'BINV.CA',
    name: 'B Investments',
    nameAr: 'بي إنفستمنتس',
    keywords: ['b', 'investments', 'بي', 'استثمار']
  },

  // Shipping, Transport & Auto
  {
    symbol: 'ALCN.CA',
    name: 'Alexandria Containers',
    nameAr: 'الإسكندرية للحاويات',
    keywords: ['alexandria', 'containers', 'حاويات', 'إسكندرية']
  },
  {
    symbol: 'ETRS.CA',
    name: 'Egytrans',
    nameAr: 'إيجيترانس',
    keywords: ['egytrans', 'transport', 'إيجيترانس', 'نقل']
  },
  {
    symbol: 'GBCO.CA',
    name: 'GB Corp',
    nameAr: 'جي بي كورب',
    keywords: ['gb', 'auto', 'ghabbour', 'غبور', 'سيارات']
  },
  // Note: GTHE.CA was used in old file, GBCO.CA is more common now. 
  // Keeping GTHE from old file if needed, but adding GBCO is safer for new searches? 
  // Yahoo uses GBCO.CA. I will stick to GBCO.CA as primary.
  
  // Others
  {
    symbol: 'ORWE.CA',
    name: 'Oriental Weavers',
    nameAr: 'النساجون الشرقيون',
    keywords: ['oriental', 'weavers', 'نساجون', 'شرقيون', 'سجاد']
  },
  {
    symbol: 'DSCW.CA',
    name: 'Dice Sport & Casual Wear',
    nameAr: 'دايس',
    keywords: ['dice', 'sport', 'wear', 'دايس', 'ملابس']
  },
  {
    symbol: 'EKHO.CA',
    name: 'Egyptian Kuwaiti Holding',
    nameAr: 'المصرية الكويتية القابضة',
    keywords: ['ekho', 'egyptian', 'kuwaiti', 'كويتية', 'قابضة']
  },
  {
    symbol: 'ORAS.CA',
    name: 'Orascom Construction',
    nameAr: 'أوراسكوم كونستراكشون',
    keywords: ['orascom', 'construction', 'أوراسكوم', 'إنشاءات']
  },
  {
    symbol: 'ORHD.CA',
    name: 'Orascom Hotels',
    nameAr: 'أوراسكوم للفنادق',
    keywords: ['orascom', 'hotels', 'أوراسكوم', 'فنادق']
  },
];

/**
 * Timeframe configuration for Yahoo Finance API
 * Maps user-friendly timeframes to Yahoo Finance parameters
 * 
 * - 15m (Intraday): 1 month of data with 15-minute candles (for مضارب)
 * - 1h (Short Term): 2 months of data with 1-hour candles
 * - 1d (Daily): 2 years of data with daily candles (ensures SMA 200 availability)
 */
export const getTimeframeConfig = (timeframe: Timeframe): TimeframeConfig => {
  const now = new Date();
  
  switch (timeframe) {
    case '15m':
      // Intraday: 1 month of 15-minute data
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return {
        interval: '15m',
        period1: oneMonthAgo,
        period2: now,
      };
      
    case '1h':
      // Short term: 2 months of hourly data
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      return {
        interval: '1h',
        period1: twoMonthsAgo,
        period2: now,
      };
      
    case '1d':
    default:
      // Daily: 2 years of daily data (for SMA 200)
      const twoYearsAgo = new Date(now);
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return {
        interval: '1d',
        period1: twoYearsAgo,
        period2: now,
      };
  }
};

/**
 * Technical indicator periods
 */
export const INDICATOR_PERIODS = {
  RSI: 14,
  MFI: 14,
  ATR: 14,
  CCI: 20,
  MACD_FAST: 12,
  MACD_SLOW: 26,
  MACD_SIGNAL: 9,
  STOCHASTIC_K: 14,
  STOCHASTIC_D: 3,
  MA_PERIODS: [10, 20, 50, 100, 200] as const,
};

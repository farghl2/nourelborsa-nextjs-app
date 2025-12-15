
import { ChartNetwork, ChartSpline, DollarSign, Home, Info, Mail ,Glasses, Pin, Rocket, Star} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";

export const PHONE = "01204862933"
export const headerData = [
    { title: "الرئيسية", link: "/", icon: Home },
    { title: "الاسهم", link: "/stocks", icon:ChartNetwork   },
    { title: "Nour AI", link: "/nour-ai", icon:ChartNetwork   },
    { title: "الخدمات", link: "/our-services", icon: ChartSpline },
    { title: "الاشتركات", link: "/pricing", icon: DollarSign },
    { title: "من نحن", link: "/about-us", icon: Info },
    { title: "تواصل معنا", link: "/contact-us", icon: Mail },
]

export const FAQLIST =[
    {question:"هل الاشتراكات أصلية؟", answer:' نعم، جميع الاشتراكات أصلية 100% وتعمل على حسابك مباشرة.'},
    {question:"ما هي شروط وأحكام الاستخدام؟", answer:`  - يمنع مشاركة الكود مع الآخرين  
    - لا يمكن استرجاع المنتج بعد الإرسال  
   `},
    {question:"كيف أستلم الكود بعد الشراء؟", answer:'   يتم إرسال الكود فورًا إلى  رقم الوتساب'}]
   

    export const ABOUTUS =`نحن فريق متخصص في البحث و مراجعة الأسهم لكي يساعد المستثمر من أخذ قراراته المالية السليمة و المتوافقة مع القيم الإسلامية بسهولة 
و نهتم بتقديم معلومات دقيقة جدا و مراجعتها مع التحديث الفوري لأي معلومات .`
    export const OurServiceData = [
    {
        title: "١.تفاصيل شرعية وتطهير الارباح",
    
      description: `توضيح معلومات الأسهم الشرعية بحيث و هل متوافقة مع شروط اللجان الشرعية المعتمدة ام لا 
مع تقديم حلول سهلة وبسيطة في حساب مبالغ التطهير التي يلزم علي الفرد أخرجها `,
      icon:Star,
    },
    {
        title: "٢.معلومات مالية",
        description:`نساعدك في توضيح  ارقام الشركة المالية المهمة بشكل بسيط وموثوق بعيدا عن الحسابات الكثيرة و المعقدة
والتي تساعدك في اتخاذ قرارات مالية سليمة`,
        icon:Glasses        
    },
    {
        title: "٣.ذكاء اصطناعي ",
        description:`مساعدتك
نطور نموذج  ذكاء اصطناعي قادر علي مساعدتك في تحليل المؤشرات و الاتجاهات الفنية للسهم ونعمل علي تطويره لاعلي مستوي`,
        icon:Rocket
    }
]          

export const SOCIALCARDS =[
    {icon:FaFacebookF, url:'/'},
    {icon:FaInstagram, url:'/'},
    {icon:FaTiktok, url:'/'},
]
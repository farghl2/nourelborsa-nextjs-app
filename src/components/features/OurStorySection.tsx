import Image from 'next/image'
import React from 'react'

const OurStorySection = () => {
  return (
    <section className='py-12 px-2  rounded-lg'>
        <div className='max-w-6xl mx-auto '>

                <div className='text-center mb-8 sm:mb-16'>
                    <h4 className='text-2xl sm:text-4xl text-black/90 font-bold'>قصتنا في عالم البورصة</h4>   
                    <div className='h-0.5 w-[20%] bg-primary mx-auto mt-4 rounded-xl'/>
                </div>
                <div className=' flex  flex-col-reverse lg:flex-row gap-12 items-center lg:items-start lg:justify-between'>

                <div className='  bg-primary max-w-[420px] lg:w-[420px] h-[300px] lg:h-[340px] rounded-4xl'>

                <Image src={'/our-story.svg'} alt="our-story" width={400} height={654} className=' '/>
                </div>
               <p className='text-center lg:text-end text-lg sm:text-xl text-black/90 leading-7 sm:leading-9 max-w-xl'>
                نحن نقدم لك الحلول المالية و الشرعية 
التي تجعل بامكان التداول بطريقة شرعية وتحقيق نتايجايجابية بخدمتنا المالة و الفنية
يهدف فريقنا من الخبراء إلى توفير حلول مبتكرة وموثوقة تساعدك في اتخاذ قرارات مستنيرة. 
نحن ملتزمون بتقديم خدمة عالية الجودة تضمن لك الفهم الكامل للخيارات المتاحة لتحقيق أهدافك المالية والشرعية 
               </p>
                </div>
        </div>
    </section>
  )
}

export default OurStorySection
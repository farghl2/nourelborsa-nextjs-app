
import Image from 'next/image'
import FadeInUP from '@/animations/FadeInUP'
import { ABOUTUS } from '@/lib/data/const-data';

const AboutUs = () => {
  return (
    <section className='pt-16 px-2  rounded-lg'>
      <div className='max-w-6xl mx-auto '>

        <div className='text-center mb-8 sm:mb-16'>
          <h4 className='text-2xl sm:text-4xl text-black/90 font-bold'> من نحن</h4>
          <div className='h-0.5 w-[20%] bg-primary mx-auto mt-4 rounded-xl' />
        </div>
        <div className=' flex  flex-col   items-center lg:justify-between'>
          {/* <FadeInUP>

            <div

              className='  bg-primary max-w-[420px] lg:w-[420px] h-[300px] lg:h-[340px] rounded-4xl'>

              <Image src={'/our-story.svg'} alt="our-story" width={400} height={654} className=' ' />
            </div>
          </FadeInUP> */}
          <FadeInUP>

            <p

              className='text-center  text-lg sm:text-xl text-black/90 leading-7 sm:leading-9 max-w-xl'>
              {ABOUTUS}
            </p>
          </FadeInUP>
        </div>
      </div>
    </section>
  )
}

export default AboutUs;
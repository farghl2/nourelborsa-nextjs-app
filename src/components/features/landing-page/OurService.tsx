'use client';
import {motion} from 'motion/react'


const OurService = () => {
  return (
    <section 
    dir='rtl'
    className="py-12">
        {/* <div className="h-0.5 w-full bg-secondary"/> */}
        <div className="max-w-6xl mx-auto">
            <div className=" flex items-center justify-between">
              <div className='w-full text-center my-8 sm:my-12'>
                    <h4 className='text-2xl sm:text-4xl text-black/90 font-bold'>خدماتنا</h4>   
                    <div className='h-0.5 w-[20%] bg-primary mx-auto mt-4 rounded-xl'/>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
                    {OurServiceData.map((item, index) => (
                        <OurServiceItem icon={<item.icon/>} key={index} title={item.title} description={item.description}  index={index}/>
                    ))}
                </div>
        </div>
    </section>
  )
}

export default OurService

import { Card } from "@/components/ui/card";

import {  useAnimation } from "framer-motion"
import { OurServiceData } from '@/lib/data/const-data';


interface OurServiceItemProps {
  title: string
  description: string
  icon: React.ReactNode
  index: number
}

const OurServiceItem = ({ title, description, icon, index }: OurServiceItemProps) => {
  const controls1 = useAnimation()
  const controls2 = useAnimation()

  return (
    <motion.div
 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{once:true}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 300 } }}
    
    >
      <Card
        className="w-[300px] h-[300px]  text-center px-4 
                   hover:bg-secondary hover:text-white 
                   transition-all cursor-pointer rounded-xl py-4"
        onMouseEnter={() => {
          controls1.start({ y: -20, opacity: 0 })
          controls2.start({ y: 0, opacity: 1 })
        }}
        onMouseLeave={() => {
          controls1.start({ y: 0, opacity: 1 })
          controls2.start({ y: 20, opacity: 0 })
        }}
      >
        {/* Icon container */}
        <div className="relative h-8  overflow-hidden">
          {/* Default star */}
          <motion.div
            className="absolute text-primary"
            animate={controls1}
            initial={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
            {/* < className="text-primary" /> */}
          </motion.div>

          {/* Hover star */}
          <motion.div
            className="absolute text-white"
            animate={controls2}
            initial={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Card content */}
        <div className="p-4">
          <h4 className="text-xl font-bold">{title}</h4>
          <p className="text-sm  pt-3 text-black/80 group-hover:text-white/90">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}



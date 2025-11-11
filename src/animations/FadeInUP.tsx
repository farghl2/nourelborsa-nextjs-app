'use client'
import {motion} from 'motion/react'
const FadeInUP = ({children}: {children: React.ReactNode}) => {
  return (
        <motion.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        transition={{duration: .5, ease: 'easeIn'}}
        >{children}</motion.div>
    )
}

export default FadeInUP
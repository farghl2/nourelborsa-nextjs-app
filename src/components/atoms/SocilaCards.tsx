import { cn } from '@/lib/utils'
import Link from 'next/link';


import { Button } from '../ui/button';
import { SOCIALCARDS } from '@/lib/data/const-data';



const SocialCards = () => {
  return (
    <div>
        
        <div className="flex gap-5 items-center justify-center my-4">
            {SOCIALCARDS.map((item,index)=>
            <Button asChild >

            <Link   target='_blank' key={index} href={item.url} className={`${cn(` rounded-full text-2xl  p-4 `)} `}>
              <item.icon  className="text-2xl" />
            </Link>
            </Button>
            
            )}
        </div>
    </div>
  )
}

export default SocialCards
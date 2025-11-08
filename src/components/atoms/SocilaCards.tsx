import { cn } from '@/lib/utils'
import Link from 'next/link';

import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { Button } from '../ui/button';

const SOCIALCARDS =[
    {icon:FaFacebookF, url:'/'},
    {icon:FaInstagram, url:'/'},
    {icon:FaTiktok, url:'/'},
]

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
"use client"
import React from 'react'
import FadeInUP from '@/animations/FadeInUP'
import { Button } from '../../ui/button'

import { ChevronsUpDown } from "lucide-react"





const TITLE  ='اجعل نور مستشارك المالي و الشرعي في البورصة'
const SearchSection = () => {
    // const isMobile = useIsMobile()
    const {stocks, loading} = useAdminStocks();
    const router =useRouter();
    if(loading) return <Loading />
    return (
        <section className='relative overflow-hidden py-12 px-3'
        
        style={{backgroundImage:`url(${'logo-nourborsa.png'})`, backgroundRepeat:'no-repeat',backgroundSize: 'cover',
  backgroundPosition: 'center',
paddingLeft: '2rem',
          paddingRight: '2rem',
          backgroundOrigin: 'content-box',
}}
            >
            <div className='absolute inset-0 -z-10' />
            <div className='max-w-6xl mx-auto h-[400px] sm:h-[500px] flex flex-col gap-14 justify-center items-center'
      >
                {/* <div className='relative flex items-center justify-center'>
                    <div className='absolute -z-10 size-[500px] sm:size-[1000px] rounded-full bg-secondary/20 blur-3xl' />
                    <div className='absolute -z-10 size-[1200px] sm:size-[2200px] bg-[radial-gradient(circle_at_center,theme(colors.secondary/_40)_0%,transparent_60%)] blur-2xl' />
                    <div className='relative'>
                       <Image src={'/ful-logo.png' } alt="" width={200} height={200} className='w-[200px] sm:w-[400px]'/>
                    </div>
                </div> */}

                <div className='text-center'>
                    <FadeInUP>
                        <h4 className='text-xl sm:text-3xl font-bold'>{TITLE}</h4>
                    </FadeInUP>
                    <FadeInUP>
                        <p className='text-sm sm:text-base mt-2 text-muted-foreground'>ابحث عن الاسهم لمعرفة تفاصيلها المالية والشرعية</p>
                    </FadeInUP>
                </div>

                <div dir='rtl' className='flex-1 flex flex-col gap-2 items-center justify-end w-full'>
                    <CustomCombobox options={stocks.filter(s => s.active !== false)} placeholder='ابحث عن سهمك المفضل ....' searchPlaceholder='ابحث ...' onChange={(value) =>router.push(`/stocks/${value}`)} />
                </div>
            </div>
        </section>
    )
}

export default SearchSection






import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { Badge } from '../../ui/badge'
import Image from 'next/image'
import { AdminStockRow, useAdminStocks } from '@/hooks/useAdminStocks'
import Loading from '@/app/loading'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'


type Option = {
    id:string,
    name: string
    code: string
}

interface CustomComboboxProps {
    options: AdminStockRow[]
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string

    onChange?: (value: string) => void
}

function CustomCombobox({
    options,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "لا يوجد سهم بهذا الاسم",
    onChange,
}: CustomComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const handleSelect = (currentValue: string) => {
        const newValue = currentValue === value ? "" : currentValue
        setValue(newValue)
        setOpen(false)
        onChange?.(newValue)
    }

    const selectedLabel = options.find((opt) => opt.name === value)?.name

    return (
        <Popover open={open} onOpenChange={setOpen} >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(`justify-between w-[300px] py-6 sm:w-[500px] lg:w-[700px] hover:bg-white`)}
                >
                    {selectedLabel || placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent dir="rtl" className={`p-0 w-[300px] sm:w-[500px] lg:w-[700px]`}>
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-9" />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.name}
                                    value={option.id}
                                    onSelect={handleSelect}

                                    className="w-full flex justify-between items-center gap-8 py-2">


                                    <span className="text-black font-semibold">
                                        {option.name}

                                    </span>

                                    <Badge variant="default">{option.symbol}</Badge>

                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

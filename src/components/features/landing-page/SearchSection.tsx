"use client"
import React from 'react'
import FadeInUP from '@/animations/FadeInUP'
import { Button } from '../../ui/button'

import { ChevronsUpDown } from "lucide-react"



const stocks = [
    { name: 'tesla', code: 'TSLA' },
    { name: 'apple', code: 'AAPL' },
    { name: 'amazon', code: 'AMZN' },
    { name: 'google', code: 'GOOGL' },
    { name: 'microsoft', code: 'MSFT' },
    { name: 'facebook', code: 'META' },
    { name: 'twitter', code: 'TWTR' },
    { name: 'snapchat', code: 'SNAP' },
    { name: 'instagram', code: 'INSTAGRAM' },
    { name: 'whatsapp', code: 'WATSON' },
]
const SearchSection = () => {

    return (
        <section className='py-12 bg-secondary rounded-lg'>
            <div className='max-w-6xl mx-auto h-[500px] flex flex-col gap-20 justify-center'>

                <div className='text-center '>
                    <FadeInUP>

                    <h4 className='text-3xl sm:text-5xl text-white font-bold'>ابحث عن سهمك المفضل</h4>
                    </FadeInUP>
                    <FadeInUP>

                    <p className='text-sm sm:text-base mt-2 text-white/80'>ابحث عن الاسهم لمعرفة تفاصيلها المالية والشرعية</p>
                    </FadeInUP>

                </div>
                <div dir='rtl' className='flex-1 flex flex-col gap-2 items-center justify-start w-full'>

                    <CustomCombobox options={stocks} placeholder='ابحث عن سهمك المفضل ....' searchPlaceholder='ابحث ...' onChange={(value) => console.log(value)} />
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

type Option = {
    name: string
    code: string
}

interface CustomComboboxProps {
    options: Option[]
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
                                    value={option.name}
                                    onSelect={handleSelect}

                                    className="w-full flex justify-between items-center gap-8 py-2">


                                    <span className="text-black font-semibold">
                                        {option.name}

                                    </span>

                                    <Badge variant="default">{option.code}</Badge>

                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

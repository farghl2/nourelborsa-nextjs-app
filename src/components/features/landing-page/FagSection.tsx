


import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQLIST } from "@/lib/data/const-data";
 const TITLE ='الاسئلة الشائعة | FAQs'

const FaqSection = () => {
  return (
    <section className=" ">
      <Separator className="bg-primary"/>
      <div className="py-12 px-4 max-w-6xl mx-auto">
         <div className="w-full mx-auto text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{TITLE}</h2>
        <div className="h-0.5 w-28 bg-primary mx-auto rounded-full"></div>
      </div>
        <div className="w-full flex flex-wrap items-center justify-center gap-2">
          <Accordion
      type="single"
      collapsible
      className="w-full max-w-xl"
      // defaultValue="item-1"
    >
        {FAQLIST.map((item,index)=>
        
        
        
      <AccordionItem  value={`item-${index+1}`}>
        <AccordionTrigger >{item.question}</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
           {item.answer}
          </p>
        </AccordionContent>
      </AccordionItem>
     
    )}
    </Accordion>
        
        
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
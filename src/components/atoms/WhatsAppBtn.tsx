import { FaWhatsapp } from 'react-icons/fa'; 

interface WhatsAppBtnProps {
  phoneNumber:number
}
const WhatsAppBtn = ({phoneNumber}:WhatsAppBtnProps) => {
  const  prewrittenMessage=""
  return (
    <div className="fixed bottom-20 right-[20px] flex flex-col items-center z-50">
      <a
        href={`https://wa.me/%2B20${phoneNumber}?text=${encodeURIComponent(prewrittenMessage)}`} 
                target="_blank"
        rel="noopener noreferrer"
        className="bg-black/80 rounded-full shadow-lg p-4 animate-bounce duration-500   hover:scale-[1.1] hover:shadow-xl"
      >
        <FaWhatsapp size={30} color="#fff" />
      </a>
      <div className="mt-[8px] text-sm text-center font-bold text-primary dark:text-white">تواصل معنا</div> 
    </div>
  );
};

export default WhatsAppBtn;
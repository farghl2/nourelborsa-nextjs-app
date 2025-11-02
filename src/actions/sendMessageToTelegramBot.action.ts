'use server'


export async function sendMessageToBo(formData: string) {
    const botToken = process.env.NEXT_Token_BOT_TELG;
  const chatId =process.env.NEXT_CHATID_TELG;
 const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(formData)}`;
    const res = await fetch(url);
    const json = await res.json();

    if(!res.ok){
        return {message:'يوجد خطاء, حاول مرة اخري', status:res.status, success:false}
    }

    return {message:'طلبك وصل بنجاح! هنبدأ نجهزه فورًا  ❤️', status:res.status, success:true}
}
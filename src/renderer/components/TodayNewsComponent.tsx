import {useQuery} from "@tanstack/react-query";
import {Loader2} from "lucide-react";


export default function TodayNewsComponent() {

  const {isPending, error, data} = useQuery({
    retry: false,
    enabled: true,
    queryKey: [`get_today_news`],
    queryFn: async () => {
      const response = await window.electron.invoke('getTodayNews') as SResponse<any>
      if (response.code !== 200) {
        throw new Error(response.msg)
      }
      return response.data
    }
  })

  if (isPending) {
    return (
      <div className='flex w-full h-full'>
        <Loader2 className='m-auto' size={64} />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex w-full h-full'>
        {error.message}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 justify-between items-center'>
      {data.map((item: any, index: number) => {
        return (
          <div key={index} className='flex flex-col gap-2'>
            <span className='text-lg font-bold'>{item.title}</span>
          </div>
        )
      })}
    </div>
  )
}

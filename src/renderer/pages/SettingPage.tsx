import {useEffect, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../components/ui/tabs";
import {AiOutlineSetting, AiOutlineTranslation} from "react-icons/ai";


function SettingPage() {

  return (
    <div className="flex flex-col w-full px-20 pt-20 gap-4 h-full">
      <Tabs defaultValue="general" className="dark w-full h-full flex flex-row gap-4">
        <TabsList className="flex flex-col justify-start items-start h-[300px]">
          <TabsTrigger
            className="gap-2 text-base w-full text-start"
            value="general"><AiOutlineSetting/>General</TabsTrigger>
          <TabsTrigger
            className="gap-2 text-base w-full"
            value="llm"><AiOutlineSetting/>LLM</TabsTrigger>
          <TabsTrigger
            className="gap-2 text-base w-full"
            value="translate"><AiOutlineTranslation/>Translate</TabsTrigger>
          {/*<TabsTrigger value="transcript">Transcript</TabsTrigger>*/}
        </TabsList>
        <TabsContent value="general">
          <div className="w-full h-full">
            xxx
          </div>
        </TabsContent>
        <TabsContent value="llm">
          <div>
            yyy
          </div>
        </TabsContent>
        <TabsContent value="translate">
          <div>
            translate
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingPage

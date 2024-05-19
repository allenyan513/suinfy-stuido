import {createContext, useContext, useEffect, useState} from 'react';
import {WHISPER_MODELS} from "../../common/const";

interface GlobalProps {
  isShowCaption: boolean;
  setIsShowCaption: any;

  currentTab: string;
  setCurrentTab: any;

  defaultLanguage: string;
  setDefaultLanguage: any;
  saveDefaultLanguage: any;
  secondaryLanguage: string;
  setSecondaryLanguage: any;
  saveSecondaryLanguage: any;

  model: string;
  setModel: any;
  saveModel: any;

  showDefaultLanguage: boolean;
  saveShowDefaultLanguage: any;
  showSecondaryLanguage: boolean;
  saveShowSecondaryLanguage: any;
}

const GlobalContext = createContext<GlobalProps | null>(null);

export function GlobalProvider({children}: { children: any }) {
  const [currentTab, setCurrentTab] = useState<string>('')
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en')
  const [secondaryLanguage, setSecondaryLanguage] = useState<string>('en')
  const [isShowCaption, setIsShowCaption] = useState<boolean>(false)
  const [model, setModel] = useState<string>(WHISPER_MODELS.BASE.value)

  const [showDefaultLanguage, setShowDefaultLanguage] = useState<boolean>(true)
  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState<boolean>(true)



  const handleShowCaption = () => {
    if (isShowCaption) {
      window.localStorage.setItem('showCaption', 'false')
      setIsShowCaption(false)
    } else {
      window.localStorage.setItem('showCaption', 'true')
      setIsShowCaption(true)
    }
  }

  const saveDefaultLanguage = (language: string) => {
    window.localStorage.setItem('defaultLanguage', language)
    setDefaultLanguage(language)
  }

  const saveSecondaryLanguage = (language: string) => {
    window.localStorage.setItem('secondaryLanguage', language)
    setSecondaryLanguage(language)
  }

  const saveModel = (model: string) => {
    window.localStorage.setItem('model', model)
    setModel(model)
  }

  const saveShowDefaultLanguage = (show: boolean) => {
    window.localStorage.setItem('showDefaultLanguage', show ? 'true' : 'false')
    setShowDefaultLanguage(show)
  }

  const saveShowSecondaryLanguage = (show: boolean) => {
    window.localStorage.setItem('showSecondaryLanguage', show ? 'true' : 'false')
    setShowSecondaryLanguage(show)
  }

  useEffect(() => {
    const defaultLanguage = window.localStorage.getItem('defaultLanguage') || 'en'
    const secondaryLanguage = window.localStorage.getItem('secondaryLanguage') || 'en'
    const currentTab = window.localStorage.getItem('currentTab') || 'keyinsight'
    const showCaption = window.localStorage.getItem('showCaption') || 'false'
    const model = window.localStorage.getItem('model') || WHISPER_MODELS.BASE.value

    const showDefaultLanguage = window.localStorage.getItem('showDefaultLanguage') || 'true'
    const showSecondaryLanguage = window.localStorage.getItem('showSecondaryLanguage') || 'true'
    // const defaultLanguageFontSize = window.localStorage.getItem('defaultLanguageFontSize') || '20'
    // const secondaryLanguageFontSize = window.localStorage.getItem('secondaryLanguageFontSize') || '20'
    // const defaultLanguageColor = window.localStorage.getItem('defaultLanguageColor') || '20'
    // const secondaryLanguageColor = window.localStorage.getItem('secondaryLanguageColor') || '20'

    setDefaultLanguage(defaultLanguage)
    setSecondaryLanguage(secondaryLanguage)
    setCurrentTab(currentTab)
    setIsShowCaption(showCaption === 'true')
    setModel(model)

    setShowDefaultLanguage(showDefaultLanguage === 'true')
    setShowSecondaryLanguage(showSecondaryLanguage === 'true')
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isShowCaption,
        setIsShowCaption,
        currentTab,
        setCurrentTab,
        defaultLanguage,
        setDefaultLanguage,
        saveDefaultLanguage,
        secondaryLanguage,
        setSecondaryLanguage,
        saveSecondaryLanguage,

        model,
        setModel,
        saveModel,

        showDefaultLanguage,
        saveShowDefaultLanguage,
        showSecondaryLanguage,
        saveShowSecondaryLanguage,

      }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}

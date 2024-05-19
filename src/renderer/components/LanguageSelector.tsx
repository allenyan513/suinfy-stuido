import {SUPPORT_LANGUAGES} from "../../common/const/languages";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";

export interface LanguageSelectorProps {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
}

export default function LanguageSelector(props: LanguageSelectorProps) {

  return (
    <Select onValueChange={props.onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          defaultValue={props.defaultValue}
          placeholder={props.placeholder}/>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {SUPPORT_LANGUAGES.map((language) => {
            return (
              <SelectItem key={language.code} value={language.code}>{language.name}</SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SingleMode from "@/components/data-generator/SingleMode";
import ListMode from "@/components/data-generator/ListMode";
import { LOCALES, type LocaleKey } from "@/lib/faker";
import { useSessionState } from "@/hooks/useSessionState";

export default function DataGenerator() {
  const [locale, setLocale] = useSessionState<LocaleKey>("gen:locale", "en_US");

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Generator</h1>
        <Select value={locale} onValueChange={(v) => setLocale(v as LocaleKey)}>
          <SelectTrigger className="w-44 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LOCALES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        defaultValue={sessionStorage.getItem("gen:activeTab") ?? "single"}
        onValueChange={(v) => sessionStorage.setItem("gen:activeTab", v)}
      >
        <TabsList>
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="single" className="mt-4">
          <SingleMode locale={locale} />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <ListMode locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

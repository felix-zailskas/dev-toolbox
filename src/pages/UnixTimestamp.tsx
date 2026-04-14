import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function UnixTimestamp() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Unix Timestamp</h1>
      <Tabs
        defaultValue={sessionStorage.getItem("timestamp:activeTab") ?? "decoder"}
        onValueChange={(v) => sessionStorage.setItem("timestamp:activeTab", v)}
      >
        <TabsList>
          <TabsTrigger value="decoder">Decoder</TabsTrigger>
          <TabsTrigger value="encoder">Encoder</TabsTrigger>
        </TabsList>
        <TabsContent value="decoder" className="mt-4">
          <div className="text-muted-foreground">Decoder coming soon...</div>
        </TabsContent>
        <TabsContent value="encoder" className="mt-4">
          <div className="text-muted-foreground">Encoder coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

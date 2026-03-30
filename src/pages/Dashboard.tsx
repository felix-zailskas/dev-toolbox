import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/routes";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOOLS.map(({ to, title, description, icon: Icon }) => (
          <Card key={to} className="bg-card border-border">
            <CardHeader>
              <Icon className="h-6 w-6 text-accent mb-2" />
              <CardTitle className="text-foreground">{title}</CardTitle>
              <CardDescription className="text-muted-foreground">{description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate(to)} variant="secondary" className="w-full">
                Open
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

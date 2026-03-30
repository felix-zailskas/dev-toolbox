import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDiff, KeyRound, Database } from "lucide-react";
import { ROUTES } from "@/routes";

const tools = [
  {
    to: ROUTES.diff,
    title: "Text Diff",
    description: "Compare two texts with line-based and word-level highlighting.",
    icon: FileDiff,
  },
  {
    to: ROUTES.jwt,
    title: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens with signature verification.",
    icon: KeyRound,
  },
  {
    to: ROUTES.generator,
    title: "Data Generator",
    description: "Generate fake data records for development and testing.",
    icon: Database,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map(({ to, title, description, icon: Icon }) => (
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

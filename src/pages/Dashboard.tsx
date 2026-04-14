import { Link } from "react-router";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TOOLS } from "@/routes";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOOLS.map(({ to, title, description, icon: Icon }) => (
          <Link key={to} to={to} className="no-underline">
            <Card className="bg-card border-border transition-[box-shadow] duration-150 ease-out hover:ring-foreground/20 h-full">
              <CardHeader>
                <Icon className="h-6 w-6 text-accent mb-2" />
                <CardTitle className="text-foreground">{title}</CardTitle>
                <CardDescription className="text-muted-foreground">{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
  section?: string;
};

export default function ModulePlaceholder({ title, description, section = "Classroom Management" }: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600">{section}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
      </div>
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Module foundation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            This destination is protected and ready for the full role-aware module. Existing classroom routes remain unchanged while the feature is implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

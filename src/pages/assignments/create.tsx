import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useBack, useList } from "@refinedev/core";
import * as z from "zod";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassDetails } from "@/types"; // <-- Add this import

const assignmentCreateSchema = z.object({
  classId: z.coerce.number().min(1, "Class is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description is required"),
  dueAt: z.string().optional(),
  maxPoints: z.coerce.number().min(1, "Max points must be at least 1"),
});

const AssignmentsCreate = () => {
  const back = useBack();

  const form = useForm({
    resolver: zodResolver(assignmentCreateSchema),
    refineCoreProps: { resource: "assignments", action: "create" },
    defaultValues: { maxPoints: 100 },
  });

  const { query: classesQuery } = useList<ClassDetails>({ resource: "classes", pagination: { pageSize: 100 } });
  const classes = classesQuery.data?.data ?? [];

  return (
    <CreateView className="class-view">
      <Breadcrumb />
      <h1 className="page-title">Publish Assignment</h1>
      <div className="intro-row">
        <p className="text-muted-foreground">Create a new academic assignment for your class.</p>
        <Button onClick={() => back()} variant="outline">Go Back</Button>
      </div>
      <Separator />

      <div className="my-4">
        <Card className="class-form-card">
          <CardHeader><CardTitle className="text-2xl font-bold">Assignment Details</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(async (values) => { await form.refineCore.onFinish(values); })} className="space-y-5">
                <FormField control={form.control} name="classId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Class <span className="text-primary">*</span></FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title <span className="text-primary">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Instructions <span className="text-primary">*</span></FormLabel><FormControl><Textarea className="min-h-37.5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dueAt" render={({ field }) => (
                    <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="maxPoints" render={({ field }) => (
                    <FormItem><FormLabel>Max Points <span className="text-primary">*</span></FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Publishing..." : "Publish Assignment"}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};
export default AssignmentsCreate;

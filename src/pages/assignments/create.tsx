import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useBack, useList } from "@refinedev/core";
import { useFieldArray } from "react-hook-form";
import * as z from "zod";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ASSIGNMENT_WORKFLOW_CONFIG } from "@/constants";
import type { ClassDetails } from "@/types";

const rubricCriterionSchema = z.object({
  title: z.string().trim().min(1, "Criterion title is required"),
  description: z.string().trim().optional(),
  maxPoints: z.coerce.number().int().min(1, "Criterion points must be at least 1"),
});

const assignmentCreateSchema = z.object({
  classId: z.coerce.number().min(1, "Class is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description is required"),
  dueAt: z.string().optional(),
  maxPoints: z.coerce.number().int().min(1, "Max points must be at least 1"),
  allowResubmissions: z.boolean(),
  resubmissionDeadline: z.string().optional(),
  rubric: z.array(rubricCriterionSchema).max(ASSIGNMENT_WORKFLOW_CONFIG.rubric.maximumCriteria),
}).superRefine((values, context) => {
  const rubricTotal = values.rubric.reduce((total, criterion) => total + criterion.maxPoints, 0);
  if (values.rubric.length > 0 && rubricTotal !== values.maxPoints) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Rubric points must equal the assignment maximum points.",
      path: ["rubric"],
    });
  }

  if (!values.allowResubmissions && values.resubmissionDeadline) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enable resubmissions before setting a resubmission deadline.",
      path: ["resubmissionDeadline"],
    });
  }
});

const AssignmentsCreate = () => {
  const back = useBack();
  const form = useForm({
    resolver: zodResolver(assignmentCreateSchema),
    refineCoreProps: { resource: "assignments", action: "create" },
    defaultValues: {
      maxPoints: 100,
      allowResubmissions: false,
      resubmissionDeadline: "",
      rubric: [],
    },
  });
  const rubricFields = useFieldArray({ control: form.control, name: "rubric" });
  const allowResubmissions = form.watch("allowResubmissions");
  const rubricTotal = (form.watch("rubric") as Array<{ maxPoints?: number }> | undefined ?? []).reduce((total: number, criterion) => total + Number(criterion.maxPoints || 0), 0);

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
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value ? String(field.value) : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {classes.map((classItem) => <SelectItem key={classItem.id} value={String(classItem.id)}>{classItem.name}</SelectItem>)}
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
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="dueAt" render={({ field }) => (
                    <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="maxPoints" render={({ field }) => (
                    <FormItem><FormLabel>Max Points <span className="text-primary">*</span></FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="allowResubmissions" render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} aria-describedby="resubmission-help" />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{ASSIGNMENT_WORKFLOW_CONFIG.labels.allowResubmissions}</FormLabel>
                      <p id="resubmission-help" className="text-sm text-muted-foreground">Students can replace a submitted response until the configured deadline.</p>
                    </div>
                  </FormItem>
                )} />
                {allowResubmissions && (
                  <FormField control={form.control} name="resubmissionDeadline" render={({ field }) => (
                    <FormItem><FormLabel>{ASSIGNMENT_WORKFLOW_CONFIG.labels.resubmissionDeadline}</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                )}

                <section className="space-y-4 rounded-md border p-4" aria-labelledby="rubric-heading">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 id="rubric-heading" className="font-medium">{ASSIGNMENT_WORKFLOW_CONFIG.labels.rubricTitle}</h2>
                      <p className="text-sm text-muted-foreground">Optional. Criterion points must total {form.watch("maxPoints")}.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => rubricFields.append({ title: "", description: "", maxPoints: ASSIGNMENT_WORKFLOW_CONFIG.rubric.initialCriterionPoints })}
                      disabled={rubricFields.fields.length >= ASSIGNMENT_WORKFLOW_CONFIG.rubric.maximumCriteria}
                    >
                      {ASSIGNMENT_WORKFLOW_CONFIG.labels.addCriterion}
                    </Button>
                  </div>
                  {rubricFields.fields.map((criterion, index) => (
                    <div key={criterion.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_1fr_auto]">
                      <FormField control={form.control} name={`rubric.${index}.title`} render={({ field }) => (
                        <FormItem><FormLabel>Criterion</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`rubric.${index}.maxPoints`} render={({ field }) => (
                        <FormItem><FormLabel>Points</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" className="self-end" onClick={() => rubricFields.remove(index)}>{ASSIGNMENT_WORKFLOW_CONFIG.labels.removeCriterion}</Button>
                      <FormField control={form.control} name={`rubric.${index}.description`} render={({ field }) => (
                        <FormItem className="md:col-span-3"><FormLabel>Guidance</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  ))}
                  {rubricFields.fields.length > 0 && <p className="text-sm text-muted-foreground" role="status">Current rubric total: {rubricTotal}</p>}
                  <FormField control={form.control} name="rubric" render={() => <FormMessage />} />
                </section>

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

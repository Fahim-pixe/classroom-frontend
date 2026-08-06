import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useBack } from "@refinedev/core";
import * as z from "zod";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const departmentSchema = z.object({
  code: z.string().min(2, "Department code must be at least 2 characters"),
  name: z.string().min(3, "Department name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

const DepartmentsEdit = () => {
  const back = useBack();
  const form = useForm({
    resolver: zodResolver(departmentSchema),
    refineCoreProps: {
      resource: "departments",
      action: "edit", // <-- Tells Refine to do a PUT request instead of POST
    },
  });

  const { refineCore: { onFinish, query }, handleSubmit, formState: { isSubmitting }, control } = form;

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  if (query?.isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <EditView className="class-view">
      <h1 className="page-title">Edit Department</h1>
      <div className="intro-row">
        <p>Update the department information below.</p>
        <Button onClick={() => back()} variant="outline">Go Back</Button>
      </div>
      <Separator />
      
      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gradient-orange">Update Form</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-7">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code <span className="text-orange-600">*</span></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name <span className="text-orange-600">*</span></FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-orange-600">*</span></FormLabel>
                      <FormControl><Textarea className="min-h-28" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EditView>
  );
};

export default DepartmentsEdit;
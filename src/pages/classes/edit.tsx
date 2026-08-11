import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { Textarea } from "@/components/ui/textarea";
import { useBack, useList } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { classSchema } from "@/lib/schema";
import { ClassBannerUploader } from "@/components/class-banner-uploader";
import type { Subject, User } from "@/types";
import * as z from "zod";

const ClassesEdit = () => {
  const back = useBack();
  const form = useForm({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: "classes",
      action: "edit",
    },
  });

  const {
    refineCore: { onFinish, query },
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = form;

  const bannerPublicId = form.watch("bannerCldPubId");
  const bannerAssetId = form.watch("bannerAssetId");

  const onSubmit = async (values: z.infer<typeof classSchema>) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  // Fetch subjects list
  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 100 },
  });

  // Fetch teachers list
  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: { pageSize: 100 },
  });

  const teachers = teachersQuery.data?.data || [];
  const teachersLoading = teachersQuery.isLoading;
  const subjects = subjectsQuery.data?.data || [];
  const subjectsLoading = subjectsQuery.isLoading;

  if (query?.isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <EditView className="class-view">
      <h1 className="page-title">Edit Class</h1>
      <div className="intro-row">
        <p>Update the required information below to modify the class.</p>
        <Button onClick={() => back()} variant="outline">Go Back</Button>
      </div>
      <Separator />

      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
              Update Form
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-7">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={control}
                  name="bannerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image <span className="text-orange-600">*</span></FormLabel>
                      <FormControl>
                        <ClassBannerUploader
                          value={
                            field.value
                              ? { url: field.value, publicId: bannerPublicId ?? "", assetId: bannerAssetId }
                              : null
                          }
                          onChange={(file) => {
                            if (file) {
                              field.onChange(file.url);
                              form.setValue("bannerCldPubId", file.publicId ?? "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              form.setValue("bannerAssetId", file.assetId, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            } else {
                              field.onChange("");
                              form.setValue("bannerCldPubId", "", {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                              form.setValue("bannerAssetId", undefined, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {errors.bannerAssetId && (
                        <p className="text-destructive text-sm">
                          {errors.bannerAssetId.message?.toString()}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name <span className="text-orange-600">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject <span className="text-orange-600">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={subjectsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher <span className="text-orange-600">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                          disabled={teachersLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity <span className="text-orange-600">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
                            value={(field.value as number | undefined) ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status <span className="text-orange-600">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-orange-600">*</span></FormLabel>
                      <FormControl>
                        <Textarea className="min-h-28" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex gap-1 items-center">
                      <span>Updating...</span>
                      <Loader2 className="animate-spin h-4 w-4" />
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EditView>
  );
};

export default ClassesEdit;
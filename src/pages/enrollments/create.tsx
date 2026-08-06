import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreate, useGetIdentity, useList, useNotification } from "@refinedev/core";
import { useNavigate } from "react-router";
import { BookOpen, Building2, GraduationCap, UsersRound } from "lucide-react";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClassDetails, User } from "@/types";

const enrollSchema = z.object({
  classId: z.coerce.number().min(1, "Class is required"),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

const EnrollmentsCreate = () => {
  const navigate = useNavigate();
  const {
    mutateAsync: createEnrollment,
    mutation: { isPending },
  } = useCreate();
  const { data: currentUser } = useGetIdentity<User>();
  const { open: notify } = useNotification();

  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    pagination: {
      pageSize: 100,
    },
  });

  const classes = classesQuery.data?.data ?? [];
  const classesLoading = classesQuery.isLoading;

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      classId: 0,
    },
  });

  const selectedClassId = form.watch("classId");
  const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);

  const onSubmit = async (values: EnrollFormValues) => {
    if (!currentUser?.id) {
      notify?.({
        type: "error",
        message: "You must be signed in to enroll",
        description: "Please sign in again and retry the enrollment.",
      });
      return;
    }

    const classToEnroll = classes.find((classItem) => classItem.id === values.classId);
    if (!classToEnroll) {
      notify?.({
        type: "error",
        message: "Select a valid class",
        description: "The selected class is no longer available.",
      });
      return;
    }

    if (classToEnroll.status !== "active") {
      notify?.({
        type: "error",
        message: "Class is not available",
        description: "Choose an active class before enrolling.",
      });
      return;
    }

    try {
      const response = await createEnrollment({
        resource: "enrollments",
        values: {
          classId: values.classId,
          studentId: currentUser.id,
        },
      });

      notify?.({
        type: "success",
        message: "Enrollment successful",
        description: `You are now enrolled in ${classToEnroll.name}.`,
      });

      navigate("/enrollments/confirm", {
        state: {
          enrollment: response?.data,
        },
      });
    } catch (error) {
      notify?.({
        type: "error",
        message: "Enrollment failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const isSubmitDisabled =
    isPending ||
    classesLoading ||
    !currentUser?.id ||
    !classes.length ||
    !selectedClassId;

  return (
    <CreateView className="class-view">
      <Breadcrumb />

      <h1 className="page-title">Enroll in a Class</h1>
      <div className="intro-row">
        <p>Select a class to enroll as the current user.</p>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
              Enrollment Form
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Class <span className="text-orange-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                        disabled={classesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem
                              key={classItem.id}
                              value={String(classItem.id)}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium">{classItem.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {classItem.subject?.name ?? "Subject not assigned"} · {classItem.teacher?.name ?? "Instructor not assigned"}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedClass && (
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Class details</p>
                        <p className="text-xs text-muted-foreground">
                          Review the class assignment before enrolling.
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {selectedClass.status ?? "active"}
                      </Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <EnrollmentDetail
                        icon={BookOpen}
                        label="Subject"
                        value={selectedClass.subject?.name ?? "Not assigned"}
                      />
                      <EnrollmentDetail
                        icon={GraduationCap}
                        label="Faculty / teacher"
                        value={selectedClass.teacher?.name ?? "Not assigned"}
                      />
                      <EnrollmentDetail
                        icon={Building2}
                        label="Department"
                        value={selectedClass.department?.name ?? "Not assigned"}
                      />
                      <EnrollmentDetail
                        icon={UsersRound}
                        label="Capacity"
                        value={selectedClass.capacity ? `${selectedClass.capacity} students` : "Not specified"}
                      />
                    </div>
                    {selectedClass.schedules?.length > 0 && (
                      <div className="mt-3 border-t border-border pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Schedule
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedClass.schedules.map((schedule, index) => (
                            <Badge key={`${schedule.day}-${index}`} variant="outline">
                              {schedule.day}: {schedule.startTime}–{schedule.endTime}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <FormControl>
                    <Input
                      value={currentUser?.name ?? "Not signed in"}
                      readOnly
                    />
                  </FormControl>
                  {currentUser?.email && (
                    <p className="text-xs text-muted-foreground">
                      Signed in as {currentUser.email}
                    </p>
                  )}
                </FormItem>

                <Button type="submit" size="lg" disabled={isSubmitDisabled}>
                  {isPending ? "Enrolling..." : "Enroll"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

type EnrollmentDetailProps = {
  icon: typeof BookOpen;
  label: string;
  value: string;
};

const EnrollmentDetail = ({ icon: Icon, label, value }: EnrollmentDetailProps) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  </div>
);

export default EnrollmentsCreate;

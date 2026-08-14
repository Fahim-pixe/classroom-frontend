import { useGetIdentity, useShow, useList, useCustomMutation } from "@refinedev/core";
import { useParams } from "react-router";
import { useCallback, useState } from "react";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SubmissionAttachmentUploader } from "@/components/submission-attachment-uploader";
import { AssignmentDetailSkeleton } from "@/components/assignments/assignment-detail-skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { Assignment, StorageUploadValue, Submission, User } from "@/types";
import { useMutationFeedback } from "@/hooks/use-mutation-feedback";
import { useLocalDraft } from "@/hooks/use-local-draft";
import { ContentFreshnessNotice } from "@/components/refine-ui/layout/content-freshness-notice";
import { OFFLINE_RESILIENCE_CONFIG } from "@/constants";

const AssignmentsShow = () => {
  const { id } = useParams();
  const { data: user } = useGetIdentity<User>();
  const { open: notify } = useNotificationProvider();
  const isStudent = user?.role === "student";

  const { query } = useShow<Assignment & { className: string }>({ resource: "assignments", id });
  const assignment = query.data?.data;

  // For Students: Fetch personal submission
  const { query: studentSubQuery } = useList<Submission>({
    resource: `assignments/${id}/submissions`,
    queryOptions: { enabled: isStudent && !!id }
  });
  const mySubmission = studentSubQuery.data?.data?.[0];

  // For Teachers: Fetch all submissions
  const { query: teacherSubQuery } = useList<Submission & { student: User }>({
    resource: `assignments/${id}/submissions`,
    queryOptions: { enabled: !isStudent && !!id }
  });
  const allSubmissions = teacherSubQuery.data?.data || [];

  // Form State
  const isSubmissionDraftEmpty = useCallback((value: string) => !value.trim(), []);
  const {
    value: submissionText,
    setValue: setSubmissionText,
    clear: clearSubmissionDraft,
    hasRecoveredDraft,
  } = useLocalDraft({
    key: `assignment-submission:${user?.id ?? "pending"}:${id ?? "pending"}`,
    initialValue: "",
    enabled: isStudent && Boolean(id) && !mySubmission,
    isEmpty: isSubmissionDraftEmpty,
  });
  const [submissionFile, setSubmissionFile] = useState<StorageUploadValue | null>(null);

  const [gradeInput, setGradeInput] = useState<number | "">("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const { mutateAsync: submitWork, mutation: submitMutation } = useCustomMutation();
  const { mutateAsync: gradeWork, mutation: gradeMutation } = useCustomMutation();
  const { execute } = useMutationFeedback();

  const isSubmitting = submitMutation.isPending;
  const isGrading = gradeMutation.isPending;

  const handleStudentSubmit = async () => {
    const finalContent = submissionText.trim();
    if (!finalContent) return notify?.({ type: "error", message: "Submission cannot be empty." });

    try {
      await execute({
        action: () => submitWork({
          url: `assignments/${id}/submissions`,
          method: "post",
          values: {
            content: finalContent,
            attachmentAssetId: submissionFile?.assetId,
            attachmentName: submissionFile?.fileName,
            attachmentMimeType: submissionFile?.mimeType,
            attachmentSizeBytes: submissionFile?.fileSizeBytes,
          },
        }),
        labels: {
          pending: "Submitting assignment…",
          success: "Assignment submitted",
          successDescription: "Your instructor can now review your work.",
          error: "Unable to submit assignment",
          errorDescription: "Please check your connection and try again.",
        },
        onSuccess: async () => {
          clearSubmissionDraft();
          setSubmissionFile(null);
          await studentSubQuery.refetch();
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  const handleGrading = async (submissionId: number) => {
    const grade = Number(gradeInput);
    if (!Number.isFinite(grade) || grade < 0 || grade > Number(assignment?.maxPoints ?? 0)) {
      notify?.({ type: "error", message: "Enter a valid score within the assignment point range." });
      return;
    }

    try {
      await execute({
        action: () => gradeWork({
          url: `assignments/${id}/submissions/${submissionId}`,
          method: "patch",
          values: { grade, feedback: feedbackInput },
        }),
        labels: {
          pending: "Saving grade…",
          success: "Grade saved",
          successDescription: "The submission has been updated.",
          error: "Unable to save grade",
          errorDescription: "Please check the score and try again.",
        },
        onSuccess: async () => {
          await teacherSubQuery.refetch();
        },
      });
    } catch {
      // The shared feedback layer has already announced the failure and retry action.
    }
  };

  if (query.isLoading) return <AssignmentDetailSkeleton />;

  return (
    <ShowView className="class-view space-y-6">
      <ShowViewHeader resource="assignments" title={assignment?.title} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge>{assignment?.className}</Badge>
              <Badge variant="outline">{assignment?.maxPoints} Max Points</Badge>
              {assignment?.dueAt && <Badge variant="secondary">Due: {new Date(assignment.dueAt).toLocaleString()}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground text-sm">{assignment?.description}</p>
          </CardContent>
        </Card>

        {isStudent ? (
          <Card>
            <CardHeader><CardTitle>Your Submission</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ContentFreshnessNotice hasCachedContent={Boolean(mySubmission || assignment)} />
              {mySubmission ? (
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <Badge variant={mySubmission.grade !== null ? "default" : "secondary"} className="mb-4">
                    {mySubmission.grade !== null ? `Graded: ${mySubmission.grade}/${assignment?.maxPoints}` : "Submitted - Pending Review"}
                  </Badge>
                  <p className="text-sm whitespace-pre-wrap">{mySubmission.content}</p>
                  {mySubmission.attachmentUrl && <a href={mySubmission.attachmentUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open attached file</a>}
                  {mySubmission.feedback && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                      <p className="text-xs font-semibold text-primary">Instructor Feedback:</p>
                      <p className="text-sm text-foreground mt-1">{mySubmission.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {hasRecoveredDraft && (
                    <p className="text-sm text-muted-foreground" role="status">
                      {OFFLINE_RESILIENCE_CONFIG.copy.draftRestored}
                    </p>
                  )}
                  <Textarea
                    placeholder="Type your submission here..."
                    className="min-h-30"
                    value={submissionText}
                    onChange={e => setSubmissionText(e.target.value)}
                  />
                  <div className="my-2">
                    <p className="text-sm font-medium mb-2">Attach Document (Optional)</p>
                    {assignment ? (
                      <SubmissionAttachmentUploader
                        assignmentId={assignment.id}
                        classId={assignment.classId}
                        value={submissionFile}
                        onChange={setSubmissionFile}
                        disabled={isSubmitting}
                      />
                    ) : null}
                  </div>
                  <Button onClick={() => void handleStudentSubmit()} disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Turn In Assignment"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>Student Submissions ({allSubmissions.length})</CardTitle></CardHeader>
            <CardContent>
              {allSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students have submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {allSubmissions.map(sub => (
                    <div key={sub.id} className="p-4 border border-border rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{sub.student.name}</p>
                        <Badge variant={sub.grade !== null ? "default" : "secondary"}>
                          {sub.grade !== null ? `${sub.grade}/${assignment?.maxPoints}` : "Needs Grading"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{sub.content}</p>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={() => {
                            setGradeInput(sub.grade ?? "");
                            setFeedbackInput(sub.feedback ?? "");
                          }}>Review & Grade</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Grade Submission: {sub.student.name}</DialogTitle></DialogHeader>
                          <div className="p-3 bg-muted/50 rounded-md border text-sm whitespace-pre-wrap max-h-50 overflow-y-auto mb-4">
                            {sub.content}
                            {sub.attachmentUrl && <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 block text-primary underline">Open attached file</a>}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Points (out of {assignment?.maxPoints})</p>
                              <Input type="number" max={assignment?.maxPoints} value={gradeInput} onChange={e => setGradeInput(Number(e.target.value))} />
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Feedback</p>
                              <Textarea value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} />
                            </div>
                            <Button className="w-full" onClick={() => void handleGrading(sub.id)} disabled={isGrading}>
                              {isGrading ? "Saving..." : "Save Grade"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ShowView>
  );
};
export default AssignmentsShow;

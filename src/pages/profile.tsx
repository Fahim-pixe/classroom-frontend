import { useEffect, useState } from "react";
import { useGetIdentity, useNotification, useUpdate } from "@refinedev/core";
import { z } from "zod";
import {
  CalendarDays,
  Building2,
  Check,
  Edit3,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { ProfileImageUploader } from "@/components/profile-image-uploader";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UploadWidgetValue, User } from "@/types";
import { CONTEXTUAL_NAVIGATION, ROUTES } from "@/constants";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
});

const getInitials = (name = "") => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "U";
};

const formatDate = (value?: string) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
};

const Profile = () => {
  const {
    data: user,
    isLoading,
    refetch: refetchIdentity,
  } = useGetIdentity<User>();
  const { open: notify } = useNotification();
  const { mutateAsync: updateUser, mutation } = useUpdate<User>();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [imageValue, setImageValue] = useState<UploadWidgetValue | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setImageValue(
      user.image
        ? {
            url: user.image,
            publicId: user.imageCldPubId ?? "",
          }
        : null
    );
  }, [user]);

  const startEditing = () => {
    setNameError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (user) {
      setName(user.name ?? "");
      setImageValue(
        user.image
          ? { url: user.image, publicId: user.imageCldPubId ?? "" }
          : null
      );
    }
    setNameError(null);
    setIsEditing(false);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const parsed = profileSchema.safeParse({ name });
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? "Enter a valid name");
      return;
    }

    try {
      await updateUser({
        resource: "users",
        id: user.id,
        values: {
          name: parsed.data.name,
          image: imageValue?.assetId ? user.image ?? null : imageValue?.url ?? null,
          imageCldPubId: imageValue?.assetId ? null : imageValue?.publicId ?? null,
          imageStorageAssetId: imageValue?.assetId ?? (imageValue ? undefined : null),
        },
        meta: {
          method: "put",
        },
      });

      await refetchIdentity();
      setIsEditing(false);
      notify?.({
        type: "success",
        message: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      notify?.({
        type: "error",
        message: "Unable to update profile",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Your profile could not be loaded. Please sign in again.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-muted-foreground">
            View and update the account information associated with your profile.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user?.role === "teacher" && (
            <Button type="button" variant="outline" asChild>
              <Link to={ROUTES.AVAILABILITY}>
                <CalendarDays className="mr-2 h-4 w-4" />
                {CONTEXTUAL_NAVIGATION.FACULTY_AVAILABILITY.label}
              </Link>
            </Button>
          )}
          {!isEditing && (
            <Button type="button" onClick={startEditing}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit profile
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/20" />
        <CardContent className="relative pt-0">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit capitalize">
              {user.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full name or nickname</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setNameError(null);
                    }}
                    placeholder="Enter your name"
                    maxLength={120}
                    aria-invalid={Boolean(nameError)}
                  />
                  {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                  <p className="text-xs text-muted-foreground">
                    This name is shown to classmates and teachers. Your email remains private to account identity.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Profile picture</Label>
                  <ProfileImageUploader value={imageValue} onChange={setImageValue} disabled={mutation.isPending} />
                  <p className="text-xs text-muted-foreground">
                    Upload a new image to replace the current one, or use the trash button to remove it.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={mutation.isPending}>
                  <Check className="mr-2 h-4 w-4" />
                  {mutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEditing} disabled={mutation.isPending}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <ProfileDetail icon={UserRound} label="Full name" value={user.name} />
          <ProfileDetail icon={Mail} label="Email address" value={user.email} />
          <ProfileDetail icon={ShieldCheck} label="Account role" value={user.role} capitalize />
          <ProfileDetail icon={Building2} label="Department" value={user.department || "Not assigned"} />
          <ProfileDetail icon={CalendarDays} label="Member since" value={formatDate(user.createdAt)} />
          <ProfileDetail icon={CalendarDays} label="Last updated" value={formatDate(user.updatedAt)} />
        </CardContent>
      </Card>
    </div>
  );
};

type ProfileDetailProps = {
  icon: typeof UserRound;
  label: string;
  value: string;
  capitalize?: boolean;
};

const ProfileDetail = ({ icon: Icon, label, value, capitalize = false }: ProfileDetailProps) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 truncate text-sm font-medium ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  </div>
);

export default Profile;

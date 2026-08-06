import { useGetIdentity } from "@refinedev/core";
import { CalendarDays, Building2, Mail, ShieldCheck, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types";

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
  const { data: user, isLoading } = useGetIdentity<User>();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-muted-foreground">Loading your account details...</p>
        </div>
        <Card>
          <CardContent className="h-48 animate-pulse" />
        </Card>
      </div>
    );
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
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-muted-foreground">
          View the account information associated with your signed-in session.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/20" />
        <CardContent className="relative pt-0">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
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

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <ProfileDetail icon={UserRound} label="Full name" value={user.name} />
          <ProfileDetail icon={Mail} label="Email address" value={user.email} />
          <ProfileDetail
            icon={ShieldCheck}
            label="Account role"
            value={user.role}
            capitalize
          />
          <ProfileDetail
            icon={Building2}
            label="Department"
            value={user.department || "Not assigned"}
          />
          <ProfileDetail
            icon={CalendarDays}
            label="Member since"
            value={formatDate(user.createdAt)}
          />
          <ProfileDetail
            icon={CalendarDays}
            label="Last updated"
            value={formatDate(user.updatedAt)}
          />
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

const ProfileDetail = ({
  icon: Icon,
  label,
  value,
  capitalize = false,
}: ProfileDetailProps) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 truncate text-sm font-medium ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  </div>
);

export default Profile;

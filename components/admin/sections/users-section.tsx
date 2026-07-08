"use client";

import { useState } from "react";
import { CheckIcon, ClipboardIcon, MailPlusIcon, TriangleAlertIcon } from "lucide-react";

import {
  type AdminRole,
  type AdminUser,
  type AdminUserStatus,
  type Invitation,
} from "@/lib/admin-data";
import type { InviteResult } from "@/components/admin/dashboard/use-admin-users";
import { adminRoles } from "@/components/admin/shared/constants";
import { DataTable } from "@/components/admin/shared/data-table";
import { RolesPanel } from "@/components/admin/shared/roles-panel";
import { RowActions } from "@/components/admin/shared/row-actions";
import { StatusDot } from "@/components/admin/shared/status-dot";
import type { InvitationForm } from "@/components/admin/shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UsersSection({
  canManageUsers,
  currentRole,
  invitationForm,
  invitations,
  inviteUser,
  removeInvitation,
  setInvitationForm,
  updateUserRole,
  updateUserStatus,
  users,
}: {
  canManageUsers: boolean;
  currentRole: AdminRole;
  invitationForm: InvitationForm;
  invitations: Invitation[];
  inviteUser: () => Promise<InviteResult>;
  removeInvitation: (invitationId: string) => void;
  setInvitationForm: (form: InvitationForm) => void;
  updateUserRole: (userId: string, role: AdminRole) => void;
  updateUserStatus: (userId: string, status: AdminUserStatus) => void;
  users: AdminUser[];
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleInvite() {
    setPending(true);
    setInviteResult(null);
    const result = await inviteUser();
    setPending(false);
    setInviteResult(result);
  }

  function closeInvite() {
    setInviteOpen(false);
    setInviteResult(null);
    setCopied(false);
  }

  async function copyLink() {
    if (inviteResult?.ok) {
      try {
        await navigator.clipboard.writeText(inviteResult.acceptUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch {
        // ignore clipboard failures
      }
    }
  }

  return (
    <div className="grid gap-3">
      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Users & roles</h2>
            <p className="text-xs text-muted-foreground">
              {users.length} member{users.length === 1 ? "" : "s"} · session
              role <span className="font-medium text-foreground">{currentRole}</span>
            </p>
          </div>
          <Button
            size="sm"
            disabled={!canManageUsers}
            onClick={() => setInviteOpen(true)}
          >
            <MailPlusIcon className="size-4" />
            Invite user
          </Button>
        </div>
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Last active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <select
                    className="h-7 cursor-pointer appearance-none rounded-md border border-border/60 bg-transparent pl-2 pr-5 text-xs font-medium outline-none transition-colors hover:bg-muted/40 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canManageUsers || user.role === "Owner"}
                    value={user.role}
                    onChange={(event) =>
                      updateUserRole(user.id, event.target.value as AdminRole)
                    }
                  >
                    {adminRoles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2">
                    <StatusDot status={user.status} showLabel={false} />
                    <select
                      className="h-7 cursor-pointer appearance-none rounded-md border border-transparent bg-transparent pr-5 text-xs font-medium outline-none transition-colors hover:border-border focus:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!canManageUsers || user.role === "Owner"}
                      value={user.status}
                      onChange={(event) =>
                        updateUserStatus(
                          user.id,
                          event.target.value as AdminUserStatus,
                        )
                      }
                    >
                      <option>Active</option>
                      <option>Invited</option>
                      <option>Suspended</option>
                    </select>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {user.lastActive}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      </Card>

      <Card className="gap-0 py-0">
        <div className="border-b border-border/50 px-4 py-3">
          <h3 className="text-sm font-semibold">Pending invitations</h3>
          <p className="text-xs text-muted-foreground">
            {invitations.length} open · revoke stale access
          </p>
        </div>
        {invitations.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No pending invites.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="grid size-7 place-items-center rounded-full bg-muted text-muted-foreground">
                  <MailPlusIcon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {invitation.email}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {invitation.role} · expires {invitation.expires}
                  </p>
                </div>
                <RowActions
                  actions={[
                    {
                      label: "Revoke",
                      onSelect: () => removeInvitation(invitation.id),
                      tone: "danger",
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <RolesPanel canManage={canManageUsers} />

      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => (open ? setInviteOpen(true) : closeInvite())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {inviteResult?.ok ? "Invitation sent" : "Invite user"}
            </DialogTitle>
            <DialogDescription>
              {inviteResult?.ok
                ? "Share the link below — the invitation expires with the token."
                : "Sends an invitation link. Email delivery is stubbed — share the link that appears after sending."}
            </DialogDescription>
          </DialogHeader>
          {inviteResult?.ok ? (
            <div className="grid gap-3">
              <div className="flex items-start gap-2 rounded-md border border-[var(--success)]/30 bg-[color-mix(in_oklch,var(--success),transparent_90%)] px-3 py-2 text-xs">
                <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    Invitation sent to {inviteResult.invitation.email}
                  </p>
                  <p className="text-muted-foreground">
                    Role: {inviteResult.invitation.role} · Expires in{" "}
                    {inviteResult.invitation.expires}
                  </p>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Accept link</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    readOnly
                    value={inviteResult.acceptUrl}
                    className="font-mono text-xs"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <Button size="icon-sm" variant="outline" onClick={copyLink}>
                    {copied ? (
                      <CheckIcon className="size-3.5" />
                    ) : (
                      <ClipboardIcon className="size-3.5" />
                    )}
                    <span className="sr-only">Copy link</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Share this link with the recipient. It expires with the
                  invitation.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  disabled={!canManageUsers || pending}
                  placeholder="teammate@example.com"
                  type="email"
                  value={invitationForm.email}
                  onChange={(event) =>
                    setInvitationForm({
                      ...invitationForm,
                      email: event.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="invite-role">Role</Label>
                <select
                  id="invite-role"
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm disabled:opacity-50"
                  disabled={!canManageUsers || pending}
                  value={invitationForm.role}
                  onChange={(event) =>
                    setInvitationForm({
                      ...invitationForm,
                      role: event.target.value as AdminRole,
                    })
                  }
                >
                  {adminRoles
                    .filter((role) => role !== "Owner")
                    .map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                </select>
              </div>
              {inviteResult && !inviteResult.ok ? (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{inviteResult.message}</span>
                </div>
              ) : null}
              {!canManageUsers ? (
                <p className="text-xs text-muted-foreground">
                  Only Owner and Admin roles can invite or change users.
                </p>
              ) : null}
            </div>
          )}
          <DialogFooter>
            {inviteResult?.ok ? (
              <Button onClick={closeInvite}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={closeInvite}>
                  Cancel
                </Button>
                <Button
                  disabled={!canManageUsers || pending}
                  onClick={handleInvite}
                >
                  <MailPlusIcon className="size-4" />
                  {pending ? "Sending..." : "Send invite"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

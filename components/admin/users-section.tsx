"use client";

import { useState } from "react";
import { MailPlusIcon } from "lucide-react";

import {
  type AdminRole,
  type AdminUser,
  type AdminUserStatus,
  type Invitation,
} from "@/lib/admin-data";
import { adminRoles } from "@/components/admin/constants";
import { DataTable } from "@/components/admin/data-table";
import { RolesPanel } from "@/components/admin/roles-panel";
import { RowActions } from "@/components/admin/row-actions";
import { StatusDot } from "@/components/admin/status-dot";
import type { InvitationForm } from "@/components/admin/types";
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
  inviteUser: () => void;
  removeInvitation: (invitationId: string) => void;
  setInvitationForm: (form: InvitationForm) => void;
  updateUserRole: (userId: string, role: AdminRole) => void;
  updateUserStatus: (userId: string, status: AdminUserStatus) => void;
  users: AdminUser[];
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  function handleInvite() {
    inviteUser();
    setInviteOpen(false);
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

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
            <DialogDescription>
              Invitations are local mock records until Supabase tables are
              added.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                disabled={!canManageUsers}
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
                disabled={!canManageUsers}
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
            {!canManageUsers ? (
              <p className="text-xs text-muted-foreground">
                Only Owner and Admin roles can invite or change users.
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canManageUsers} onClick={handleInvite}>
              <MailPlusIcon className="size-4" />
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

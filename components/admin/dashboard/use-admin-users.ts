"use client";

import { useState } from "react";

import {
  initialAdminUsers,
  initialInvitations,
  type AdminRole,
  type AdminUserStatus,
  type Invitation,
} from "@/lib/admin-data";
import { emptyInvitationForm } from "@/components/admin/shared/constants";
import type { InvitationForm } from "@/components/admin/shared/types";

export type InviteResult =
  | { ok: true; acceptUrl: string; invitation: Invitation }
  | { ok: false; message: string };

export function useAdminUsers({
  currentRole: initialRole = "Owner",
  initialInvitations: initialInvitationList = initialInvitations,
  initialUsers: initialUserList = initialAdminUsers,
  userEmail: _userEmail,
}: {
  currentRole?: AdminRole;
  initialInvitations?: typeof initialInvitations;
  initialUsers?: typeof initialAdminUsers;
  userEmail?: string;
}) {
  const [users, setUsers] = useState(initialUserList);
  const [invitations, setInvitations] = useState(initialInvitationList);
  const [invitationForm, setInvitationForm] =
    useState<InvitationForm>(emptyInvitationForm);
  const [currentRole] = useState<AdminRole>(initialRole);
  const canManageUsers = currentRole === "Owner" || currentRole === "Admin";

  function updateUserRole(userId: string, role: AdminRole) {
    if (!canManageUsers || role === "Owner") {
      return;
    }

    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, role } : user)),
    );
  }

  function updateUserStatus(userId: string, status: AdminUserStatus) {
    if (!canManageUsers) {
      return;
    }

    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
  }

  async function inviteUser(): Promise<InviteResult> {
    const email = invitationForm.email.trim();

    if (!canManageUsers) {
      return { ok: false, message: "You don't have permission to invite users." };
    }
    if (!email) {
      return { ok: false, message: "Enter an email address." };
    }

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: invitationForm.role }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          ok: false,
          message:
            typeof body?.message === "string"
              ? body.message
              : "Unable to send invitation.",
        };
      }
      setInvitations((current) => [body.invitation as Invitation, ...current]);
      setInvitationForm(emptyInvitationForm);
      return {
        ok: true,
        acceptUrl: body.acceptUrl as string,
        invitation: body.invitation as Invitation,
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Network error.",
      };
    }
  }

  async function removeInvitation(invitationId: string) {
    if (!canManageUsers) {
      return;
    }

    const response = await fetch(
      `/api/invitations/${encodeURIComponent(invitationId)}`,
      { method: "DELETE" },
    ).catch(() => null);

    if (response && response.ok) {
      setInvitations((current) =>
        current.filter((invitation) => invitation.id !== invitationId),
      );
    }
  }

  return {
    users,
    invitations,
    invitationForm,
    setInvitationForm,
    currentRole,
    canManageUsers,
    updateUserRole,
    updateUserStatus,
    inviteUser,
    removeInvitation,
  };
}

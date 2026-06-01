"use client";

import { useState } from "react";

import {
  initialAdminUsers,
  initialInvitations,
  type AdminRole,
  type AdminUserStatus,
} from "@/lib/admin-data";
import { emptyInvitationForm } from "@/components/admin/shared/constants";
import type { InvitationForm } from "@/components/admin/shared/types";

export function useAdminUsers({ userEmail }: { userEmail?: string }) {
  const [users, setUsers] = useState(initialAdminUsers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [invitationForm, setInvitationForm] =
    useState<InvitationForm>(emptyInvitationForm);
  const [currentRole] = useState<AdminRole>("Owner");
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

  function inviteUser() {
    const email = invitationForm.email.trim();

    if (!canManageUsers || !email) {
      return;
    }

    setInvitations((current) => [
      {
        id: `INV-${Date.now()}`,
        email,
        role: invitationForm.role,
        invitedBy: userEmail ?? "Current user",
        expires: "7 days",
      },
      ...current,
    ]);
    setInvitationForm(emptyInvitationForm);
  }

  function removeInvitation(invitationId: string) {
    if (!canManageUsers) {
      return;
    }

    setInvitations((current) =>
      current.filter((invitation) => invitation.id !== invitationId),
    );
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

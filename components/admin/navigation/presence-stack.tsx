"use client";

const collaborators = [
  { id: "u1", name: "Nora Patel", tone: "bg-[var(--info)]" },
  { id: "u2", name: "Marco Diaz", tone: "bg-[var(--success)]" },
  { id: "u3", name: "Amina Clark", tone: "bg-[var(--warning)]" },
];

export function PresenceStack() {
  return (
    <div
      className="hidden items-center md:flex"
      aria-label={`${collaborators.length} teammates currently viewing`}
    >
      {collaborators.map((collaborator, index) => {
        const initials = collaborator.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <span
            key={collaborator.id}
            title={collaborator.name}
            style={{ marginLeft: index === 0 ? 0 : "-8px", zIndex: 10 - index }}
            className={`relative grid size-6 place-items-center overflow-hidden rounded-full border-2 border-background text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm ${collaborator.tone}`}
          >
            {initials}
          </span>
        );
      })}
      <span className="ml-2 hidden text-[11px] text-muted-foreground xl:inline">
        {collaborators.length} viewing
      </span>
    </div>
  );
}

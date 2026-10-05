import type { ReactNode } from 'react';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <p className="status-message" role="status">
      {label}
    </p>
  );
}

export function ErrorState({ error }: { error: Error | null }) {
  if (!error) {
    return null;
  }

  return (
    <p className="status-message status-error" role="alert">
      Something went wrong: {error.message}
    </p>
  );
}

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-title">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="page-title-row">
        <h1>{title}</h1>
        {action}
      </div>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}

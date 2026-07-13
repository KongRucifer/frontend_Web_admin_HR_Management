import * as React from 'react';

export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

'use client';

import { PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return <div>{children}</div>;
}

export default Providers;

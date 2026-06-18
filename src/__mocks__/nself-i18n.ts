import React from 'react';

export const NselfI18nProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

export const initializeI18next = () => Promise.resolve();

export type Locale = string;

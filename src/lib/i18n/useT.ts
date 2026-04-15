'use client';

import { useLang } from './LangContext';

export const useT = () => useLang().t;

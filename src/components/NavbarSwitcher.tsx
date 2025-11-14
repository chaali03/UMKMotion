'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import NavbarHome from '../../Home/NavbarHome/NavbarHome';
import HeaderNavbar from '../LandingPage/components/header/header';

export default function NavbarSwitcher() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setIsLoggedIn(!!user));
    return () => unsub();
  }, []);

  // Avoid flicker: render nothing until we know auth state
  if (isLoggedIn === null) return null;

  return isLoggedIn ? (
    <NavbarHome />
  ) : (
    <HeaderNavbar />
  );
}

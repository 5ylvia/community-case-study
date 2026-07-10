import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function useLoginGuard() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  function requireLogin() {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  }

  return { requireLogin, showLoginModal, setShowLoginModal };
}

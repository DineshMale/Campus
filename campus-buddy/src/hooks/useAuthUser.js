import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        localStorage.setItem(
          "campusUser",
          JSON.stringify({ uid: u.uid, email: u.email })
        );
      } else {
        setUser(null);
        localStorage.removeItem("campusUser");
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { user, loading };
}

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

axios.defaults.withCredentials = true;

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState({
    loading: true,
    authed: false,
    user: null,
  });
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async function verify() {
      try {
        const res = await api.get("/auth/verify");
        if (!mounted) return;
        if (res.status === 200 && res.data?.user) {
          setStatus({ loading: false, authed: true, user: res.data.user });
        } else {
          setStatus({ loading: false, authed: false, user: null });
        }
      } catch (err) {
        setStatus({ loading: false, authed: false, user: null });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (status.loading)
    return <div className="p-6">Checking authentication…</div>;
  if (!status.authed)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

//TASKZONE/app/index.jsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Index() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  if (loading) {
    return null;
  }

  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}

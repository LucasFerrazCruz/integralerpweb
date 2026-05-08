// import { redirect } from "next/navigation";

// export default function Home() {
//   redirect("/login");
// }
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Carregando GR Tools...</p>
    </div>
  );
}

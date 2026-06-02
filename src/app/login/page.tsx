import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-10">
      <Suspense fallback={<p className="w-full text-center text-slate-500">Загрузка...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

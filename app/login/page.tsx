import { getAuthSession } from "@/auth";
import { LoginForm } from "@/app/_components/login-form";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
};

function getFirstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeCallbackUrl(value: string | string[] | undefined) {
  const callbackUrl = getFirstQueryValue(value);

  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
  ) {
    return callbackUrl;
  }

  return "/dashboard";
}

function getLoginError(value: string | string[] | undefined) {
  const error = getFirstQueryValue(value);

  if (!error) {
    return undefined;
  }

  return "Email atau password tidak sesuai.";
}

export default async function Page({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const callbackUrl = getSafeCallbackUrl(query.callbackUrl);
  const session = await getAuthSession();

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          callbackUrl={callbackUrl}
          initialError={getLoginError(query.error)}
        />
      </div>
    </div>
  );
}

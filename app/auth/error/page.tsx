import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const errorParam =
    (typeof params?.error === "string"
      ? params.error
      : Array.isArray(params?.error)
      ? params.error[0]
      : undefined) ||
    (typeof params?.message === "string"
      ? params.message
      : Array.isArray(params?.message)
      ? params.message[0]
      : undefined);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {errorParam || "An unspecified error occurred."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

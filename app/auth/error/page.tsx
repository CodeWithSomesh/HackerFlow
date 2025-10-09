import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: PageProps) {
  const errorParam =
    (typeof searchParams?.error === "string"
      ? searchParams.error
      : Array.isArray(searchParams?.error)
      ? searchParams.error[0]
      : undefined) ||
    (typeof searchParams?.message === "string"
      ? searchParams.message
      : Array.isArray(searchParams?.message)
      ? searchParams.message[0]
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

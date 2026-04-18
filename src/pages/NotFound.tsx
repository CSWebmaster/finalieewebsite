
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TypingAnimation } from "@/components/TypingAnimation";

export default function NotFound() {
  return (
    <PageLayout showFooter>
      <main className="pb-16 min-h-screen flex items-center justify-center py-24">
        <div className="text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-primary mb-6">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            <TypingAnimation text={"We couldn't find the page you're looking for. The page might have been moved or doesn't exist."} />
          </p>
          <Button asChild>
            <Link to="/" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </main>
    </PageLayout>
  );
}

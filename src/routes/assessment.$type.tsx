import { createFileRoute, notFound } from "@tanstack/react-router";
import { AssessmentForm } from "@/components/assessment-form";
import { TYPE_META, type AssessmentType } from "@/lib/assessment-schema";

const VALID = ["child", "female", "male"] as const;

export const Route = createFileRoute("/assessment/$type")({
  loader: ({ params }) => {
    if (!VALID.includes(params.type as AssessmentType)) throw notFound();
    return { type: params.type as AssessmentType };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Assessment unavailable — AL-ATASH FIT" }, { name: "robots", content: "noindex" }] };
    }
    const label = TYPE_META[loaderData.type].en;
    const title = `${label} Weight Assessment — AL-ATASH FIT`;
    const description = `Complete the bilingual Urdu and English ${label.toLowerCase()} weight assessment form for AL-ATASH FIT, including BMI, medical history and lifestyle details.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: AssessmentPage,
});

function AssessmentPage() {
  const { type } = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-soft/50 to-background">
      <AssessmentForm type={type} />
    </main>
  );
}
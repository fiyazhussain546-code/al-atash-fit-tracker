import { createFileRoute, notFound } from "@tanstack/react-router";
import { ConsultancyAdmin } from "@/components/consultancy-admin";
import { SPECIALTIES, isSpecialtyKey } from "@/lib/specialties";

export const Route = createFileRoute("/admin/consultancy/$specialty")({
  loader: ({ params }) => {
    if (!isSpecialtyKey(params.specialty)) throw notFound();
    return { key: params.specialty };
  },
  head: ({ loaderData }) => {
    const name = loaderData ? SPECIALTIES[loaderData.key].en : "Consultancy";
    return {
      meta: [
        { title: `${name} — AL-ATASH FIT Admin` },
        { name: "description", content: `Private ${name} case management for the AL-ATASH FIT team.` },
        { property: "og:title", content: `${name} — AL-ATASH FIT Admin` },
        { property: "og:description", content: "Private staff area. Authorised team members only." },
        { name: "robots", content: "noindex, nofollow" },
      ],
    };
  },
  notFoundComponent: () => <p className="p-10 text-center">Unknown specialty.</p>,
  errorComponent: () => <p className="p-10 text-center">Could not open this page.</p>,
  component: SpecialtyAdmin,
});

function SpecialtyAdmin() {
  const { key } = Route.useLoaderData();
  return <ConsultancyAdmin key={key} specialty={key} />;
}

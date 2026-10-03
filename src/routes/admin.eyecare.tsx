import { createFileRoute } from "@tanstack/react-router";
import { ConsultancyAdmin } from "@/components/consultancy-admin";

export const Route = createFileRoute("/admin/eyecare")({
  head: () => ({
    meta: [
      { title: "Eye Care Consultancy — AL-ATASH FIT Admin" },
      { name: "description", content: "Private Eye Care Consultancy case management for the AL-ATASH FIT team." },
      { property: "og:title", content: "Eye Care Consultancy — AL-ATASH FIT Admin" },
      { property: "og:description", content: "Private staff area. Authorised AL-ATASH FIT team members only." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <ConsultancyAdmin specialty="eye-care" />,
});

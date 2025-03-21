import { Metadata } from "next";

export const metadata: Metadata = {
  title: "4-Box Report Builder | AIssistant Hub",
  description: "Create structured 4-box reports from your documents and communications."
};

export default function ReportBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
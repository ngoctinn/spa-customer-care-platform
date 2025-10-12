import React from "react";
import { PageHeader } from "@/components/common/PageHeader";

interface AdminDetailPageLayoutProps {
  title: string;
  description?: string;
  actionButtons?: React.ReactNode;
  mainContent: React.ReactNode;
  sideContent: React.ReactNode;
}

export const AdminDetailPageLayout = ({
  title,
  description,
  actionButtons,
  mainContent,
  sideContent,
}: AdminDetailPageLayoutProps) => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        actionNode={actionButtons}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Content (2/3 width on large screens) */}
        <div className="lg:col-span-2 flex flex-col gap-6">{mainContent}</div>
        {/* Side Content (1/3 width on large screens) */}
        <div className="lg:col-span-1 flex flex-col gap-6">{sideContent}</div>
      </div>
    </div>
  );
};

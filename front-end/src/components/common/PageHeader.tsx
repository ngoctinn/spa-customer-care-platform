// src/components/common/PageHeader.tsx

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string; // Thêm mô tả tùy chọn
  actionNode?: React.ReactNode; // Thay thế cho các props cũ
}

export const PageHeader = ({
  title,
  description,
  actionNode,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actionNode && <div>{actionNode}</div>}
    </div>
  );
};

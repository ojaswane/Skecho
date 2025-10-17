'use client'

type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

// Define the Breadcrumb component that accepts the items prop
function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex space-x-2">
        {items.map((item, idx) => (
          <li key={item.href}>
            <a href={item.href} className="text-blue-600 hover:underline">
              {item.label}
            </a>
            {idx < items.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function MoodboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Moodboard", href: "/moodboard" },
          { label: "Workspace", href: "/workspace" },
          { label: "Settings", href: "/settings" },
          { label: "Billing", href: "/settings" },
        ]}
      />

    </div>
  )
}

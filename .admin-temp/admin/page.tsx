import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard 
          title="Storage Setup" 
          description="Manage Supabase storage buckets and policies"
          href="/admin/storage-setup"
          icon="📁"
        />
        
        <AdminCard 
          title="Database Management" 
          description="Manage Supabase database settings"
          href="/admin/database"
          icon="🔄"
        />
        
        <AdminCard 
          title="User Management" 
          description="Manage users and permissions"
          href="/admin/users"
          icon="👥"
        />
        
        <AdminCard 
          title="System Settings" 
          description="Configure application settings"
          href="/admin/settings"
          icon="⚙️"
        />
        
        <AdminCard 
          title="Logs & Monitoring" 
          description="View system logs and performance metrics"
          href="/admin/logs"
          icon="📊"
        />
        
        <AdminCard 
          title="API Keys" 
          description="Manage API keys and access tokens"
          href="/admin/api-keys"
          icon="🔑"
        />
      </div>
    </div>
  );
}

interface AdminCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

function AdminCard({ title, description, href, icon }: AdminCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-gray-600">{description}</p>
        <div className="mt-4 flex justify-end">
          <span className="text-blue-600 hover:underline">Manage &rarr;</span>
        </div>
      </div>
    </Link>
  );
} 
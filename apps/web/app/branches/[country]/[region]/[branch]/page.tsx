import { notFound } from 'next/navigation';
import { useBranch } from '@/hooks/use-api-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BranchPageProps {
  params: {
    country: string;
    region: string;
    branch: string;
  };
}

export default function BranchPage({ params }: BranchPageProps) {
  const { data: branch, isLoading, error } = useBranch(params.branch);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{branch.name}</h1>
        <p className="text-lg text-gray-600">{branch.address}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Times */}
          <Card>
            <CardHeader>
              <CardTitle>Service Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {branch.service_times.map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <span className="font-medium">{service.day}</span>
                      <span className="text-gray-600 ml-2">({service.type})</span>
                    </div>
                    <span className="text-gray-900">{service.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About This Branch */}
          <Card>
            <CardHeader>
              <CardTitle>About Our Branch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Welcome to {branch.name}, a vibrant community of believers in the {params.region} area. 
                We're committed to serving our community and helping people grow in their relationship with God.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Phone:</strong> {branch.phone}</p>
              <p><strong>Email:</strong> {branch.email}</p>
            </CardContent>
          </Card>

          {/* Pastoral Team */}
          <Card>
            <CardHeader>
              <CardTitle>Pastoral Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {branch.pastors.map((pastor) => (
                  <div key={pastor.id} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium">{pastor.name}</p>
                    <p className="text-sm text-gray-600">{pastor.role}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/guest/connect">Plan Your Visit</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/branches/${params.country}/${params.region}/${params.branch}/events`}>
                  View Events
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/branches/${params.country}/${params.region}/${params.branch}/sermons`}>
                  Listen to Sermons
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

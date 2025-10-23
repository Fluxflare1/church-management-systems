import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MissionPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Mission & Vision</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            To build a thriving community of believers who love God, serve people, and transform nations through the power of the Gospel.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-2xl leading-relaxed">
              "To know Christ and to make Him known through worship, discipleship, and compassionate service to our communities."
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Vision */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We envision a global network of vibrant churches where every member is equipped, every family is strengthened, 
                and every community is transformed by the love of Christ.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Churches planted in every nation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Disciples making disciples across generations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Communities transformed by biblical values</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Leaders raised to impact their spheres of influence</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Core Focus */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">Our Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Worship</h3>
                <p className="text-gray-700">Creating authentic encounters with God through passionate worship and prayer.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Discipleship</h3>
                <p className="text-gray-700">Equipping believers to grow in faith and fulfill their God-given purpose.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Community</h3>
                <p className="text-gray-700">Building genuine relationships that reflect Christ's love and support.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Mission</h3>
                <p className="text-gray-700">Extending God's kingdom through local and global outreach initiatives.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Goals */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Strategic Goals 2024-2028</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <h3 className="font-semibold text-gray-900 mb-2">New Branches</h3>
              <p className="text-gray-600 text-sm">Planting churches across Africa and Europe</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K</div>
              <h3 className="font-semibold text-gray-900 mb-2">Disciples Trained</h3>
              <p className="text-gray-600 text-sm">Through our leadership development programs</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Projects</h3>
              <p className="text-gray-600 text-sm">Transforming lives through practical service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

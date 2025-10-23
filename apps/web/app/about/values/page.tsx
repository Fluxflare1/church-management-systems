import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const values = [
  {
    title: "Biblical Authority",
    description: "We submit to the absolute authority of Scripture in all matters of faith and practice.",
    icon: "📖",
    color: "from-blue-500 to-blue-700"
  },
  {
    title: "Spiritual Family",
    description: "We prioritize authentic relationships and mutual care as the body of Christ.",
    icon: "👨‍👩‍👧‍👦",
    color: "from-green-500 to-green-700"
  },
  {
    title: "Excellence",
    description: "We do everything with excellence as unto the Lord, honoring Him with our best.",
    icon: "⭐",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    title: "Generosity",
    description: "We give freely of our time, talents, and resources to advance God's kingdom.",
    icon: "💝",
    color: "from-red-500 to-red-700"
  },
  {
    title: "Innovation",
    description: "We embrace creativity and new methods to effectively reach each generation.",
    icon: "💡",
    color: "from-purple-500 to-purple-700"
  },
  {
    title: "Servant Leadership",
    description: "We lead by serving, following Christ's example of humility and sacrifice.",
    icon: "🛠️",
    color: "from-orange-500 to-orange-700"
  }
];

export default function ValuesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that shape our culture, guide our decisions, and define who we are as a church family.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
              <CardHeader className={`bg-gradient-to-br ${value.color} text-white rounded-t-lg p-6`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                  <span className="text-2xl">{value.icon}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Culture Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Church Culture</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Embrace</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Authentic worship and passionate prayer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Radical hospitality and warm welcome</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Continuous learning and spiritual growth</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Celebrating diversity and unity in Christ</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Practice</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>Speaking truth in love and grace</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>Honoring leadership and respecting authority</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>Maintaining purity and integrity</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>Pursuing peace and resolving conflicts biblically</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Out These Values With Us</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our values come alive in community. Join us as we grow together in faith and impact our world for Christ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="/guest/connect">Visit a Service</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/about/beliefs">Explore Our Beliefs</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const leadershipTeams = [
  {
    title: "Global Executive Team",
    description: "Overseeing the international vision and direction of THOGMi",
    members: [
      {
        name: "Apostle John & Pastor Sarah Mensah",
        role: "Founders & International Overseers",
        bio: "With over 30 years of ministry experience, Apostle John and Pastor Sarah have dedicated their lives to building God's kingdom across nations.",
        image: "/images/leadership/mensah.jpg"
      },
      {
        name: "Bishop David Chen",
        role: "International Director of Operations",
        bio: "Bishop David brings strategic leadership and administrative excellence to our global network of churches.",
        image: "/images/leadership/chen.jpg"
      }
    ]
  },
  {
    title: "Regional Bishops",
    description: "Providing apostolic oversight to regions and nations",
    members: [
      {
        name: "Bishop Michael Adebayo",
        role: "Regional Bishop - West Africa",
        bio: "Overseeing the growth and development of THOGMi churches across West Africa.",
        image: "/images/leadership/adebayo.jpg"
      },
      {
        name: "Bishop Thomas Okafor",
        role: "Regional Bishop - Central Africa",
        bio: "Leading church planting initiatives and leadership development in Central Africa.",
        image: "/images/leadership/okafor.jpg"
      },
      {
        name: "Bishop Rachel Nwosu",
        role: "Regional Bishop - Europe",
        bio: "Pioneering THOGMi's expansion across European nations with a focus on diaspora communities.",
        image: "/images/leadership/nwosu.jpg"
      }
    ]
  },
  {
    title: "Ministry Directors",
    description: "Leading specialized ministry departments",
    members: [
      {
        name: "Pastor Daniel Kwame",
        role: "Director of Discipleship & Training",
        bio: "Developing comprehensive discipleship programs and leadership training curriculum.",
        image: "/images/leadership/kwame.jpg"
      },
      {
        name: "Pastor Grace Oluwaseun",
        role: "Director of Worship & Creative Arts",
        bio: "Leading our worship teams and creative expressions across all branches.",
        image: "/images/leadership/oluwaseun.jpg"
      },
      {
        name: "Dr. Samuel Johnson",
        role: "Director of Community Development",
        bio: "Overseeing humanitarian projects and community transformation initiatives.",
        image: "/images/leadership/johnson.jpg"
      }
    ]
  }
];

export default function LeadershipPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated leaders God has raised to shepherd THOGMi and advance His kingdom across the globe.
          </p>
        </div>

        {/* Leadership Teams */}
        {leadershipTeams.map((team, teamIndex) => (
          <section key={teamIndex} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{team.title}</h2>
              <p className="text-gray-600 text-lg">{team.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.members.map((leader, leaderIndex) => (
                <Card key={leaderIndex} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Photo</span>
                    </div>
                    <CardTitle className="text-xl text-gray-900">{leader.name}</CardTitle>
                    <p className="text-blue-600 font-medium">{leader.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm leading-relaxed">{leader.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Leadership Philosophy */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">Our Leadership Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Servant Leadership</h3>
              <p className="text-blue-700 mb-4">
                We believe leadership is about serving, not being served. Our leaders follow Christ's example of washing feet and putting others first.
              </p>
              <ul className="text-blue-700 space-y-2">
                <li>• Lead by example and character</li>
                <li>• Empower and develop others</li>
                <li>• Serve with humility and integrity</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Team Ministry</h3>
              <p className="text-blue-700 mb-4">
                We function as a team, recognizing that we need each other's gifts and perspectives to fulfill God's purpose.
              </p>
              <ul className="text-blue-700 space-y-2">
                <li>• Collaborative decision-making</li>
                <li>• Mutual accountability</li>
                <li>• Shared vision and responsibility</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Leadership */}
        <div className="text-center bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect With Our Leaders</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our leaders are accessible and committed to serving you. Reach out with questions, prayer requests, or for spiritual guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="/contact">Send a Message</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/prayer">Request Prayer</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const beliefs = [
  {
    title: "The Bible",
    description: "We believe the Bible is the inspired, infallible, and authoritative Word of God. It is our final authority in all matters of faith and conduct.",
    scripture: "2 Timothy 3:16-17"
  },
  {
    title: "The Trinity",
    description: "We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit, equal in power and glory.",
    scripture: "Matthew 28:19"
  },
  {
    title: "Jesus Christ",
    description: "We believe in the deity of Jesus Christ, His virgin birth, sinless life, miracles, atoning death, bodily resurrection, ascension, and personal return.",
    scripture: "John 1:1-14"
  },
  {
    title: "Salvation",
    description: "We believe salvation is by grace through faith in Jesus Christ alone, not by works. It is available to all who repent and believe.",
    scripture: "Ephesians 2:8-9"
  },
  {
    title: "The Church",
    description: "We believe the Church is the body of Christ, composed of all true believers, and exists to worship God and fulfill the Great Commission.",
    scripture: "1 Corinthians 12:12-27"
  },
  {
    title: "The Holy Spirit",
    description: "We believe in the present ministry of the Holy Spirit, who indwells, guides, instructs, and empowers believers for Christian living and service.",
    scripture: "Acts 1:8"
  },
  {
    title: "Eternal Life",
    description: "We believe in the resurrection of both the saved and the lost; the saved to eternal life with God, and the lost to eternal separation from God.",
    scripture: "John 3:16"
  },
  {
    title: "The Great Commission",
    description: "We believe in the urgency of evangelism and discipleship, fulfilling Christ's command to make disciples of all nations.",
    scripture: "Matthew 28:19-20"
  }
];

export default function BeliefsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Beliefs</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The foundational truths that guide our ministry and shape our community at THOGMi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {beliefs.map((belief, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">{belief.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{belief.description}</p>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 font-medium">{belief.scripture}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Want to Learn More?</h2>
          <p className="text-blue-800 mb-6 max-w-2xl mx-auto">
            Our beliefs shape everything we do. If you have questions or want to explore these truths further, 
            we'd love to connect with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="/guest/connect">Connect With Us</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/about/leadership">Meet Our Leaders</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

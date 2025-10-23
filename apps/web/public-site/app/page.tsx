import { HeroSection } from '@/components/home/HeroSection'
import { LiveStreamsSection } from '@/components/streaming/LiveStreamsSection'
import { FeaturedEvents } from '@/components/events/FeaturedEvents'
import { RecentSermons } from '@/components/sermons/RecentSermons'
import { BranchSpotlight } from '@/components/branches/BranchSpotlight'

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Dynamic Content */}
      <HeroSection />
      
      {/* Live Streaming Section */}
      <LiveStreamsSection />
      
      {/* Featured Events */}
      <FeaturedEvents />
      
      {/* Recent Sermons */}
      <RecentSermons />
      
      {/* Branch Spotlight */}
      <BranchSpotlight />
    </div>
  )
}

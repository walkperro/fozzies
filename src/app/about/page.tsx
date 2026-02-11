import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">

      <div className="mb-10 overflow-hidden rounded-none border border-charcoal/10 bg-cream">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/gallery/chef_making_food.jpg"
            alt="Chef plating a dish"
            fill
            className="object-cover object-[50%_62%]"
            sizes="(min-width: 768px) 70vw, 100vw"
            priority={false}
          />
        </div>
      </div>

      <h1 className="font-serif text-4xl text-charcoal">About</h1>
      <p className="mt-3 max-w-2xl text-softgray">
        Chef-driven. Globally inspired. Rooted in Southern hospitality.
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="space-y-6 text-charcoal leading-relaxed">
          <p>
            Born and raised in Birmingham, Alabama, Chef Jason Head brings to Cookeville a culinary journey shaped by travel, discipline, and a lifelong love of hospitality. A graduate of the University of Mississippi with a degree in Music (Voice), his early years were marked by exploration—traveling to more than fifteen countries across the Caribbean, Central America, and Europe, and even spending time in Fairbanks, Alaska.
          </p>

          <p>
            Before stepping fully into the culinary world, he spent nearly two decades in the securities industry—an experience that refined his leadership, work ethic, and commitment to excellence. In 2021, he founded GameDay Gourmet, a catering company known for elevated tailgate spreads, holiday gatherings, and private celebrations—where his passion for bringing people together truly took shape.
          </p>

          <p>
            While in college, Jason earned the nickname “Fozzie,” inspired by his bright red beard and natural ability to make others smile. The name stuck—reflecting both his warmth and the welcoming spirit that defines his kitchen today.
          </p>
        </div>

        <div className="space-y-6 text-charcoal leading-relaxed">
          <p>
            Influenced by Mediterranean, Asian, Cajun, Hispanic, and classic Southern traditions, Chef Jason’s cuisine blends global inspiration with regional comfort. Each dish is thoughtfully crafted—refined, yet approachable—designed to create experiences that linger long after the last bite.
          </p>

          <p>
            For Chef Jason, the philosophy is simple:
            <span className="block mt-3 font-serif text-xl text-charcoal">
              Food brings people together, and the most meaningful memories are made at the table.
            </span>
          </p>

          <p>
            Whether it’s a celebration, a quiet dinner, or a gathering of old friends, he believes hospitality should feel both elevated and deeply personal. With deep family ties to Cookeville since 2001 and a heart rooted in service, he is honored to share his vision with the community—and looks forward to welcoming you to Fozzie’s.
          </p>
        </div>
      </div>

    </main>
  );
}

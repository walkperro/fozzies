import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

      <div className="mb-16 overflow-hidden border border-charcoal/10 bg-cream">
        <div className="relative h-[60vh] min-h-[420px] w-full">
          <Image
            src="/gallery/chef_making_food.jpg"
            alt="Chef plating a dish"
            fill
            className="object-cover object-[50%_35%]"
            sizes="100vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/15 to-transparent"></div>
        </div>
      </div>

      <div className="max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl text-charcoal">
          About
        </h1>

        <p className="mt-4 text-softgray tracking-wide">
          Chef-driven. Globally inspired. Rooted in Southern hospitality.
        </p>

        <div className="mt-6 h-px w-24 bg-warmgold"></div>
      </div>

      <div className="mt-16 grid gap-16 md:grid-cols-2">
        <div className="space-y-8 text-charcoal leading-8">
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

        <div className="space-y-8 text-charcoal leading-8">
          <p>
            Influenced by Mediterranean, Asian, Cajun, Hispanic, and classic Southern traditions, Chef Jason’s cuisine blends global inspiration with regional comfort. Each dish is thoughtfully crafted—refined, yet approachable—designed to create experiences that linger long after the last bite.
          </p>

          <div>
            <p className="text-sm uppercase tracking-widest text-softgray">
              His Philosophy
            </p>

            <p className="mt-4 font-serif text-2xl md:text-3xl text-charcoal">
              Food brings people together, and the most meaningful memories are made at the table.
            </p>
          </div>

          <p>
            Whether it’s a celebration, a quiet dinner, or a gathering of old friends, he believes hospitality should feel both elevated and deeply personal. With deep family ties to Cookeville since 2001 and a heart rooted in service, he is honored to share his vision with the community—and looks forward to welcoming you to Fozzie’s.
          </p>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-20 flex justify-center">
        <div className="relative w-48 h-20 opacity-80">
          <Image
            src="/brand/fozzie_sig.png"
            alt="Chef Jason Signature"
            fill
            className="object-contain"
          />
        </div>
      </div>

    </main>
  );
}

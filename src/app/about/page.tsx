import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      
      <div className="mb-10 overflow-hidden rounded-3xl border border-charcoal/10 bg-cream shadow-sm">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="/gallery/chef_making_food.jpg"
            alt="Chef plating a dish"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 70vw, 100vw"
            priority={false}
          />
        </div>
      </div>

<h1 className="font-serif text-4xl text-charcoal">About</h1>
      <p className="mt-3 max-w-2xl text-softgray">
        Chef-owned. Craft-driven. Built for memorable evenings.
      </p>
    </main>
  );
}

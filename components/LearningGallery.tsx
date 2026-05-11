import Image from "next/image";

const galleryItems = [
  {
    title: "Workplace Dynamics",
    image: "/images/workplace-dynamics.png",
  },
  {
    title: "Strategic Planning",
    image: "/images/strategic-planning.png",
  },
  {
    title: "Public Speaking",
    image: "/images/public-speaking.png",
  },
] as const;

export default function LearningGallery() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#40513b]">
          Learning Gallery
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {galleryItems.map((item) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-[18px] shadow-[0_18px_40px_rgba(64,81,59,0.18)]"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={520}
              height={320}
              className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="text-lg font-semibold text-white">{item.title}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

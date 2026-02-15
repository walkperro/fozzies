import JoinTeamForm from "@/components/JoinTeamForm";

export default function JoinTheTeamPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="text-[11px] tracking-[0.18em] text-softgray">CAREERS</div>
      <h1 className="mt-2 font-serif text-4xl text-charcoal">Join The Team</h1>
      <p className="mt-3 max-w-2xl text-softgray">
        We’re always looking for warm hospitality professionals and culinary talent to join Fozzie’s Dining.
      </p>
      <JoinTeamForm />
    </main>
  );
}

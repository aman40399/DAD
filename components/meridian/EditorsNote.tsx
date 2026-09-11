interface EditorsNoteProps {
  quote?: string
  author?: string
}

export default function EditorsNote({
  quote = 'Our reporters in Frankfurt, Lagos and Seoul filed three stories this morning that, read together, describe the same machine from three angles.',
  author = 'Marta Reyes',
}: EditorsNoteProps) {
  return (
    <section className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule p-4 mt-6">
      <h4 className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-ink-mute dark:text-dark-mute mb-2">
        Editor&apos;s Note
      </h4>
      <p className="font-serif italic text-[14px] sm:text-[15px] leading-relaxed text-ink dark:text-dark-ink my-2">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="font-sans text-[11px] font-semibold tracking-wider uppercase text-ink-mute dark:text-dark-mute mt-2">
        — {author}
      </p>
    </section>
  )
}

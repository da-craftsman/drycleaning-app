/** Placeholder content for routes not yet built out — confirms routing/layout end to end. */
function PageStub({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">
        {title}
      </h1>
      {note && <p className="mt-stack-sm text-body-md text-on-surface-variant">{note}</p>}
    </div>
  )
}

export { PageStub }

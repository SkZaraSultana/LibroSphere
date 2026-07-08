import React from 'react'

export default function About() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">About LibroSphere</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>A modern SaaS platform for library operations.</h1>
          <p className="mt-3 text-base leading-7 text-[var(--color-text-2)]">LibroSphere is built for schools, universities, public libraries, and organizations that need a secure, responsive, and data-driven way to manage books, members, lending, and reporting.</p>
        </div>

        <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[0_20px_60px_rgba(75,53,42,0.06)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">What we do</p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>Bring library workflows to the cloud.</h2>
          <p className="mt-4 text-[var(--color-text-2)]">We help institutions move away from spreadsheets and paper, and deliver a polished interface for librarians to manage every step of library operations.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[0_20px_60px_rgba(75,53,42,0.06)]">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>Mission</h2>
          <p className="mt-3 text-[var(--color-text-2)]">To simplify and modernize library operations while reducing administrative overhead and improving user experiences.</p>
        </div>
        <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[0_20px_60px_rgba(75,53,42,0.06)]">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>Vision</h2>
          <p className="mt-3 text-[var(--color-text-2)]">A future where every library has transparent, secure, and scalable management tools that keep communities informed and engaged.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Book Management', copy: 'Catalog books with metadata, barcode details, editions, and digital assets in one organized system.' },
          { title: 'Member Management', copy: 'Track members, memberships, borrowing history, and communication preferences securely.' },
          { title: 'Borrow System', copy: 'Issue books, monitor due dates, and log returns with clear status updates.' },
        ].map((item) => (
          <div key={item.title} className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[0_20px_60px_rgba(75,53,42,0.06)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: 'Poppins' }}>{item.title}</h3>
            <p className="mt-3 text-[var(--color-text-2)]">{item.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[0_20px_60px_rgba(75,53,42,0.06)]">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Responsive Design</h3>
          <p className="mt-3 text-[var(--color-text-2)]">A premium UI that flows beautifully across desktop, tablet, and mobile devices.</p>
        </div>
        <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[0_20px_60px_rgba(75,53,42,0.06)]">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Why We Built LibroSphere</h3>
          <p className="mt-3 text-[var(--color-text-2)]">To remove manual library administration work and provide teams with a truly modern platform for growth.</p>
        </div>
      </div>
    </section>
  )
}

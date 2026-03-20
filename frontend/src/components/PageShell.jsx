function PageShell({ children }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-white/40 bg-white/85 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        {children}
      </section>
    </main>
  );
}

export default PageShell;


import Footer from '@/components/footer';
import Header from '@/components/header';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-16">
        <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert mx-auto py-12 px-4">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}

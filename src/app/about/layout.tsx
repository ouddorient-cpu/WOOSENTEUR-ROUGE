
import Footer from '@/components/footer';
import Header from '@/components/header';

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow pt-28 pb-16">
        <article className="container mx-auto px-4">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';

export default function TermsOfServicePage() {
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animate-fade-in')) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl pt-8">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Uslovi korištenja' },
          ]}
        />
      </div>

      {/* Hero Section */}
      <section 
        data-animate-section
        className="relative py-16 mb-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-5xl max-md:text-4xl max-sm:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Uslovi korištenja
            </h1>
            <p
              className="text-xl max-md:text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Molimo vas da pažljivo pročitate ove uslove korištenja prije korištenja naše web stranice i usluga.
              Koristeći našu stranicu, prihvatate ove uslove u cijelosti.
            </p>
            <p
              className="text-sm"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Zadnje ažuriranje: 1. januar 2025.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl">
          <div className="space-y-8">
            {/* 1. Prihvaćanje uslova */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                1. Prihvaćanje uslova
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Pristupom i korištenjem web stranice Košnica.ba, vi prihvatate da budete vezani ovim uslovima korištenja,
                svim primjenjivim zakonima i propisima, i prihvatate da ste odgovorni za poštovanje svih lokalnih zakona.
                Ako se ne slažete sa bilo kojim od ovih uslova, ne smijete koristiti ili pristupati ovoj stranici.
              </p>
            </div>

            {/* 2. Opis usluga */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                2. Opis usluga
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Košnica.ba je platforma koja povezuje pčelare sa kupcima koji žele kupiti prirodan med. Naša web stranica
                pruža mogućnost pregledavanja proizvoda, naručivanja i informacija o pčelarima i njihovim proizvodima.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Zadržavamo pravo da u bilo kojem trenutku promijenimo, suspendiramo ili prekinemo bilo koji aspekt
                usluge bez prethodne najave.
              </p>
            </div>

            {/* 3. Registracija i račun */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                3. Registracija i korisnički račun
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Za korištenje određenih funkcionalnosti naše stranice, možda ćete morati kreirati korisnički račun.
                Prilikom registracije, obavezni ste da:
              </p>
              <ul className="space-y-2 mb-4 ml-4">
                {[
                  'Pružite tačne, aktuelne i potpune informacije',
                  'Održavate i ažurirate svoje podatke kako bi ostali tačni',
                  'Čuvate sigurnost svog računa i lozinke',
                  'Snosite odgovornost za sve aktivnosti koje se odvijaju pod vašim računom',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      • {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Naručivanje i plaćanje */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                4. Naručivanje i plaćanje
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Prilikom naručivanja proizvoda preko naše platforme:
              </p>
              <ul className="space-y-2 mb-4 ml-4">
                {[
                  'Svi cijene proizvoda su prikazane u konvertibilnim markama (KM)',
                  'Rezerviramo pravo da promijenimo cijene bez prethodne najave',
                  'Plaćanje se vrši putem sigurnih metoda plaćanja',
                  'Naručivanje je potvrđeno tek nakon uspješnog plaćanja',
                  'Dostupnost proizvoda može se mijenjati i ne garantujemo dostupnost svih proizvoda',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      • {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Dostava */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                5. Dostava
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Detaljne informacije o dostavi, uključujući vrijeme dostave, troškove i proces praćenja, dostupne su na{' '}
                <Link href="/dostava-i-povrati" className="underline hover:no-underline" style={{ color: 'var(--blue-primary)' }}>
                  stranici Dostava i povrati
                </Link>.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Ne snosimo odgovornost za kašnjenja u dostavi koja su uzrokovana trećim stranama ili slučajnim okolnostima
                izvan naše kontrole.
              </p>
            </div>

            {/* 6. Povrat i zamjena */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                6. Povrat i zamjena
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Pravila povrata i zamjene proizvoda detaljno su objašnjena na{' '}
                <Link href="/dostava-i-povrati" className="underline hover:no-underline" style={{ color: 'var(--blue-primary)' }}>
                  stranici Dostava i povrati
                </Link>.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Vaša prava na povrat nisu naštetila vašim zakonskim pravima kao potrošača.
              </p>
            </div>

            {/* 7. Intelektualna svojina */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                7. Intelektualna svojina
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Sav sadržaj na ovoj stranici, uključujući ali ne ograničavajući se na tekst, grafiku, logotipe, ikone,
                slike, audio zapise, digitalne datoteke i softver, je vlasništvo Košnica.ba ili njenih dobavljača sadržaja
                i zaštićen je zakonima o autorskim pravima i drugim zakonima o intelektualnoj svojini.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Ne smijete reproducirati, distribuirati, modificirati, stvarati izvedene radove, javno prikazivati,
                javno izvoditi, republishirati, preuzimati, skladištiti ili prenositi bilo koji materijal sa naše stranice
                bez prethodne pismene dozvole.
              </p>
            </div>

            {/* 8. Lični podaci */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                8. Zaštita ličnih podataka
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Vaša privatnost nam je važna. Detaljne informacije o tome kako prikupljamo, koristimo i štitimo vaše lične
                podatke mogu se pronaći u našoj{' '}
                <Link href="/politika-privatnosti" className="underline hover:no-underline" style={{ color: 'var(--blue-primary)' }}>
                  Politici privatnosti
                </Link>.
              </p>
            </div>

            {/* 9. Ograničenje odgovornosti */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                9. Ograničenje odgovornosti
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Košnica.ba djeluje kao platforma koja povezuje kupce i pčelare. Ne snosimo direktnu odgovornost za kvalitet,
                sigurnost ili dostupnost proizvoda koje prodaju pčelari preko naše platforme.
              </p>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                U maksimalnoj mjeri dopuštenoj zakonom, Košnica.ba i njeni direktorii, zaposlenici, agenti i dobavljači neće
                biti odgovorni za bilo kakve direktne, indirektne, slučajne, posebne ili posljedične štete koje proizlaze iz
                ili su u vezi sa korištenjem ili nemogućnošću korištenja naše stranice ili usluga.
              </p>
            </div>

            {/* 10. Promjene uslova */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                10. Promjene uslova
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Zadržavamo pravo da u bilo kojem trenutku modificiramo ove uslove korištenja. Sve promjene će biti objavljene
                na ovoj stranici uz ažuriran datum "Zadnje ažuriranje". Vaše nastavno korištenje stranice nakon objavljivanja
                promjena predstavlja vaše prihvaćanje revidiranih uslova.
              </p>
            </div>

            {/* 11. Raskid */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                11. Raskid
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Možemo suspendirati ili prekinuti vaš pristup našoj stranici odmah, bez prethodne najave ili odgovornosti,
                iz bilo kojeg razloga, uključujući ako kršite ove uslove korištenja.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Po raskidu, vaše pravo na korištenje stranice će prestati odmah.
              </p>
            </div>

            {/* 12. Primjenjivo pravo */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                12. Primjenjivo pravo
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Ovi uslovi korištenja se rješavaju i tumače u skladu sa zakonima Bosne i Hercegovine. Svi sporovi koji proizlaze
                iz ili su u vezi sa ovim uslovima bit će podložni isključivo nadležnosti sudova u Bosni i Hercegovini.
              </p>
            </div>

            {/* 13. Kontakt */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                13. Kontakt
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Ako imate pitanja o ovim uslovima korištenja, molimo kontaktirajte nas:
              </p>
              <ul className="space-y-2 ml-4">
                <li
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Email: <a href="mailto:info@kosnica.ba" className="underline hover:no-underline" style={{ color: 'var(--blue-primary)' }}>info@kosnica.ba</a>
                </li>
                <li
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Telefon: <a href="tel:+38733123456" className="underline hover:no-underline" style={{ color: 'var(--blue-primary)' }}>+387 33 123 456</a>
                </li>
                <li
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Adresa: Ulica Pčelara 123, 71000 Sarajevo, BiH
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl text-center">
          <h2
            className="text-3xl max-md:text-2xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Imate pitanja o uslovima korištenja?
          </h2>
          <p
            className="text-lg mb-8"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Kontaktirajte nas i rado ćemo vam odgovoriti
          </p>
          <Link
            href={ROUTES.CONTACT}
            className="inline-block px-8 py-4 rounded-lg font-semibold text-base transition-all"
            style={{
              backgroundColor: 'var(--honey-gold)',
              color: 'white',
              fontFamily: 'var(--font-inter)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--honey-light)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Kontaktirajte nas
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';

export default function FAQPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

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

  const faqCategories = [
    {
      id: 'opcenito',
      title: 'Općenito',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      questions: [
        {
          id: 1,
          question: 'Šta je Košnica.ba?',
          answer: 'Košnica.ba je platforma koja povezuje pčelare sa kupcima koji žele kupiti prirodan, sirovi med direktno od proizvođača. Naša misija je promovirati lokalno pčelarstvo i omogućiti ljudima pristup kvalitetnom medu iz cijele Bosne i Hercegovine.',
        },
        {
          id: 2,
          question: 'Kako mogu naručiti proizvode?',
          answer: 'Možete naručiti proizvode direktno sa naše web stranice. Jednostavno dodajte proizvode u korpu, prilikom naplate unesite svoje podatke i adresu za dostavu, zatim izaberite način plaćanja i završite narudžbu. Također možete nas kontaktirati putem telefona ili emaila za pomoć pri naručivanju.',
        },
        {
          id: 3,
          question: 'Da li su svi proizvodi prirodni?',
          answer: 'Da, svi proizvodi na našoj platformi su 100% prirodni i dolaze direktno od provjerenih pčelara. Ne koristimo nikakve dodatke, konzervanse ili tretmane. Svaki proizvod je provjeren i odobren prije nego što bude dostupan za prodaju.',
        },
        {
          id: 4,
          question: 'Kako mogu biti siguran u kvalitet proizvoda?',
          answer: 'Naš tim pažljivo provjerava sve pčelare i njihove proizvode prije nego što ih dodamo na platformu. Svi proizvodi moraju ispunjavati naše stroge kriterije kvaliteta i zdravstvene standarde. Također, svaki proizvod ima detaljne informacije o pčelaru koji ga proizvodi, lokaciji i načinu proizvodnje.',
        },
      ],
    },
    {
      id: 'narucivanje',
      title: 'Naručivanje i plaćanje',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      questions: [
        {
          id: 5,
          question: 'Koje metode plaćanja prihvatate?',
          answer: 'Prihvatamo gotovinsko plaćanje preuzećem, bankovni transfer i kartično plaćanje. Sve metode plaćanja su sigurne i zaštićene. Detalje o plaćanju dobićete prilikom završetka narudžbe.',
        },
        {
          id: 6,
          question: 'Kada ću biti naplaćen?',
          answer: 'Za plaćanje preuzećem, naplata se vrši prilikom primitka proizvoda. Za kartično plaćanje i bankovni transfer, naplata se vrši odmah nakon potvrde narudžbe.',
        },
        {
          id: 7,
          question: 'Mogu li promijeniti ili otkazati narudžbu?',
          answer: 'Možete promijeniti ili otkazati narudžbu kontaktiranjem nas na info@kosnica.ba ili +387 33 123 456 u roku od 24 sata nakon slanja narudžbe, prije nego što bude otpremljena. Nakon otpreme, možete iskoristiti našu politiku povrata.',
        },
        {
          id: 8,
          question: 'Da li dobijam potvrdu narudžbe?',
          answer: 'Da, nakon što pošaljete narudžbu, dobićete email potvrdu sa svim detaljima vaše narudžbe, uključujući broj narudžbe, listu proizvoda, cijenu i informacije o dostavi.',
        },
      ],
    },
    {
      id: 'dostava',
      title: 'Dostava',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      questions: [
        {
          id: 9,
          question: 'Kako funkcioniše dostava?',
          answer: 'Naša logistička mreža organizuje dostavu za sve proizvode. Standardna dostava traje 2-5 radnih dana, a brza dostava (1-2 radna dana) dostupna je za veće gradove. Troškovi dostave se izračunavaju na osnovu težine i udaljenosti. Dostava je besplatna za narudžbe preko 50 KM.',
        },
        {
          id: 10,
          question: 'Da li dostavljate van Bosne i Hercegovine?',
          answer: 'Trenutno isporučujemo samo na teritoriju Bosne i Hercegovine. Za međunarodne isporuke, molimo kontaktirajte nas na info@kosnica.ba za više informacija i posebne aranžmane.',
        },
        {
          id: 11,
          question: 'Kako mogu pratiti status svoje narudžbe?',
          answer: 'Nakon što vaša narudžba bude otpremljena, dobićete email sa brojem za praćenje. Možete pratiti status svoje narudžbe koristeći taj broj na web stranici kurirske službe. Također možete kontaktirati nas za ažuriranja o statusu vaše narudžbe.',
        },
        {
          id: 12,
          question: 'Šta ako nisam kući kada stigne dostava?',
          answer: 'Kurir će pokušati ostaviti poruku ili će kontaktirati vas putem telefona. Možete dogovoriti alternativni datum dostave ili preuzeti paket na najbližoj pošti/kurirskoj službi. Detalje ćete dobiti putem emaila ili telefona.',
        },
      ],
    },
    {
      id: 'povrati',
      title: 'Povrati i reklamacije',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      questions: [
        {
          id: 13,
          question: 'Kako mogu vratiti proizvod?',
          answer: 'Povrat proizvoda je moguć u roku od 14 dana od datuma isporuke. Kontaktirajte nas na info@kosnica.ba ili +387 33 123 456 da obavijestite o povratu. Proizvod mora biti netaknut, u originalnom pakovanju sa svim priloženim dokumentima i fakturom. Detaljne informacije dostupne su na stranici Dostava i povrati.',
        },
        {
          id: 14,
          question: 'Ko snosi troškove povrata?',
          answer: 'Troškove povrata snosi kupac, osim u slučaju greške na našoj strani (pogrešan proizvod, oštećen tokom transporta, itd.). U tim slučajevima, sve troškove snosimo mi.',
        },
        {
          id: 15,
          question: 'Kada ću dobiti povrat novca?',
          answer: 'Povrat novca se vrši na isti način kako je plaćanje izvršeno. Proces povrata novca traje 5-7 radnih dana nakon što primimo i provjerimo vraćeni proizvod. Kontaktiraćemo vas kada povrat bude izvršen.',
        },
        {
          id: 16,
          question: 'Mogu li zamijeniti proizvod umjesto povrata?',
          answer: 'Da, u slučaju da želite zamijeniti proizvod, kontaktirajte nas i rado ćemo vam pomoći. Zamjena je moguća ako proizvod koji želite zamijeniti nije na stanju, a proces je sličan kao kod povrata.',
        },
      ],
    },
    {
      id: 'proizvodi',
      title: 'Proizvodi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      questions: [
        {
          id: 17,
          question: 'Kako razlikovati različite vrste meda?',
          answer: 'Svaki med ima svoje karakteristike koje zavise od cvijeta ili biljke iz koje je napravljen. Na našoj stranici možete pronaći detaljne opise svakog proizvoda, uključujući boju, teksturu, ukus i ljekovita svojstva. Također, možete pročitati naše blogove o tipovima meda za više informacija.',
        },
        {
          id: 18,
          question: 'Kako čuvati med?',
          answer: 'Med treba čuvati na sobnoj temperaturi, u tamnom i suhom mjestu, dalje od direktne sunčeve svjetlosti. Ne stavljajte med u frižider jer može kristalizovati. Ako se med kristalizuje, to je znak kvaliteta - jednostavno ga stavite u toplu vodu da se rastopi.',
        },
        {
          id: 19,
          question: 'Koliko dugo traje med?',
          answer: 'Med ne može da "istekne" u tradicionalnom smislu zbog svoje prirodne konzervacijske svojstava. Ako se pravilno čuva, med može trajati godinama, čak i desetljećima. Kristalizacija je prirodan proces i ne utječe na kvalitet meda.',
        },
        {
          id: 20,
          question: 'Da li je med sertifikovan?',
          answer: 'Svi naši proizvodi dolaze direktno od provjerenih pčelara koji proizvode med prema zdravstvenim standardima. Naš tim provjerava kvalitet i dokumentaciju svakog proizvoda prije nego što bude dostupan za prodaju.',
        },
      ],
    },
    {
      id: 'pcelari',
      title: 'Pčelari i saradnja',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      questions: [
        {
          id: 21,
          question: 'Kako mogu postati pčelar na platformi?',
          answer: 'Ako ste pčelar zainteresovan za saradnju, možete nas kontaktirati putem forme na stranici "Postani pčelar" ili direktno na info@kosnica.ba. Naš tim će pregledati vašu prijavu i kontaktirati vas u najkraćem roku.',
        },
        {
          id: 22,
          question: 'Kako se provjerava kvalitet proizvoda?',
          answer: 'Naš tim provjerava sve pčelare i njihove proizvode prije dodavanja na platformu. Proizvodi moraju ispunjavati naše kriterije kvaliteta, zdravstvene standarde i moraju biti prirodni, bez dodataka. Redovno vršimo kontrole kvaliteta.',
        },
        {
          id: 23,
          question: 'Mogu li kontaktirati pčelara direktno?',
          answer: 'Na stranici svakog pčelara možete pronaći osnovne informacije o njima. Za direktne kontakt informacije ili detaljnije razgovore, kontaktirajte nas i mi ćemo vas povezati sa pčelarom.',
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
    setOpenQuestion(null);
  };

  const toggleQuestion = (questionId: number) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl pt-8">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Česta pitanja' },
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
              Česta pitanja
            </h1>
            <p
              className="text-xl max-md:text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Pronađite odgovore na najčešća pitanja o našim proizvodima, naručivanju, dostavi i još mnogo toga.
              Ako ne pronađete odgovor koji tražite, kontaktirajte nas.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="max-w-5xl mx-auto space-y-6">
            {faqCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{ borderColor: 'var(--border-light)' }}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left transition-colors"
                  style={{
                    backgroundColor: openCategory === category.id ? 'var(--blue-light)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (openCategory !== category.id) {
                      e.currentTarget.style.backgroundColor = 'var(--blue-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (openCategory !== category.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        backgroundColor: openCategory === category.id ? 'var(--blue-primary)' : 'var(--blue-light)',
                        color: openCategory === category.id ? 'white' : 'var(--blue-primary)',
                      }}
                    >
                      {category.icon}
                    </div>
                    <h2
                      className="text-2xl max-md:text-xl font-bold"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      {category.title}
                    </h2>
                  </div>
                  <svg
                    className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
                      openCategory === category.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--blue-primary)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Category Questions */}
                {openCategory === category.id && (
                  <div className="px-8 pt-6 pb-6 space-y-4">
                    {category.questions.map((faq) => (
                      <div
                        key={faq.id}
                        className="border rounded-lg overflow-hidden transition-all duration-300"
                        style={{ borderColor: 'var(--border-light)' }}
                      >
                        <button
                          onClick={() => toggleQuestion(faq.id)}
                          className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left transition-colors"
                          style={{
                            backgroundColor: openQuestion === faq.id ? 'var(--blue-light)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (openQuestion !== faq.id) {
                              e.currentTarget.style.backgroundColor = 'rgba(184, 144, 31, 0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (openQuestion !== faq.id) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <h3
                            className="text-lg font-semibold flex-1"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            {faq.question}
                          </h3>
                          <svg
                            className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                              openQuestion === faq.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: 'var(--blue-primary)' }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {openQuestion === faq.id && (
                          <div className="px-6 pt-6 pb-6">
                            <p
                              className="text-sm leading-relaxed"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--body-text)',
                              }}
                            >
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
            Niste pronašli odgovor koji tražite?
          </h2>
          <p
            className="text-lg mb-8"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Kontaktirajte nas i rado ćemo vam odgovoriti na sva vaša pitanja
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

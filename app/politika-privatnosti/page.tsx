'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';

export default function PrivacyPolicyPage() {
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
            { label: 'Politika privatnosti' },
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
              Politika privatnosti
            </h1>
            <p
              className="text-xl max-md:text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Poštujemo vašu privatnost i posvećeni smo zaštiti vaših ličnih podataka.
              Ova politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše informacije.
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

      {/* Privacy Policy Content */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl">
          <div className="space-y-8">
            {/* 1. Uvod */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                1. Uvod
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Košnica.ba (u daljem tekstu "mi", "nas", "naš") poštuje vašu privatnost i obaveštava vas o tome kako prikupljamo, koristimo, čuvamo i štitimo vaše lične podatke kada koristite našu web stranicu i usluge.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Ova politika privatnosti je u skladu sa Zakonom o zaštiti ličnih podataka Bosne i Hercegovine i Općom uredbom o zaštiti podataka (GDPR) za korisnike iz Evropske unije.
              </p>
            </div>

            {/* 2. Podaci koje prikupljamo */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                2. Podaci koje prikupljamo
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Prikupljamo sljedeće vrste podataka:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Lični podaci:</strong> ime, prezime, email adresa, broj telefona, adresa dostave, informacije o plaćanju.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Podaci o narudžbi:</strong> detalji narudžbe, istorija kupovine, preferencije proizvoda.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Tehnički podaci:</strong> IP adresa, tip pretraživača, operativni sistem, informacije o uređaju, cookies i slične tehnologije za praćenje.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Komunikacijski podaci:</strong> poruke koje nam šaljete, feedback, reklamacije, upiti za podršku.
                </li>
              </ul>
            </div>

            {/* 3. Kako prikupljamo podatke */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                3. Kako prikupljamo podatke
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Podatke prikupljamo na sljedeće načine:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Direktno od vas:</strong> kada kreirate račun, naručujete proizvode, kontaktirate nas ili se pretplatite na naš newsletter.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Automatski:</strong> kroz kolačiće (cookies), log fajlove i slične tehnologije kada posjećujete našu web stranicu.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Od trećih strana:</strong> od naših poslovnih partnera, pružalaca usluga plaćanja i kurirskih službi.
                </li>
              </ul>
            </div>

            {/* 4. Svrha prikupljanja podataka */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                4. Svrha prikupljanja podataka
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Koristimo vaše podatke za sljedeće svrhe:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Isporuku proizvoda i usluga koje naručujete.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Obradu i upravljanje vašim narudžbama, plaćanjima i povratima.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Komunikaciju sa vama u vezi sa narudžbama, upitima i podrškom.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Slanje marketing materijala (samo uz vašu privolu).
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Poboljšanje naših usluga, web stranice i korisničkog iskustva.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Sprječavanje prijevara i osiguranje sigurnosti naše platforme.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Ispunjenje zakonskih obaveza i zahtjeva.
                </li>
              </ul>
            </div>

            {/* 5. Pravni osnov za obradu */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                5. Pravni osnov za obradu podataka
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Obrađujemo vaše lične podatke na osnovu sljedećih pravnih osnova:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Izvršenje ugovora:</strong> potrebno je za izvršenje narudžbe i isporuku proizvoda.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Privola:</strong> za slanje marketing materijala i korištenje neobaveznih cookies.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Zakonska obaveza:</strong> za ispunjenje zakonskih zahtjeva, npr. fiskalne obaveze.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Opravdani interesi:</strong> za poboljšanje usluga, sigurnost i sprječavanje prijevara.
                </li>
              </ul>
            </div>

            {/* 6. Dijeljenje podataka */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                6. Dijeljenje podataka sa trećim stranama
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Vaše podatke možemo dijeliti sa sljedećim kategorijama trećih strana:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pružaoci usluga:</strong> kurirske službe, pružaoci usluga plaćanja, hosting i IT usluge.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pčelari:</strong> osnovni podaci (ime, adresa dostave) potrebni za isporuku proizvoda.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Zakonski zahtjevi:</strong> vlasti, sudovi ili regulatorna tijela kada je to zakonom propisano.
                </li>
              </ul>
              <p
                className="text-sm leading-relaxed mt-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Ne prodajemo vaše lične podatke trećim stranama za njihove marketinške svrhe.
              </p>
            </div>

            {/* 7. Sigurnost podataka */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                7. Sigurnost podataka
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Primjenjujemo odgovarajuće tehničke i organizacione mjere za zaštitu vaših ličnih podataka od neovlaštenog pristupa, gubitka, uništenja ili zloupotrebe, uključujući:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Enkripciju podataka tokom prijenosa (SSL/TLS).
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Ograničen pristup ličnim podacima samo autorizovanim osobama.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Redovne sigurnosne provjere i ažuriranja sistema.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Sigurno čuvanje podataka u enkriptovanim bazama podataka.
                </li>
              </ul>
            </div>

            {/* 8. Čuvanje podataka */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                8. Razdoblje čuvanja podataka
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Čuvamo vaše lične podatke samo onoliko dugo koliko je potrebno za svrhe za koje su prikupljeni:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Podaci o narudžbama: zadržavamo ih 10 godina nakon završetka narudžbe (fiskalna obaveza).
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Marketing podaci: dok ne povučete privolu ili tražite brisanje.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Tehnical podaci (cookies): prema vašim postavkama, obično do 24 mjeseca.
                </li>
              </ul>
            </div>

            {/* 9. Vaša prava */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                9. Vaša prava
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Imate sljedeća prava u vezi sa vašim ličnim podacima:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pravo na pristup:</strong> možete zatražiti kopiju vaših ličnih podataka koje čuvamo.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pravo na ispravku:</strong> možete zatražiti ispravku netačnih ili nepotpunih podataka.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pravo na brisanje:</strong> možete zatražiti brisanje vaših podataka u određenim okolnostima.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pravo na ograničenje obrade:</strong> možete zatražiti ograničenje obrade vaših podataka.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pravo na prenosivost:</strong> možete zatražiti prenos vaših podataka drugom pružaocu usluga.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pravo na prigovor:</strong> možete se usprotiviti obradi vaših podataka za određene svrhe.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Pravo na povlačenje privole:</strong> možete povući svoju privolu u bilo koje vrijeme.
                </li>
              </ul>
              <p
                className="text-sm leading-relaxed mt-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Za ostvarivanje ovih prava, kontaktirajte nas na: <a href="mailto:info@kosnica.ba" className="text-blue-600 hover:underline">info@kosnica.ba</a>
              </p>
            </div>

            {/* 10. Cookies */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                10. Cookies i slične tehnologije
              </h2>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Koristimo cookies i slične tehnologije za poboljšanje vašeg iskustva na našoj web stranici. Cookies su male tekstualne datoteke koje se čuvaju na vašem uređaju.
              </p>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Koristimo sljedeće vrste cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Obavezni cookies:</strong> neophodni za funkcionisanje web stranice.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Analitički cookies:</strong> pomažu nam razumjeti kako korisnici koriste našu stranicu.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Funkcionalni cookies:</strong> omogućavaju poboljšanu funkcionalnost i personalizaciju.
                </li>
                <li
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Marketinški cookies:</strong> koriste se za prikazivanje relevantnih oglasa (samo uz vašu privolu).
                </li>
              </ul>
              <p
                className="text-sm leading-relaxed mt-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Možete upravljati cookies postavkama u vašem pretraživaču. Imajte na umu da blokiranje određenih cookies može uticati na funkcionalnost web stranice.
              </p>
            </div>

            {/* 11. Linkovi ka trećim stranama */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                11. Linkovi ka trećim stranama
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Naša web stranica može sadržavati linkove ka web stranicama trećih strana. Ne snosimo odgovornost za politiku privatnosti ili praksu tih web stranica. Preporučujemo da pročitate politiku privatnosti svake web stranice koju posjećujete.
              </p>
            </div>

            {/* 12. Promjene u politici */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                12. Promjene u politici privatnosti
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Zadržavamo pravo da mijenjamo ovu politiku privatnosti u bilo koje vrijeme. Sve promjene će biti objavljene na ovoj stranici sa ažuriranim datumom. Preporučujemo da redovno provjeravate ovu stranicu kako biste bili upoznati sa našom politikom privatnosti.
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
                Ako imate pitanja, zahtjeve ili prigovore u vezi sa ovom politikom privatnosti ili našom obradom ličnih podataka, možete nas kontaktirati:
              </p>
              <div className="mt-4 space-y-2">
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Email:</strong> <a href="mailto:info@kosnica.ba" className="text-blue-600 hover:underline">info@kosnica.ba</a>
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Telefon:</strong> <a href="tel:+38733123456" className="text-blue-600 hover:underline">+387 33 123 456</a>
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  <strong>Adresa:</strong> Sarajevo, Bosna i Hercegovina
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            Imate pitanja o politici privatnosti?
          </h2>
          <p
            className="text-lg mb-8"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Kontaktirajte nas i rado ćemo odgovoriti na sva vaša pitanja
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

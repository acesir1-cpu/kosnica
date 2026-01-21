'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import blogData from '@/data/blog.json';

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  featuredImage: string;
  featured: boolean;
};

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const featuredPost = blogData.find((post: BlogPost) => post.featured) as BlogPost;
  const recentPosts = blogData.filter((post: BlogPost) => !post.featured);

  // Carousel navigation for recent posts
  const postsPerPage = 3;
  const totalPages = Math.ceil(recentPosts.length / postsPerPage);
  const startIndex = currentPage * postsPerPage;
  const displayedPosts = recentPosts.slice(startIndex, startIndex + postsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year}.`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 py-12 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Blog', href: undefined },
          ]}
        />

        {/* Featured Article Section */}
        {featuredPost && (
          <section className="mt-8 mb-16">
            <Link href={`/blog/${featuredPost.slug}`} className="block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                {/* Left Side - Image */}
                <div className="relative w-full h-[400px] lg:h-auto">
                  <Image
                    src={featuredPost.featuredImage}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>

                {/* Right Side - Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: 'var(--blue-light)',
                        color: 'var(--blue-primary)',
                      }}
                    >
                      {featuredPost.category}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--body-text)' }}>
                      {featuredPost.readTime} čitanje
                    </span>
                  </div>

                  <h1
                    className="text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {featuredPost.title}
                  </h1>

                  <p
                    className="text-lg mb-6 leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                      lineHeight: '1.7',
                    }}
                  >
                    {featuredPost.excerpt}
                  </p>

                  <div 
                    className="inline-flex items-center gap-2 text-base font-semibold transition-colors group" 
                    style={{ color: 'var(--blue-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--blue-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--blue-primary)';
                    }}
                  >
                    <span>Pročitaj više</span>
                    <svg
                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Recent Articles Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center lg:text-left">
              <h2
                className="text-4xl lg:text-5xl font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                  letterSpacing: '0.02em',
                }}
              >
                Naši nedavni članci
              </h2>
              <p
                className="text-lg"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Budite informisani sa našim najnovijim člancima
              </p>
            </div>
            {totalPages > 1 && (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={prevPage}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                  style={{ borderColor: 'var(--border-light)' }}
                  aria-label="Prethodni članci"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--dark-text)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextPage}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                  style={{ borderColor: 'var(--border-light)' }}
                  aria-label="Sledeći članci"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--dark-text)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPosts.map((post: BlogPost) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block h-full"
              >
                <article
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--honey-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: 'var(--honey-gold)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {post.author.name}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          color: 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <h3
                      className="text-xl font-bold mb-3 line-clamp-2"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {post.title}
                    </h3>
                    <p
                      className="text-sm mb-4 line-clamp-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                        lineHeight: '1.6',
                      }}
                    >
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-2">
                      <div 
                        className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group" 
                        style={{ color: 'var(--blue-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--blue-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--blue-primary)';
                        }}
                      >
                        <span>Pročitaj više</span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          {totalPages > 1 && (
            <div className="flex lg:hidden items-center justify-center gap-2 mt-8">
              <button
                onClick={prevPage}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)' }}
                aria-label="Prethodni članci"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--dark-text)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm" style={{ color: 'var(--body-text)' }}>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                style={{ borderColor: 'var(--border-light)' }}
                aria-label="Sledeći članci"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--dark-text)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

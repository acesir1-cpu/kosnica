'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import blogData from '@/data/blog.json';

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = blogData.find((p: BlogPost) => p.slug === slug) as BlogPost | undefined;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year}.`;
  };

  // Convert content to paragraphs (split by double newlines)
  const contentParagraphs = post?.content.split('\n\n') || [];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Članak nije pronađen
          </h1>
          <Link
            href={ROUTES.BLOG}
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--honey-gold)',
              color: 'white',
              fontFamily: 'var(--font-inter)',
            }}
          >
            Povratak na blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 py-12 max-w-4xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Blog', href: ROUTES.BLOG },
            { label: post.title, href: undefined },
          ]}
        />

        {/* Article Header */}
        <article className="mt-8">
          {/* Category and Read Time */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: 'var(--blue-light)',
                color: 'var(--blue-primary)',
              }}
            >
              {post.category}
            </span>
            <span className="text-sm" style={{ color: 'var(--body-text)' }}>
              {post.readTime} čitanje
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
              letterSpacing: '0.02em',
            }}
          >
            {post.title}
          </h1>

          {/* Author and Date */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
                sizes="48px"
                loading="lazy"
              />
            </div>
            <div>
              <div
                className="font-semibold"
                style={{
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {post.author.name}
              </div>
              <div
                className="text-sm"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {formatDate(post.date)}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden mb-8">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            {(() => {
              // Helper function to process text with bold formatting
              const processText = (text: string) => {
                if (!text) return [''];
                const parts: (string | React.ReactElement)[] = [];
                const boldRegex = /\*\*(.*?)\*\*/g;
                let lastIndex = 0;
                let match;
                let keyCounter = 0;

                while ((match = boldRegex.exec(text)) !== null) {
                  // Add text before bold
                  if (match.index > lastIndex) {
                    parts.push(text.substring(lastIndex, match.index));
                  }
                  // Add bold text
                  parts.push(
                    <strong
                      key={`bold-${keyCounter++}`}
                      style={{
                        fontWeight: 600,
                        color: 'var(--dark-text)',
                      }}
                    >
                      {match[1]}
                    </strong>
                  );
                  lastIndex = match.index + match[0].length;
                }
                // Add remaining text
                if (lastIndex < text.length) {
                  parts.push(text.substring(lastIndex));
                }
                return parts.length > 0 ? parts : [text];
              };

              return contentParagraphs.map((paragraph, index) => {
                // Check if paragraph is a heading (starts with ##)
                if (paragraph.startsWith('## ')) {
                  const headingText = paragraph.replace('## ', '');
                  return (
                    <h2
                      key={index}
                      className="text-3xl font-bold mt-8 mb-4"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {headingText}
                    </h2>
                  );
                }
                
                // Check if paragraph is a subheading (starts with ###)
                if (paragraph.startsWith('### ')) {
                  const subheadingText = paragraph.replace('### ', '');
                  return (
                    <h3
                      key={index}
                      className="text-2xl font-bold mt-6 mb-3"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {subheadingText}
                    </h3>
                  );
                }

                // Check if paragraph contains list items (lines starting with - or *)
                const lines = paragraph.split('\n');
                const listItems = lines.filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
                
                if (listItems.length > 0) {
                  // Check if there's text before the list
                  const textBeforeList = lines.slice(0, lines.indexOf(listItems[0])).join('\n').trim();
                  const hasTextBefore = textBeforeList.length > 0 && !textBeforeList.startsWith('##') && !textBeforeList.startsWith('###');
                  
                  return (
                    <div key={index} className="mb-6">
                      {hasTextBefore && (
                        <p
                          className="mb-3 leading-relaxed"
                          style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.8',
                          }}
                        >
                          {processText(textBeforeList)}
                        </p>
                      )}
                      <ul
                        className="ml-6 space-y-2"
                        style={{
                          listStyleType: 'disc',
                        }}
                      >
                        {listItems.map((item, itemIndex) => {
                          const itemText = item.replace(/^[-*]\s+/, '').trim();
                          return (
                            <li
                              key={itemIndex}
                              className="leading-relaxed"
                              style={{
                                fontSize: '1.125rem',
                                lineHeight: '1.8',
                              }}
                            >
                              {processText(itemText)}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                }

              return (
                <p
                  key={index}
                  className="mb-6 leading-relaxed"
                  style={{
                    fontSize: '1.125rem',
                    lineHeight: '1.8',
                  }}
                >
                  {processText(paragraph)}
                </p>
              );
              });
            })()}
          </div>

          {/* Back to Blog Link */}
          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <Link
              href={ROUTES.BLOG}
              className="inline-flex items-center gap-2 text-base font-semibold transition-colors group"
              style={{ color: 'var(--blue-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--blue-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--blue-primary)';
              }}
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Povratak na blog</span>
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}

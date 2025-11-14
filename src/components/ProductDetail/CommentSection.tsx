// components/CommentSection.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  verified: boolean;
  photo: string;
}

interface CommentSectionProps {
  initialReviews?: Review[];
  clearOnMount?: boolean;
}

const dummyReviews: Review[] = [
  { id: 1, name: "Dian Sastro", rating: 4, date: "2 bulan lalu", comment: "Kualitas bagus, cuma agak berat buat dipegang lama. Tapi worth it!", helpful: 4, verified: true, photo: "https://randomuser.me/api/portraits/women/22.jpg" },
  { id: 2, name: "Rina Wijaya", rating: 5, date: "2 minggu lalu", comment: "Desainnya cantik, transparan jadi keliatan isi minyaknya. Tuang juga gampang, nggak tumpah. Suka banget!", helpful: 18, verified: false, photo: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: 3, name: "Budi Santoso", rating: 5, date: "1 bulan lalu", comment: "Keren! Bisa spray tipis buat salad, bisa tuang buat masak. 2 in 1 beneran. Packing rapi, aman sampai.", helpful: 9, verified: true, photo: "https://randomuser.me/api/portraits/men/86.jpg" },
  { id: 4, name: "Laras", rating: 5, date: "1 bulan lalu", comment: "Suka banget! Spray-nya merata, nggak berantakan. Cocok buat air fryer juga.", helpful: 7, verified: true, photo: "https://randomuser.me/api/portraits/women/12.jpg" },
  { id: 5, name: "Ahmad Dani", rating: 4, date: "1 minggu lalu", comment: "Bagus, tapi nozzle-nya agak susah dibersihin kalo dipake buat minyak kelapa. Overall oke, worth it lah.", helpful: 5, verified: true, photo: "https://randomuser.me/api/portraits/men/32.jpg" },
];

const fullDummyReviews = Array(20).fill(null).map((_, i) => ({
  ...dummyReviews[i % 5],
  id: i + 1,
  name: dummyReviews[i % 5].name + (i >= 5 ? ` ${i}` : ''),
}));

const loadReviews = (): Review[] => {
  if (typeof window === 'undefined') return fullDummyReviews;
  const saved = localStorage.getItem('userReviews');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return fullDummyReviews;
    }
  }
  return fullDummyReviews;
};

const saveReviews = (reviews: Review[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userReviews', JSON.stringify(reviews));
};

export default function CommentSection({ 
  initialReviews = fullDummyReviews,
  clearOnMount = false
}: CommentSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === LOGIKA BARU: reviewsPerPage OTOMATIS NAIK ===
  const basePerPage = 5;
  const userCommentCount = reviews.filter(r => 
    !fullDummyReviews.find(d => d.id === r.id)
  ).length;
  const reviewsPerPage = basePerPage + userCommentCount;

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Load & Clear
  useEffect(() => {
    if (clearOnMount) {
      localStorage.removeItem('userReviews');
      setReviews(fullDummyReviews);
    } else {
      setReviews(loadReviews());
    }
  }, [clearOnMount]);

  // Save
  useEffect(() => {
    if (reviews.length > 0 && !clearOnMount) {
      saveReviews(reviews);
    }
  }, [reviews, clearOnMount]);

  const currentReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const handleLike = (id: number) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({
      top: document.querySelector('.comment-section')?.getBoundingClientRect().top! + window.scrollY - 100,
      behavior: 'smooth',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const newReview: Review = {
      id: Date.now(),
      name: name.trim(),
      rating,
      date: 'Baru saja',
      comment: comment.trim(),
      helpful: 0,
      verified: true,
      photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
    };

    setReviews(prev => [newReview, ...prev]);
    setName('');
    setComment('');
    setRating(5);
    setCurrentPage(1);

    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .comment-section {
          max-width: 1200px;
          margin: 28px;
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          animation: fadeInUp 0.6s ease;
        }
        @media (max-width: 768px) {
          .comment-section {
            margin: 18px;
            padding: 16px 16px;
            border-radius: 12px;
          }
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 20px;
          color: #1a1a1a;
        }

        .comment-form {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .form-group { margin-bottom: 12px; }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .form-textarea { min-height: 80px; resize: vertical; }

        .rating-input {
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }
        .star-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
        }
        .star-btn:hover { transform: scale(1.2); }
        .star-btn.active { color: #fbbf24; }

        .submit-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }
        .submit-btn:hover:not(:disabled) { background: #059669; }
        .submit-btn:disabled { background: #9ca3af; cursor: not-allowed; }

        .comment-list { display: flex; flex-direction: column; gap: 16px; }
        .comment-item {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 16px;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }
        .comment-item:nth-child(1) { animation-delay: 0.1s; }
        .comment-item:nth-child(2) { animation-delay: 0.2s; }
        .comment-item:nth-child(3) { animation-delay: 0.3s; }
        .comment-item:nth-child(4) { animation-delay: 0.4s; }
        .comment-item:nth-child(5) { animation-delay: 0.5s; }

        .comment-header { display: flex; align-items: flex-start; gap: 12px; }
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .user-info { flex: 1; }
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .verified-badge {
          background: #ecfdf5;
          color: #166534;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .rating-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #999;
          margin: 4px 0 8px;
        }
        .stars { color: #fbbf24; font-size: 13px; }
        .comment-text { font-size: 13px; color: #444; line-height: 1.6; margin: 0 0 8px; }
        .helpful-btn {
          background: none;
          border: none;
          color: #666;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .helpful-btn:hover, .helpful-btn.liked { color: #10b981; font-weight: 600; }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 24px;
          gap: 6px;
          flex-wrap: wrap;
        }
        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 12px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-btn:hover:not(:disabled) { background: #e5e7eb; }
        .page-btn.active { background: #10b981; color: white; border: none; font-weight: 600; }
        .page-btn:disabled { cursor: not-allowed; color: #9ca3af; background: #f9fafb; }

        @media (max-width: 480px) {
          .pagination { gap: 4px; }
          .page-btn { min-width: 32px; height: 32px; padding: 0 8px; font-size: 12px; }
          .page-btn.prev { padding: 0; width: 32px; }
          .page-btn.prev::before { content: '<'; font-weight: bold; }
          .page-btn.next { padding: 0; width: 32px; }
          .page-btn.next::before { content: '>'; font-weight: bold; }
          .page-btn.prev span, .page-btn.next span { display: none; }
        }
      `}</style>

      <div className="comment-section">
        <h2 className="section-title">KOMENTAR PEMBELI</h2>

        {/* FORM */}
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan nama Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  {rating >= star ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Komentar</label>
            <textarea
              className="form-textarea"
              placeholder="Tulis pengalaman Anda..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </form>

        {/* LIST */}
        <div className="comment-list">
          {currentReviews.map((review, index) => (
            <div
              key={review.id}
              className="comment-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="comment-header">
                <img src={review.photo} alt={review.name} className="user-avatar" />
                <div className="user-info">
                  <div className="user-name">
                    <span>{review.name}</span>
                    {review.verified && <span className="verified-badge">Verified</span>}
                  </div>
                  <div className="rating-date">
                    <span className="stars">
                      {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                    </span>
                    <span>{review.date}</span>
                  </div>
                  <p className="comment-text">{review.comment}</p>
                  <button
                    className={`helpful-btn ${review.helpful > 0 ? 'liked' : ''}`}
                    onClick={() => handleLike(review.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {reviews.length > reviewsPerPage && (
          <div className="pagination">
            <button className="page-btn prev" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : i + currentPage - 2;
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              );
            }).filter(Boolean)}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span style={{ padding: '8px 4px', color: '#666', fontSize: '13px' }}>...</span>
            )}

            {totalPages > 1 && currentPage < totalPages - 2 && (
              <button className="page-btn" onClick={() => goToPage(totalPages)}>
                {totalPages}
              </button>
            )}

            <button className="page-btn next" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <span>Selanjutnya</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}